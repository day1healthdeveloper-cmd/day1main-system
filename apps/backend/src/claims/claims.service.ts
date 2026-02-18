import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { PoliciesService } from '../policies/policies.service'
import { SubmitClaimDto } from './dto'

@Injectable()
export class ClaimsService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private policiesService: PoliciesService,
  ) {}

  async submitClaim(dto: SubmitClaimDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('id').eq('id', dto.member_id).single()
    if (!member) throw new NotFoundException('Member not found')

    const { data: provider } = await this.supabase.getClient().from('providers').select('id').eq('id', dto.provider_id).single()
    if (!provider) throw new NotFoundException('Provider not found')

    await this.validateMemberEligibility(dto.member_id, dto.service_date)
    await this.validateWaitingPeriods(dto.member_id, dto.diagnosis_code, dto.service_date)
    await this.validateExclusions(dto.member_id, dto.diagnosis_code, dto.procedure_codes)
    await this.validateClinicalCodes(dto.diagnosis_code, dto.procedure_codes)

    const claimNumber = await this.generateClaimNumber()

    const { data: claim, error } = await this.supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        member_id: dto.member_id,
        provider_id: dto.provider_id,
        policy_id: dto.policy_id,
        service_date: new Date(dto.service_date).toISOString(),
        total_claimed: dto.claim_amount,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create claim')

    // Create claim lines
    for (const line of dto.claim_lines) {
      await this.supabase.getClient().from('claim_lines').insert({
        claim_id: claim.id,
        icd10_code: dto.diagnosis_code,
        procedure_code: line.procedure_code,
        tariff_code: line.procedure_code,
        quantity: line.quantity,
        amount_claimed: line.line_amount,
      })
    }

    // Create status history
    await this.supabase.getClient().from('claim_status_history').insert({
      claim_id: claim.id,
      status: 'submitted',
      reason: 'Claim submitted',
      changed_by: userId,
    })

    await this.auditService.logEvent({
      event_type: 'claim',
      entity_type: 'claim',
      entity_id: claim.id,
      user_id: userId,
      action: 'claim_submitted',
      after_state: { claim_number: claim.claim_number, member_id: dto.member_id, provider_id: dto.provider_id },
    })

    return claim
  }

  private async validateMemberEligibility(memberId: string, serviceDate: string): Promise<void> {
    const serviceDateObj = new Date(serviceDate).toISOString()

    const { data: policyMembers } = await this.supabase
      .from('policy_members')
      .select('*, policy:policies(*)')
      .eq('member_id', memberId)

    const activePolicy = (policyMembers || []).find(pm => 
      pm.policy?.status === 'active' && 
      pm.policy?.start_date <= serviceDateObj &&
      (!pm.policy?.end_date || pm.policy?.end_date >= serviceDateObj)
    )

    if (!activePolicy) {
      throw new BadRequestException('Member does not have active policy coverage for the service date')
    }
  }

  private async validateWaitingPeriods(memberId: string, diagnosisCode: string, serviceDate: string): Promise<void> {
    const serviceDateObj = new Date(serviceDate)

    const { data: policyMember } = await this.supabase
      .from('policy_members')
      .select('*, policy:policies(*, plan:plans(*))')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!policyMember) throw new BadRequestException('Member policy not found')

    const waitingPeriodDays = policyMember.policy?.plan?.waiting_period_days || 0
    if (waitingPeriodDays > 0) {
      const coverStartDate = new Date(policyMember.cover_start_date)
      const daysSinceCoverStart = Math.floor((serviceDateObj.getTime() - coverStartDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCoverStart < waitingPeriodDays) {
        throw new BadRequestException(`Waiting period of ${waitingPeriodDays} days not satisfied.`)
      }
    }
  }

  private async validateExclusions(memberId: string, diagnosisCode: string, procedureCodes: string[]): Promise<void> {
    const { data: policyMember } = await this.supabase
      .from('policy_members')
      .select('policy_id')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!policyMember) return

    const { data: policy } = await this.supabase
      .from('policies')
      .select('plan_id')
      .eq('id', policyMember.policy_id)
      .single()

    if (!policy) return

    const { data: benefits } = await this.supabase
      .from('plan_benefits')
      .select('id')
      .eq('plan_id', policy.plan_id)

    if (!benefits || benefits.length === 0) return

    const benefitIds = benefits.map(b => b.id)
    const { data: exclusions } = await this.supabase
      .from('benefit_exclusions')
      .select('*')
      .in('benefit_id', benefitIds)

    if (!exclusions) return

    const diagnosisExcluded = exclusions.some(e => e.exclusion_type === 'diagnosis' && e.exclusion_code === diagnosisCode)
    if (diagnosisExcluded) throw new BadRequestException(`Diagnosis ${diagnosisCode} is excluded from coverage`)

    const procedureExcluded = exclusions.some(e => e.exclusion_type === 'procedure' && procedureCodes.includes(e.exclusion_code))
    if (procedureExcluded) throw new BadRequestException('One or more procedures are excluded from coverage')
  }

  private async validateClinicalCodes(diagnosisCode: string, procedureCodes: string[]): Promise<void> {
    const { data: diagnosis } = await this.supabase
      .from('clinical_codes')
      .select('id')
      .eq('code', diagnosisCode)
      .eq('code_type', 'ICD10')
      .single()

    if (!diagnosis) throw new BadRequestException(`Invalid ICD-10 diagnosis code: ${diagnosisCode}`)

    for (const procCode of procedureCodes) {
      const { data: procedure } = await this.supabase
        .from('clinical_codes')
        .select('id')
        .eq('code', procCode)
        .in('code_type', ['CPT', 'PROCEDURE', 'TARIFF'])
        .single()

      if (!procedure) throw new BadRequestException(`Invalid procedure code: ${procCode}`)
    }
  }

  private async generateClaimNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

    const { count } = await this.supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    const sequence = ((count || 0) + 1).toString().padStart(6, '0')
    return `CLM-${dateStr}-${sequence}`
  }


  async getClaimById(claimId: string) {
    const { data: claim, error } = await this.supabase.getClient().from('claims').select('*').eq('id', claimId).single()
    if (error || !claim) throw new NotFoundException('Claim not found')

    const [memberRes, providerRes, policyRes, linesRes, historyRes] = await Promise.all([
      this.supabase.getClient().from('members').select('*').eq('id', claim.member_id).single(),
      this.supabase.getClient().from('providers').select('*').eq('id', claim.provider_id).single(),
      this.supabase.getClient().from('policies').select('*').eq('id', claim.policy_id).single(),
      this.supabase.getClient().from('claim_lines').select('*').eq('claim_id', claimId),
      this.supabase.getClient().from('claim_status_history').select('*').eq('claim_id', claimId).order('changed_at', { ascending: false }),
    ])

    return { ...claim, member: memberRes.data, provider: providerRes.data, policy: policyRes.data, claim_lines: linesRes.data, status_history: historyRes.data }
  }

  async getClaimsByMember(memberId: string) {
    const { data } = await this.supabase
      .from('claims')
      .select('*, provider:providers(*), claim_lines(*)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    return data || []
  }

  async getClaimsByProvider(providerId: string) {
    const { data } = await this.supabase
      .from('claims')
      .select('*, member:members(*), claim_lines(*)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    return data || []
  }

  async getClaimsByStatus(status: string) {
    const { data } = await this.supabase
      .from('claims')
      .select('*, member:members(*), provider:providers(*), claim_lines(*)')
      .eq('status', status)
      .order('created_at', { ascending: false })

    return data || []
  }

  async getClaimStatusHistory(claimId: string) {
    const { data: claim } = await this.supabase.getClient().from('claims').select('id').eq('id', claimId).single()
    if (!claim) throw new NotFoundException('Claim not found')

    const { data } = await this.supabase
      .from('claim_status_history')
      .select('*')
      .eq('claim_id', claimId)
      .order('changed_at', { ascending: false })

    return data || []
  }
}
