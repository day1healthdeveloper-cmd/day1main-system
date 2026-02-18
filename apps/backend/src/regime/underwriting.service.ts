import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { SubmitUnderwritingDto, UnderwritingDecision } from './dto'

export type UnderwritingStatus = 'pending' | 'approved' | 'declined' | 'referred'
export type RiskRating = 'low' | 'medium' | 'high' | 'very_high'

@Injectable()
export class UnderwritingService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get client() {
    return this.supabase.getClient()
  }

  async submitUnderwriting(memberId: string, productId: string, dto: SubmitUnderwritingDto, userId: string): Promise<UnderwritingDecision> {
    const { data: member } = await this.client.from('members').select('*').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')

    const { data: product } = await this.client.from('products').select('*').eq('id', productId).single()
    if (!product) throw new NotFoundException('Product not found')
    if (product.regime !== 'insurance') throw new BadRequestException('Underwriting only applies to insurance products')

    const riskAssessment = this.assessRisk(dto)
    const decision = this.makeDecision(riskAssessment)

    const { data: underwritingResult, error } = await this.client
      .from('underwriting_results')
      .insert({ member_id: memberId, product_id: productId, questionnaire_data: dto.questionnaire_responses, risk_score: riskAssessment.risk_score, risk_rating: riskAssessment.risk_rating, decision: decision.status, decision_reason: decision.reason, premium_loading: decision.premium_loading, exclusions: decision.exclusions, conditions: decision.conditions, assessed_by: userId, assessed_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw new BadRequestException('Failed to create underwriting result')

    await this.auditService.logEvent({ event_type: 'underwriting', entity_type: 'underwriting_result', entity_id: underwritingResult.id, user_id: userId, action: 'underwriting_completed', metadata: { member_id: memberId, product_id: productId, decision: decision.status, risk_rating: riskAssessment.risk_rating } })

    return { underwriting_id: underwritingResult.id, status: decision.status, risk_rating: riskAssessment.risk_rating, risk_score: riskAssessment.risk_score, reason: decision.reason, premium_loading: decision.premium_loading, exclusions: decision.exclusions, conditions: decision.conditions, assessed_at: underwritingResult.assessed_at }
  }

  private assessRisk(dto: SubmitUnderwritingDto): { risk_score: number; risk_rating: RiskRating; risk_factors: string[] } {
    let riskScore = 0
    const riskFactors: string[] = []
    const responses = dto.questionnaire_responses

    const age = responses.age || 0
    if (age > 65) { riskScore += 30; riskFactors.push('Age over 65') }
    else if (age > 50) { riskScore += 15; riskFactors.push('Age over 50') }

    if (responses.smoker === true) { riskScore += 25; riskFactors.push('Smoker') }
    const preExisting = responses.pre_existing_conditions || []
    if (preExisting.length > 0) { riskScore += preExisting.length * 15; riskFactors.push(`${preExisting.length} pre-existing condition(s)`) }
    if (responses.chronic_medication === true) { riskScore += 20; riskFactors.push('On chronic medication') }

    let riskRating: RiskRating = riskScore >= 80 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'
    return { risk_score: riskScore, risk_rating: riskRating, risk_factors: riskFactors }
  }

  private makeDecision(riskAssessment: { risk_score: number; risk_rating: RiskRating; risk_factors: string[] }): { status: UnderwritingStatus; reason: string; premium_loading: number; exclusions: string[]; conditions: string[] } {
    const { risk_rating, risk_factors } = riskAssessment

    if (risk_rating === 'very_high') return { status: 'declined', reason: `Application declined due to high risk factors: ${risk_factors.join(', ')}`, premium_loading: 0, exclusions: [], conditions: [] }
    if (risk_rating === 'high') return { status: 'approved', reason: `Approved with premium loading due to risk factors: ${risk_factors.join(', ')}`, premium_loading: 50, exclusions: risk_factors.filter(f => f.includes('pre-existing')), conditions: ['Annual medical review required'] }
    if (risk_rating === 'medium') return { status: 'approved', reason: `Approved with moderate premium loading`, premium_loading: 25, exclusions: [], conditions: ['Pre-existing conditions excluded for 6 months'] }
    return { status: 'approved', reason: 'Approved on standard terms', premium_loading: 0, exclusions: [], conditions: [] }
  }

  async getUnderwritingResult(memberId: string, productId: string) {
    const { data: result } = await this.client.from('underwriting_results').select('*').eq('member_id', memberId).eq('product_id', productId).order('assessed_at', { ascending: false }).limit(1).single()
    if (!result) throw new NotFoundException('No underwriting result found')
    return result
  }

  async validateEligibility(memberId: string, productId: string, userId: string): Promise<{ eligible: boolean; reason: string }> {
    const { data: member } = await this.client.from('members').select('*').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')

    const { data: product } = await this.client.from('products').select('*').eq('id', productId).single()
    if (!product) throw new NotFoundException('Product not found')
    if (product.regime !== 'medical_scheme') throw new BadRequestException('Eligibility validation only applies to medical scheme products')

    const eligible = member.kyc_status === 'approved'
    await this.auditService.logEvent({ event_type: 'eligibility', entity_type: 'member', entity_id: memberId, user_id: userId, action: 'eligibility_validated', metadata: { product_id: productId, eligible, regime: 'medical_scheme' } })
    return { eligible, reason: eligible ? 'Member eligible for medical scheme enrollment' : 'KYC approval required before enrollment' }
  }
}
