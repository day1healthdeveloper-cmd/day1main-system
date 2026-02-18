import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { PoliciesService } from '../policies/policies.service'

export interface PreAuthRequest {
  id: string
  preauth_number: string
  policy_id: string
  member_id: string
  provider_id: string
  service_type: string
  diagnosis_code: string
  procedure_codes: string[]
  estimated_cost: number
  status: string
  submitted_at: Date
}

export interface PreAuthDecision {
  id: string
  preauth_id: string
  decision: 'approved' | 'rejected' | 'more_info_needed'
  approved_amount?: number
  conditions?: any
  expiry_date?: Date
  decided_at: Date
  decided_by: string
}

@Injectable()
export class PreAuthService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private policiesService: PoliciesService,
  ) {}

  async submitPreAuthRequest(policyId: string, memberId: string, providerId: string, serviceType: string, diagnosisCode: string, procedureCodes: string[], estimatedCost: number, userId: string): Promise<PreAuthRequest> {
    const coverage = await this.policiesService.checkMemberCoverage(memberId)
    if (!coverage.has_coverage) throw new BadRequestException('Member does not have active coverage')

    const { data: policy } = await this.supabase.getClient().from('policies').select('*').eq('id', policyId).single()
    if (!policy || policy.status !== 'active') throw new BadRequestException('Policy is not active')

    const preauthNumber = await this.generatePreAuthNumber()

    const { data: preauth, error } = await this.supabase
      .from('preauth_requests')
      .insert({ preauth_number: preauthNumber, policy_id: policyId, member_id: memberId, provider_id: providerId, service_type: serviceType, diagnosis_code: diagnosisCode, procedure_codes: procedureCodes, estimated_cost: estimatedCost, status: 'pending' })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create pre-auth request')

    await this.auditService.logEvent({ event_type: 'preauth', entity_type: 'preauth_request', entity_id: preauth.id, user_id: userId, action: 'preauth_submitted', metadata: { preauth_number: preauthNumber, policy_id: policyId } })

    return { id: preauth.id, preauth_number: preauth.preauth_number, policy_id: preauth.policy_id, member_id: preauth.member_id, provider_id: preauth.provider_id, service_type: preauth.service_type, diagnosis_code: preauth.diagnosis_code, procedure_codes: preauth.procedure_codes, estimated_cost: parseFloat(preauth.estimated_cost), status: preauth.status, submitted_at: preauth.submitted_at }
  }

  private async generatePreAuthNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const { count } = await this.supabase.getClient().from('preauth_requests').select('*', { count: 'exact', head: true }).gte('submitted_at', startOfDay)
    return `PA-${dateStr}-${((count || 0) + 1).toString().padStart(6, '0')}`
  }

  async approvePreAuth(preauthId: string, approvedAmount: number, conditions: any, expiryDate: Date, userId: string): Promise<PreAuthDecision> {
    const { data: preauth } = await this.supabase.getClient().from('preauth_requests').select('*').eq('id', preauthId).single()
    if (!preauth) throw new NotFoundException('Pre-auth request not found')
    if (preauth.status !== 'pending') throw new BadRequestException('Pre-auth request has already been decided')

    const { data: decision, error } = await this.supabase.getClient().from('preauth_decisions').insert({ preauth_id: preauthId, decision: 'approved', approved_amount: approvedAmount, conditions, expiry_date: expiryDate.toISOString(), decided_by: userId }).select().single()
    if (error) throw new BadRequestException('Failed to create decision')

    await this.supabase.getClient().from('preauth_requests').update({ status: 'approved' }).eq('id', preauthId)
    await this.auditService.logEvent({ event_type: 'preauth', entity_type: 'preauth_request', entity_id: preauthId, user_id: userId, action: 'preauth_approved', metadata: { preauth_number: preauth.preauth_number, approved_amount: approvedAmount.toString() } })

    return { id: decision.id, preauth_id: decision.preauth_id, decision: 'approved', approved_amount: parseFloat(decision.approved_amount), conditions: decision.conditions, expiry_date: new Date(decision.expiry_date), decided_at: decision.decided_at, decided_by: decision.decided_by }
  }

  async rejectPreAuth(preauthId: string, reason: string, userId: string): Promise<PreAuthDecision> {
    const { data: preauth } = await this.supabase.getClient().from('preauth_requests').select('*').eq('id', preauthId).single()
    if (!preauth) throw new NotFoundException('Pre-auth request not found')
    if (preauth.status !== 'pending') throw new BadRequestException('Pre-auth request has already been decided')

    const { data: decision, error } = await this.supabase.getClient().from('preauth_decisions').insert({ preauth_id: preauthId, decision: 'rejected', conditions: { reason }, decided_by: userId }).select().single()
    if (error) throw new BadRequestException('Failed to create decision')

    await this.supabase.getClient().from('preauth_requests').update({ status: 'rejected' }).eq('id', preauthId)
    await this.auditService.logEvent({ event_type: 'preauth', entity_type: 'preauth_request', entity_id: preauthId, user_id: userId, action: 'preauth_rejected', metadata: { preauth_number: preauth.preauth_number, reason } })

    return { id: decision.id, preauth_id: decision.preauth_id, decision: 'rejected', conditions: decision.conditions, decided_at: decision.decided_at, decided_by: decision.decided_by }
  }

  async getPreAuthById(preauthId: string): Promise<PreAuthRequest> {
    const { data: preauth } = await this.supabase.getClient().from('preauth_requests').select('*').eq('id', preauthId).single()
    if (!preauth) throw new NotFoundException('Pre-auth request not found')
    return { id: preauth.id, preauth_number: preauth.preauth_number, policy_id: preauth.policy_id, member_id: preauth.member_id, provider_id: preauth.provider_id, service_type: preauth.service_type, diagnosis_code: preauth.diagnosis_code, procedure_codes: preauth.procedure_codes, estimated_cost: parseFloat(preauth.estimated_cost), status: preauth.status, submitted_at: preauth.submitted_at }
  }

  async getPreAuthsByStatus(status: string): Promise<PreAuthRequest[]> {
    const { data } = await this.supabase.getClient().from('preauth_requests').select('*').eq('status', status).order('submitted_at', { ascending: false })
    return (data || []).map((p) => ({ id: p.id, preauth_number: p.preauth_number, policy_id: p.policy_id, member_id: p.member_id, provider_id: p.provider_id, service_type: p.service_type, diagnosis_code: p.diagnosis_code, procedure_codes: p.procedure_codes, estimated_cost: parseFloat(p.estimated_cost), status: p.status, submitted_at: p.submitted_at }))
  }

  async getPreAuthsByMember(memberId: string): Promise<PreAuthRequest[]> {
    const { data } = await this.supabase.getClient().from('preauth_requests').select('*').eq('member_id', memberId).order('submitted_at', { ascending: false })
    return (data || []).map((p) => ({ id: p.id, preauth_number: p.preauth_number, policy_id: p.policy_id, member_id: p.member_id, provider_id: p.provider_id, service_type: p.service_type, diagnosis_code: p.diagnosis_code, procedure_codes: p.procedure_codes, estimated_cost: parseFloat(p.estimated_cost), status: p.status, submitted_at: p.submitted_at }))
  }

  async getClinicalReviewQueue(): Promise<PreAuthRequest[]> {
    return this.getPreAuthsByStatus('pending')
  }
}
