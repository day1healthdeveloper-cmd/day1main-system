import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { RegisterMemberDto, UpdateMemberDto, AddDependantDto, CaptureConsentDto } from './dto'

@Injectable()
export class MembersService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient()
  }

  /**
   * Register a new member
   */
  async registerMember(dto: RegisterMemberDto, userId: string) {
    const { data: existing } = await this.supabase
      .from('members')
      .select('id')
      .eq('id_number', dto.id_number)
      .single()

    if (existing) {
      throw new ConflictException('Member with this ID number already exists')
    }

    if (!this.validateSAIdNumber(dto.id_number)) {
      throw new BadRequestException('Invalid South African ID number format')
    }

    const { data: member, error } = await this.supabase
      .from('members')
      .insert({
        id_number: dto.id_number,
        first_name: dto.first_name,
        last_name: dto.last_name,
        date_of_birth: new Date(dto.date_of_birth).toISOString(),
        gender: dto.gender,
        email: dto.email,
        phone: dto.phone,
        kyc_status: 'pending',
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create member')

    // Create contacts
    await this.supabase.getClient().from('member_contacts').insert([
      { member_id: member.id, contact_type: 'email', contact_value: dto.email, is_primary: true },
      { member_id: member.id, contact_type: 'mobile', contact_value: dto.phone, is_primary: true },
    ])

    // Create address if provided
    if (dto.address) {
      await this.supabase.getClient().from('member_addresses').insert({
        member_id: member.id,
        address_type: 'residential',
        line1: dto.address.line1,
        line2: dto.address.line2,
        city: dto.address.city,
        province: dto.address.province,
        postal_code: dto.address.postal_code,
        country: dto.address.country || 'ZA',
        is_primary: true,
      })
    }

    // Create status history
    await this.supabase.getClient().from('member_status_history').insert({
      member_id: member.id,
      status: 'active',
      reason: 'Initial registration',
      changed_by: userId,
    })

    await this.auditService.logEvent({
      event_type: 'member',
      entity_type: 'member',
      entity_id: member.id,
      user_id: userId,
      action: 'member_registered',
      after_state: { id_number: member.id_number, name: `${member.first_name} ${member.last_name}` },
      metadata: { registration_method: 'api' },
    })

    return member
  }

  /**
   * Update member information
   */
  async updateMember(memberId: string, dto: UpdateMemberDto, userId: string) {
    const { data: member, error: fetchError } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (fetchError || !member) {
      throw new NotFoundException('Member not found')
    }

    const { data: updated, error } = await this.supabase
      .from('members')
      .update({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone,
      })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to update member')

    await this.auditService.logEvent({
      event_type: 'member',
      entity_type: 'member',
      entity_id: memberId,
      user_id: userId,
      action: 'member_updated',
      before_state: { first_name: member.first_name, last_name: member.last_name, email: member.email, phone: member.phone },
      after_state: { first_name: updated.first_name, last_name: updated.last_name, email: updated.email, phone: updated.phone },
    })

    return updated
  }

  /**
   * Get member by ID
   */
  async getMember(memberId: string) {
    const { data: member, error } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (error || !member) {
      throw new NotFoundException('Member not found')
    }

    // Fetch related data
    const [contacts, addresses, dependants, consents] = await Promise.all([
      this.supabase.getClient().from('member_contacts').select('*').eq('member_id', memberId),
      this.supabase.getClient().from('member_addresses').select('*').eq('member_id', memberId),
      this.supabase.getClient().from('member_dependants').select('*').eq('member_id', memberId),
      this.supabase.getClient().from('member_consents').select('*').eq('member_id', memberId).is('revoked_at', null),
    ])

    return { ...member, contacts: contacts.data, addresses: addresses.data, dependants: dependants.data, consents: consents.data }
  }

  /**
   * Add a dependant to a member
   */
  async addDependant(memberId: string, dto: AddDependantDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('id').eq('id', memberId).single()

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    if (!this.validateSAIdNumber(dto.id_number)) {
      throw new BadRequestException('Invalid South African ID number format')
    }

    const { data: dependant, error } = await this.supabase
      .from('member_dependants')
      .insert({
        member_id: memberId,
        id_number: dto.id_number,
        first_name: dto.first_name,
        last_name: dto.last_name,
        date_of_birth: new Date(dto.date_of_birth).toISOString(),
        gender: dto.gender,
        relationship: dto.relationship,
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to add dependant')

    await this.auditService.logEvent({
      event_type: 'member',
      entity_type: 'member_dependant',
      entity_id: dependant.id,
      user_id: userId,
      action: 'dependant_added',
      metadata: { member_id: memberId, dependant_name: `${dto.first_name} ${dto.last_name}`, relationship: dto.relationship },
    })

    return dependant
  }

  /**
   * Capture consent (POPIA compliance)
   */
  async captureConsent(memberId: string, dto: CaptureConsentDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('id').eq('id', memberId).single()

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    const { data: consent, error } = await this.supabase
      .from('member_consents')
      .insert({
        member_id: memberId,
        consent_type: dto.consent_type,
        purpose: dto.purpose,
        is_granted: dto.is_granted,
        granted_at: dto.is_granted ? new Date().toISOString() : null,
        expires_at: dto.expires_at ? new Date(dto.expires_at).toISOString() : null,
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to capture consent')

    await this.auditService.logEvent({
      event_type: 'popia',
      entity_type: 'member_consent',
      entity_id: consent.id,
      user_id: userId,
      action: dto.is_granted ? 'consent_granted' : 'consent_denied',
      metadata: { member_id: memberId, consent_type: dto.consent_type, purpose: dto.purpose },
    })

    return consent
  }

  /**
   * Revoke consent
   */
  async revokeConsent(consentId: string, userId: string) {
    const { data: consent } = await this.supabase.getClient().from('member_consents').select('*').eq('id', consentId).single()

    if (!consent) {
      throw new NotFoundException('Consent not found')
    }

    const { data: updated, error } = await this.supabase
      .from('member_consents')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', consentId)
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to revoke consent')

    await this.auditService.logEvent({
      event_type: 'popia',
      entity_type: 'member_consent',
      entity_id: consentId,
      user_id: userId,
      action: 'consent_revoked',
      metadata: { member_id: consent.member_id, consent_type: consent.consent_type },
    })

    return updated
  }

  /**
   * Get member consents
   */
  async getMemberConsents(memberId: string) {
    const { data } = await this.supabase
      .from('member_consents')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    return data || []
  }

  /**
   * Upload member document
   */
  async uploadDocument(
    memberId: string,
    documentType: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    userId: string,
  ) {
    const { data: document, error } = await this.supabase
      .from('member_documents')
      .insert({
        member_id: memberId,
        document_type: documentType,
        document_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        uploaded_by: userId,
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to upload document')

    await this.auditService.logEvent({
      event_type: 'member',
      entity_type: 'member_document',
      entity_id: document.id,
      user_id: userId,
      action: 'document_uploaded',
      metadata: { member_id: memberId, document_type: documentType, file_name: fileName },
    })

    return document
  }

  /**
   * List members with pagination
   */
  async listMembers(skip: number = 0, take: number = 50) {
    const { data: members, count } = await this.supabase
      .from('members')
      .select('*', { count: 'exact' })
      .range(skip, skip + take - 1)
      .order('created_at', { ascending: false })

    const total = count || 0

    return {
      members: members || [],
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    }
  }

  /**
   * Validate South African ID number format
   */
  private validateSAIdNumber(idNumber: string): boolean {
    if (!/^\d{13}$/.test(idNumber)) {
      return false
    }
    const month = parseInt(idNumber.substring(2, 4), 10)
    const day = parseInt(idNumber.substring(4, 6), 10)
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false
    }
    return true
  }
}
