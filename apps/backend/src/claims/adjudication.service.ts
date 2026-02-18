import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { RulesService } from '../rules/rules.service'
import { PmbService } from '../pmb/pmb.service'

export interface AdjudicationResult {
  claim_id: string
  status: 'approved' | 'pended' | 'rejected'
  total_approved: number
  reason_codes: string[]
  explanation: string
  requires_documents?: string[]
  pmb_protected?: boolean
}

@Injectable()
export class AdjudicationService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private rulesService: RulesService,
    private pmbService: PmbService,
  ) {}

  async adjudicateClaim(claimId: string, userId: string): Promise<AdjudicationResult> {
    const { data: claim, error } = await this.supabase.getClient()
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single()

    if (error || !claim) throw new NotFoundException('Claim not found')
    if (claim.status !== 'submitted') throw new BadRequestException('Claim has already been adjudicated')

    const { data: claimLines } = await this.supabase.getClient().from('claim_lines').select('*').eq('claim_id', claimId)
    const { data: policy } = await this.supabase.getClient().from('policies').select('*, plan:plans(*)').eq('id', claim.policy_id).single()

    const pmbCheck = await this.checkPmbProtection(claim, policy)

    const lineAdjudications = await Promise.all(
      (claimLines || []).map((line) => this.adjudicateClaimLine(line, claim, policy, pmbCheck.is_protected))
    )

    const totalApproved = lineAdjudications.reduce((sum, adj) => sum + adj.approved_amount, 0)
    const allReasonCodes = [...new Set(lineAdjudications.flatMap((adj) => adj.reason_codes))]
    const status = this.determineClaimStatus(lineAdjudications, pmbCheck.is_protected)
    const requiresDocuments = this.checkDocumentRequirements(claim, lineAdjudications)

    await this.supabase.getClient().from('claims').update({ status, total_approved: totalApproved }).eq('id', claimId)

    await this.supabase.getClient().from('claim_status_history').insert({
      claim_id: claimId,
      status,
      reason: this.generateStatusReason(status, allReasonCodes),
      changed_by: userId,
    })

    for (const adj of lineAdjudications) {
      await this.supabase.getClient().from('claim_lines').update({
        amount_approved: adj.approved_amount,
        rejection_reason: adj.rejection_reason,
      }).eq('id', adj.line_id)
    }

    await this.auditService.logEvent({
      event_type: 'claim',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'claim_adjudicated',
      metadata: { claim_number: claim.claim_number, status, total_approved: totalApproved.toString() },
    })

    return {
      claim_id: claimId,
      status,
      total_approved: totalApproved,
      reason_codes: allReasonCodes,
      explanation: this.generateExplanation(status, allReasonCodes, pmbCheck.is_protected),
      requires_documents: requiresDocuments.length > 0 ? requiresDocuments : undefined,
      pmb_protected: pmbCheck.is_protected,
    }
  }

  private async checkPmbProtection(claim: any, policy: any): Promise<{ is_protected: boolean; category?: string }> {
    if (!policy?.plan) return { is_protected: false }

    const { data: product } = await this.supabase.getClient()
      .from('products')
      .select('regime')
      .eq('id', policy.plan.product_id)
      .single()

    if (!product || product.regime !== 'medical_scheme') return { is_protected: false }

    const { data: claimLines } = await this.supabase.getClient().from('claim_lines').select('icd10_code, procedure_code').eq('claim_id', claim.id).limit(1)
    const diagnosisCode = claimLines?.[0]?.icd10_code
    const procedureCode = claimLines?.[0]?.procedure_code

    if (!diagnosisCode) return { is_protected: false }

    const pmbCheck = await this.pmbService.checkPmbEligibility({ diagnosis_code: diagnosisCode, procedure_code: procedureCode, is_emergency: false }, 'system')
    return { is_protected: pmbCheck.is_pmb_eligible, category: pmbCheck.pmb_category }
  }

  private async adjudicateClaimLine(line: any, claim: any, policy: any, pmbProtected: boolean) {
    const claimedAmount = parseFloat(line.amount_claimed?.toString() || '0')

    if (pmbProtected) {
      return { line_id: line.id, approved_amount: claimedAmount, reason_codes: ['PMB_PROTECTED'], rejection_reason: undefined }
    }

    const { data: benefits } = await this.supabase.getClient().from('plan_benefits').select('*').eq('plan_id', policy?.plan_id)
    const benefit = (benefits || []).find((b: any) => b.benefit_code === line.procedure_code || b.benefit_code === 'ALL')

    if (!benefit) {
      return { line_id: line.id, approved_amount: 0, reason_codes: ['NO_BENEFIT'], rejection_reason: 'No matching benefit found' }
    }

    return { line_id: line.id, approved_amount: claimedAmount, reason_codes: ['APPROVED'], rejection_reason: undefined }
  }

  private determineClaimStatus(lineAdjudications: any[], pmbProtected: boolean): 'approved' | 'pended' | 'rejected' {
    if (pmbProtected) return 'approved'
    const allApproved = lineAdjudications.every((adj) => adj.approved_amount > 0)
    const allRejected = lineAdjudications.every((adj) => adj.approved_amount === 0)
    if (allApproved) return 'approved'
    if (allRejected) return 'rejected'
    return 'pended'
  }

  private checkDocumentRequirements(claim: any, lineAdjudications: any[]): string[] {
    const requiredDocs: string[] = []
    const reasonCodes = lineAdjudications.flatMap((adj) => adj.reason_codes)
    if (reasonCodes.includes('NO_BENEFIT')) requiredDocs.push('Benefit authorization letter')
    if (parseFloat(claim.total_claimed?.toString() || '0') > 10000) {
      requiredDocs.push('Detailed invoice')
      requiredDocs.push('Medical records')
    }
    return [...new Set(requiredDocs)]
  }

  private generateStatusReason(status: string, reasonCodes: string[]): string {
    if (status === 'approved') return 'Claim approved'
    if (status === 'rejected') return `Claim rejected: ${reasonCodes.join(', ')}`
    return `Claim pended for review: ${reasonCodes.join(', ')}`
  }

  private generateExplanation(status: string, reasonCodes: string[], pmbProtected: boolean): string {
    if (pmbProtected) return 'Claim approved under PMB protection.'
    if (status === 'approved') return 'Claim has been approved.'
    if (status === 'rejected') return `Claim rejected: ${reasonCodes.join(', ')}`
    return `Claim requires review: ${reasonCodes.join(', ')}`
  }

  async updateClaimStatus(claimId: string, status: 'approved' | 'pended' | 'rejected', reason: string, userId: string): Promise<void> {
    const { data: claim } = await this.supabase.getClient().from('claims').select('id').eq('id', claimId).single()
    if (!claim) throw new NotFoundException('Claim not found')

    await this.supabase.getClient().from('claims').update({ status }).eq('id', claimId)
    await this.supabase.getClient().from('claim_status_history').insert({ claim_id: claimId, status, reason, changed_by: userId })

    await this.auditService.logEvent({
      event_type: 'claim',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'claim_status_updated',
      metadata: { status, reason },
    })
  }
}
