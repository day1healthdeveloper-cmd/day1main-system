import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import {
  RegisterProviderDto,
  AddPracticeDto,
  VerifyCredentialDto,
  VerifyBankAccountDto,
  CreateContractDto,
  AssignNetworkDto,
  GrantAuthorisationDto,
} from './dto'

@Injectable()
export class ProvidersService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient()
  }

  async registerProvider(dto: RegisterProviderDto, userId: string) {
    const { data: existing } = await this.supabase
      .from('providers')
      .select('id')
      .eq('email', dto.email)
      .single()

    if (existing) {
      throw new ConflictException('Provider with this email already exists')
    }

    const providerNumber = await this.generateProviderNumber(dto.provider_type)

    const { data: provider, error } = await this.supabase
      .from('providers')
      .insert({
        provider_number: providerNumber,
        name: dto.name,
        provider_type: dto.provider_type,
        registration_num: dto.registration_num,
        email: dto.email,
        phone: dto.phone,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create provider')

    await this.auditService.logEvent({
      event_type: 'provider',
      entity_type: 'provider',
      entity_id: provider.id,
      user_id: userId,
      action: 'provider_registered',
      after_state: { provider_number: provider.provider_number, name: provider.name },
    })

    return provider
  }

  private async generateProviderNumber(providerType: string): Promise<string> {
    const typePrefix = { doctor: 'DOC', hospital: 'HOS', pharmacy: 'PHA', specialist: 'SPE' }[providerType] || 'PRV'
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const { count } = await this.supabase.getClient().from('providers').select('*', { count: 'exact', head: true })
    return `${typePrefix}${dateStr}${String((count || 0) + 1).padStart(3, '0')}`
  }

  async getProviderById(providerId: string) {
    const { data: provider, error } = await this.supabase
      .from('providers')
      .select(`*, practices:provider_practices(*), bank_accounts:provider_bank_accounts(*), credentials:provider_credentials(*), contracts:provider_contracts(*, tariff_schedule:tariff_schedules(*)), networks:provider_networks(*), authorisations:provider_authorisations(*)`)
      .eq('id', providerId)
      .single()

    if (error || !provider) throw new NotFoundException('Provider not found')
    return provider
  }

  async getProviders(providerType?: string, isActive?: boolean) {
    let query = this.supabase.getClient().from('providers').select('*')
    if (providerType) query = query.eq('provider_type', providerType)
    if (isActive !== undefined) query = query.eq('is_active', isActive)
    const { data } = await query.order('created_at', { ascending: false })
    return data || []
  }

  async addPractice(providerId: string, dto: AddPracticeDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: practice, error } = await this.supabase
      .from('provider_practices')
      .insert({
        provider_id: providerId,
        practice_name: dto.practice_name,
        practice_number: dto.practice_number,
        address_line1: dto.address_line1,
        address_line2: dto.address_line2,
        city: dto.city,
        province: dto.province,
        postal_code: dto.postal_code,
        phone: dto.phone,
        is_primary: dto.is_primary || false,
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to add practice')

    await this.auditService.logEvent({
      event_type: 'provider', entity_type: 'provider_practice', entity_id: practice.id,
      user_id: userId, action: 'practice_added', metadata: { provider_id: providerId },
    })
    return practice
  }

  async verifyCredential(providerId: string, dto: VerifyCredentialDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: existing } = await this.supabase
      .from('provider_credentials')
      .select('id')
      .eq('provider_id', providerId)
      .eq('credential_number', dto.credential_number)
      .single()

    if (existing) throw new ConflictException('Credential already verified')

    const { data: credential, error } = await this.supabase
      .from('provider_credentials')
      .insert({
        provider_id: providerId,
        credential_type: dto.credential_type,
        credential_number: dto.credential_number,
        issuing_body: dto.issuing_body,
        issue_date: new Date(dto.issue_date).toISOString(),
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date).toISOString() : null,
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to verify credential')

    await this.auditService.logEvent({
      event_type: 'provider', entity_type: 'provider_credential', entity_id: credential.id,
      user_id: userId, action: 'credential_verified', metadata: { provider_id: providerId },
    })
    return credential
  }

  async verifyBankAccount(providerId: string, dto: VerifyBankAccountDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: bankAccount, error } = await this.supabase
      .from('provider_bank_accounts')
      .insert({ provider_id: providerId, bank_name: dto.bank_name, account_number: dto.account_number, branch_code: dto.branch_code, account_type: dto.account_type, is_verified: true, verified_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to verify bank account')
    await this.auditService.logEvent({ event_type: 'provider', entity_type: 'provider_bank_account', entity_id: bankAccount.id, user_id: userId, action: 'bank_account_verified', metadata: { provider_id: providerId } })
    return bankAccount
  }

  async createContract(providerId: string, dto: CreateContractDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: contract, error } = await this.supabase
      .from('provider_contracts')
      .insert({ provider_id: providerId, contract_type: dto.contract_type, tariff_schedule_id: dto.tariff_schedule_id, effective_date: new Date(dto.effective_date).toISOString(), end_date: dto.end_date ? new Date(dto.end_date).toISOString() : null, status: 'active' })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create contract')
    await this.auditService.logEvent({ event_type: 'provider', entity_type: 'provider_contract', entity_id: contract.id, user_id: userId, action: 'contract_created', metadata: { provider_id: providerId } })
    return contract
  }

  async assignNetwork(providerId: string, dto: AssignNetworkDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: network, error } = await this.supabase
      .from('provider_networks')
      .insert({ provider_id: providerId, network_id: dto.network_id, tier: dto.tier, effective_date: new Date(dto.effective_date).toISOString() })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to assign network')
    await this.auditService.logEvent({ event_type: 'provider', entity_type: 'provider_network', entity_id: network.id, user_id: userId, action: 'network_assigned', metadata: { provider_id: providerId } })
    return network
  }

  async grantAuthorisation(providerId: string, dto: GrantAuthorisationDto, userId: string) {
    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', providerId).single()
    if (!provider) throw new NotFoundException('Provider not found')

    const { data: auth, error } = await this.supabase
      .from('provider_authorisations')
      .insert({ provider_id: providerId, authorisation_type: dto.authorisation_type, scope: dto.scope, granted_by: userId, granted_at: new Date().toISOString(), expires_at: dto.expires_at ? new Date(dto.expires_at).toISOString() : null })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to grant authorisation')
    await this.auditService.logEvent({ event_type: 'provider', entity_type: 'provider_authorisation', entity_id: auth.id, user_id: userId, action: 'authorisation_granted', metadata: { provider_id: providerId } })
    return auth
  }

  async revokeAuthorisation(authorisationId: string, userId: string) {
    const { data: auth } = await this.supabase.getClient().from('provider_authorisations').select('*').eq('id', authorisationId).single()
    if (!auth) throw new NotFoundException('Authorisation not found')

    const { data: updated, error } = await this.supabase
      .from('provider_authorisations')
      .update({ revoked_at: new Date().toISOString(), revoked_by: userId })
      .eq('id', authorisationId)
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to revoke authorisation')
    await this.auditService.logEvent({ event_type: 'provider', entity_type: 'provider_authorisation', entity_id: authorisationId, user_id: userId, action: 'authorisation_revoked', metadata: { provider_id: auth.provider_id } })
    return updated
  }
}
