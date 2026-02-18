import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { CreatePolicyDto, UpdatePolicyStatusDto, CreateEndorsementDto } from './dto'

@Injectable()
export class PoliciesService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient()
  }

  /**
   * Create a new policy
   */
  async createPolicy(dto: CreatePolicyDto, userId: string) {
    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select('*, product:products(*)')
      .eq('id', dto.plan_id)
      .single()

    if (planError || !plan) {
      throw new NotFoundException('Plan not found')
    }

    const memberIds = dto.members.map((m) => m.member_id)
    const { data: members } = await this.supabase
      .from('members')
      .select('id')
      .in('id', memberIds)

    if (!members || members.length !== memberIds.length) {
      throw new BadRequestException('One or more members not found')
    }

    const hasPrincipal = dto.members.some((m) => m.relationship === 'principal')
    if (!hasPrincipal) {
      throw new BadRequestException('Policy must have at least one principal member')
    }

    const policyNumber = await this.generatePolicyNumber(dto.regime)

    const { data: newPolicy, error: policyError } = await this.supabase
      .from('policies')
      .insert({
        policy_number: policyNumber,
        plan_id: dto.plan_id,
        regime: dto.regime,
        status: 'pending',
        start_date: new Date(dto.start_date).toISOString(),
        end_date: dto.end_date ? new Date(dto.end_date).toISOString() : null,
        premium: dto.premium,
        billing_frequency: dto.billing_frequency,
        broker_id: dto.broker_id,
      })
      .select()
      .single()

    if (policyError) throw new BadRequestException('Failed to create policy')

    // Create policy members
    for (const memberDto of dto.members) {
      const coverStartDate = this.calculateCoverStartDate(new Date(memberDto.cover_start_date), plan.waiting_period_days)
      await this.supabase.getClient().from('policy_members').insert({
        policy_id: newPolicy.id,
        member_id: memberDto.member_id,
        relationship: memberDto.relationship,
        cover_start_date: coverStartDate.toISOString(),
        cover_end_date: memberDto.cover_end_date ? new Date(memberDto.cover_end_date).toISOString() : null,
      })
    }

    // Create initial status history
    await this.supabase.getClient().from('policy_status_history').insert({
      policy_id: newPolicy.id,
      status: 'pending',
      reason: 'Policy created',
      changed_by: userId,
    })

    await this.auditService.logEvent({
      event_type: 'policy',
      entity_type: 'policy',
      entity_id: newPolicy.id,
      user_id: userId,
      action: 'policy_created',
      after_state: { policy_number: newPolicy.policy_number, plan_id: newPolicy.plan_id, regime: newPolicy.regime },
    })

    return newPolicy
  }

  /**
   * Get policy by ID with full details
   */
  async getPolicyById(policyId: string) {
    const { data: policy, error } = await this.supabase
      .from('policies')
      .select('*')
      .eq('id', policyId)
      .single()

    if (error || !policy) {
      throw new NotFoundException('Policy not found')
    }

    const [planRes, membersRes, historyRes, endorsementsRes] = await Promise.all([
      this.supabase.getClient().from('plans').select('*, product:products(*)').eq('id', policy.plan_id).single(),
      this.supabase.getClient().from('policy_members').select('*, member:members(*)').eq('policy_id', policyId),
      this.supabase.getClient().from('policy_status_history').select('*').eq('policy_id', policyId).order('changed_at', { ascending: false }),
      this.supabase.getClient().from('endorsements').select('*').eq('policy_id', policyId).order('effective_date', { ascending: false }),
    ])

    return { ...policy, plan: planRes.data, policy_members: membersRes.data, status_history: historyRes.data, endorsements: endorsementsRes.data }
  }

  /**
   * Update policy status
   */
  async updatePolicyStatus(policyId: string, dto: UpdatePolicyStatusDto, userId: string) {
    const { data: policy, error } = await this.supabase.getClient().from('policies').select('*').eq('id', policyId).single()

    if (error || !policy) {
      throw new NotFoundException('Policy not found')
    }

    this.validateStatusTransition(policy.status, dto.status)

    const { data: updated, error: updateError } = await this.supabase
      .from('policies')
      .update({ status: dto.status })
      .eq('id', policyId)
      .select()
      .single()

    if (updateError) throw new BadRequestException('Failed to update policy status')

    await this.supabase.getClient().from('policy_status_history').insert({
      policy_id: policyId,
      status: dto.status,
      reason: dto.reason,
      changed_by: userId,
    })

    await this.auditService.logEvent({
      event_type: 'policy',
      entity_type: 'policy',
      entity_id: policyId,
      user_id: userId,
      action: 'policy_status_changed',
      before_state: { status: policy.status },
      after_state: { status: dto.status },
      metadata: { reason: dto.reason },
    })

    return updated
  }


  /**
   * Create policy endorsement
   */
  async createEndorsement(policyId: string, dto: CreateEndorsementDto, userId: string) {
    const { data: policy, error } = await this.supabase.getClient().from('policies').select('*').eq('id', policyId).single()

    if (error || !policy) {
      throw new NotFoundException('Policy not found')
    }

    const { data: endorsement, error: endorseError } = await this.supabase
      .from('endorsements')
      .insert({
        policy_id: policyId,
        endorsement_type: dto.endorsement_type,
        description: dto.description,
        effective_date: new Date(dto.effective_date).toISOString(),
        premium_change: dto.premium_change,
        created_by: userId,
      })
      .select()
      .single()

    if (endorseError) throw new BadRequestException('Failed to create endorsement')

    if (dto.premium_change) {
      const newPremium = Number(policy.premium) + dto.premium_change
      await this.supabase.getClient().from('policies').update({ premium: newPremium }).eq('id', policyId)
    }

    await this.auditService.logEvent({
      event_type: 'policy',
      entity_type: 'endorsement',
      entity_id: endorsement.id,
      user_id: userId,
      action: 'endorsement_created',
      metadata: { policy_id: policyId, endorsement_type: dto.endorsement_type, premium_change: dto.premium_change },
    })

    return endorsement
  }

  /**
   * Get policy status history
   */
  async getPolicyStatusHistory(policyId: string) {
    const { data: policy } = await this.supabase.getClient().from('policies').select('id').eq('id', policyId).single()

    if (!policy) {
      throw new NotFoundException('Policy not found')
    }

    const { data } = await this.supabase
      .from('policy_status_history')
      .select('*')
      .eq('policy_id', policyId)
      .order('changed_at', { ascending: false })

    return data || []
  }

  /**
   * Get policies by member
   */
  async getPoliciesByMember(memberId: string) {
    const { data: policyMembers } = await this.supabase
      .from('policy_members')
      .select('*, policy:policies(*, plan:plans(*, product:products(*)))')
      .eq('member_id', memberId)

    return (policyMembers || []).map((pm) => pm.policy)
  }

  /**
   * Check if member has active coverage
   */
  async checkMemberCoverage(memberId: string, benefitCode?: string) {
    const now = new Date().toISOString()

    const { data: activePolicyMembers } = await this.supabase
      .from('policy_members')
      .select('*, policy:policies(*, plan:plans(*, benefits:plan_benefits(*)))')
      .eq('member_id', memberId)
      .lte('cover_start_date', now)

    const filtered = (activePolicyMembers || []).filter(pm => pm.policy?.status === 'active')

    return {
      has_coverage: filtered.length > 0,
      policies: filtered.map((pm) => ({
        policy_id: pm.policy_id,
        policy_number: pm.policy?.policy_number,
        cover_start_date: pm.cover_start_date,
        waiting_period_satisfied: this.isWaitingPeriodSatisfied(new Date(pm.cover_start_date), new Date()),
        benefits: pm.policy?.plan?.benefits || [],
      })),
    }
  }

  private calculateCoverStartDate(policyStartDate: Date, waitingPeriodDays: number): Date {
    const coverStartDate = new Date(policyStartDate)
    coverStartDate.setDate(coverStartDate.getDate() + waitingPeriodDays)
    return coverStartDate
  }

  private isWaitingPeriodSatisfied(coverStartDate: Date, currentDate: Date): boolean {
    return currentDate >= coverStartDate
  }

  private async generatePolicyNumber(regime: string): Promise<string> {
    const prefix = regime === 'medical_scheme' ? 'MS' : 'INS'
    const year = new Date().getFullYear().toString().slice(-2)
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const { count } = await this.supabase
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .eq('regime', regime)

    const sequence = ((count || 0) + 1).toString().padStart(6, '0')
    return `${prefix}${year}${month}${sequence}`
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['active', 'cancelled'],
      active: ['lapsed', 'cancelled', 'suspended'],
      suspended: ['active', 'cancelled'],
      lapsed: ['active', 'cancelled'],
      cancelled: [],
    }

    const allowedStatuses = validTransitions[currentStatus] || []
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`)
    }
  }

  async getWaitingPeriodStatus(policyId: string, memberId: string) {
    const { data: policyMember, error } = await this.supabase
      .from('policy_members')
      .select('*, policy:policies(*, plan:plans(*, benefits:plan_benefits(*)))')
      .eq('policy_id', policyId)
      .eq('member_id', memberId)
      .single()

    if (error || !policyMember) {
      throw new NotFoundException('Policy member not found')
    }

    const now = new Date()
    const coverStartDate = new Date(policyMember.cover_start_date)
    const waitingPeriodSatisfied = this.isWaitingPeriodSatisfied(coverStartDate, now)

    return {
      policy_id: policyId,
      member_id: memberId,
      cover_start_date: policyMember.cover_start_date,
      waiting_period_satisfied: waitingPeriodSatisfied,
      days_until_coverage: waitingPeriodSatisfied ? 0 : Math.ceil((coverStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      benefits: (policyMember.policy?.plan?.benefits || []).map((benefit: any) => ({
        benefit_code: benefit.benefit_code,
        benefit_name: benefit.benefit_name,
        covered: waitingPeriodSatisfied,
      })),
    }
  }
}
