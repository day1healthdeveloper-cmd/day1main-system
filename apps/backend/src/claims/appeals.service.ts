import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'

export interface Appeal {
  id: string
  claim_id: string
  appeal_reason: string
  supporting_docs?: any
  status: string
  submitted_at: Date
  submitted_by: string
  resolved_at?: Date
  resolution?: string
}

export interface AppealReview {
  appeal_id: string
  decision: 'approved' | 'rejected' | 'partially_approved'
  resolution: string
  revised_amount?: number
}

@Injectable()
export class AppealsService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async submitAppeal(claimId: string, appealReason: string, supportingDocs: any, userId: string): Promise<Appeal> {
    const { data: claim } = await this.supabase.getClient().from('claims').select('*').eq('id', claimId).single()
    if (!claim) throw new NotFoundException('Claim not found')

    if (claim.status !== 'rejected' && claim.status !== 'pended') {
      throw new BadRequestException('Only rejected or pended claims can be appealed')
    }

    const { data: existingAppeal } = await this.supabase
      .from('appeals')
      .select('id')
      .eq('claim_id', claimId)
      .eq('status', 'pending')
      .single()

    if (existingAppeal) throw new BadRequestException('An appeal is already pending for this claim')

    const { data: appeal, error } = await this.supabase
      .from('appeals')
      .insert({ claim_id: claimId, appeal_reason: appealReason, supporting_docs: supportingDocs, status: 'pending', submitted_by: userId })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create appeal')

    await this.auditService.logEvent({
      event_type: 'appeal',
      entity_type: 'appeal',
      entity_id: appeal.id,
      user_id: userId,
      action: 'appeal_submitted',
      metadata: { claim_id: claimId, claim_number: claim.claim_number },
    })

    return { id: appeal.id, claim_id: appeal.claim_id, appeal_reason: appeal.appeal_reason, supporting_docs: appeal.supporting_docs, status: appeal.status, submitted_at: appeal.submitted_at, submitted_by: appeal.submitted_by }
  }

  async approveAppeal(appealId: string, resolution: string, revisedAmount: number | undefined, userId: string): Promise<AppealReview> {
    const { data: appeal } = await this.supabase.getClient().from('appeals').select('*, claim:claims(*)').eq('id', appealId).single()
    if (!appeal) throw new NotFoundException('Appeal not found')
    if (appeal.status !== 'pending') throw new BadRequestException('Appeal has already been reviewed')

    await this.supabase.getClient().from('appeals').update({ status: 'approved', resolution, resolved_at: new Date().toISOString() }).eq('id', appealId)

    const updateData: any = { status: 'approved' }
    if (revisedAmount !== undefined) updateData.total_approved = revisedAmount

    await this.supabase.getClient().from('claims').update(updateData).eq('id', appeal.claim_id)
    await this.supabase.getClient().from('claim_status_history').insert({ claim_id: appeal.claim_id, status: 'approved', reason: `Appeal approved: ${resolution}`, changed_by: userId })

    await this.auditService.logEvent({
      event_type: 'appeal',
      entity_type: 'appeal',
      entity_id: appealId,
      user_id: userId,
      action: 'appeal_approved',
      metadata: { claim_id: appeal.claim_id, resolution },
    })

    return { appeal_id: appealId, decision: revisedAmount !== undefined ? 'partially_approved' : 'approved', resolution, revised_amount: revisedAmount }
  }

  async rejectAppeal(appealId: string, resolution: string, userId: string): Promise<AppealReview> {
    const { data: appeal } = await this.supabase.getClient().from('appeals').select('*, claim:claims(*)').eq('id', appealId).single()
    if (!appeal) throw new NotFoundException('Appeal not found')
    if (appeal.status !== 'pending') throw new BadRequestException('Appeal has already been reviewed')

    await this.supabase.getClient().from('appeals').update({ status: 'rejected', resolution, resolved_at: new Date().toISOString() }).eq('id', appealId)
    await this.supabase.getClient().from('claim_status_history').insert({ claim_id: appeal.claim_id, status: 'rejected', reason: `Appeal rejected: ${resolution}`, changed_by: userId })

    await this.auditService.logEvent({
      event_type: 'appeal',
      entity_type: 'appeal',
      entity_id: appealId,
      user_id: userId,
      action: 'appeal_rejected',
      metadata: { claim_id: appeal.claim_id, resolution },
    })

    return { appeal_id: appealId, decision: 'rejected', resolution }
  }

  async getAppealById(appealId: string): Promise<Appeal> {
    const { data: appeal } = await this.supabase.getClient().from('appeals').select('*').eq('id', appealId).single()
    if (!appeal) throw new NotFoundException('Appeal not found')
    return { id: appeal.id, claim_id: appeal.claim_id, appeal_reason: appeal.appeal_reason, supporting_docs: appeal.supporting_docs, status: appeal.status, submitted_at: appeal.submitted_at, submitted_by: appeal.submitted_by, resolved_at: appeal.resolved_at, resolution: appeal.resolution }
  }

  async getAppealsByStatus(status: string): Promise<Appeal[]> {
    const { data } = await this.supabase.getClient().from('appeals').select('*').eq('status', status).order('submitted_at', { ascending: false })
    return (data || []).map((a) => ({ id: a.id, claim_id: a.claim_id, appeal_reason: a.appeal_reason, supporting_docs: a.supporting_docs, status: a.status, submitted_at: a.submitted_at, submitted_by: a.submitted_by, resolved_at: a.resolved_at, resolution: a.resolution }))
  }

  async getAppealsByClaim(claimId: string): Promise<Appeal[]> {
    const { data } = await this.supabase.getClient().from('appeals').select('*').eq('claim_id', claimId).order('submitted_at', { ascending: false })
    return (data || []).map((a) => ({ id: a.id, claim_id: a.claim_id, appeal_reason: a.appeal_reason, supporting_docs: a.supporting_docs, status: a.status, submitted_at: a.submitted_at, submitted_by: a.submitted_by, resolved_at: a.resolved_at, resolution: a.resolution }))
  }

  async getPendingAppeals(): Promise<Appeal[]> {
    return this.getAppealsByStatus('pending')
  }

  async getAppealStatistics() {
    const { count: total } = await this.supabase.getClient().from('appeals').select('*', { count: 'exact', head: true })
    const { count: pending } = await this.supabase.getClient().from('appeals').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const { count: approved } = await this.supabase.getClient().from('appeals').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    const { count: rejected } = await this.supabase.getClient().from('appeals').select('*', { count: 'exact', head: true }).eq('status', 'rejected')

    const approvalRate = (total || 0) > 0 ? ((approved || 0) / ((approved || 0) + (rejected || 0))) * 100 : 0
    return { total: total || 0, pending: pending || 0, approved: approved || 0, rejected: rejected || 0, approval_rate: Math.round(approvalRate * 100) / 100 }
  }
}
