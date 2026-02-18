import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { PerformKycDto, UpdateRiskScoreDto, FlagRiskDto } from './dto'

@Injectable()
export class KycService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async performKyc(memberId: string, dto: PerformKycDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('*').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')

    const idVerification = this.verifyIdentity(member.id_number, new Date(member.date_of_birth))
    const riskScore = this.calculateRiskScore(member, dto)
    const pepStatus = false // Mock - would integrate with PEP screening service

    const { data: updated } = await this.supabase.getClient().from('members').update({ kyc_status: idVerification.verified ? 'completed' : 'failed', risk_score: riskScore, pep_status: pepStatus }).eq('id', memberId).select().single()

    await this.auditService.logEvent({ event_type: 'kyc', entity_type: 'member', entity_id: memberId, user_id: userId, action: 'kyc_performed', after_state: { kyc_status: updated?.kyc_status, risk_score: riskScore, pep_status: pepStatus }, metadata: { id_verified: idVerification.verified, verification_method: dto.verification_method || 'manual' } })

    return { member_id: memberId, kyc_status: updated?.kyc_status, risk_score: riskScore, pep_status: pepStatus, id_verification: idVerification, timestamp: new Date() }
  }

  private verifyIdentity(idNumber: string, dateOfBirth: Date): { verified: boolean; method: string; details?: any } {
    const year = parseInt(idNumber.substring(0, 2), 10)
    const month = parseInt(idNumber.substring(2, 4), 10)
    const day = parseInt(idNumber.substring(4, 6), 10)
    const fullYear = year <= 24 ? 2000 + year : 1900 + year
    const dobYear = dateOfBirth.getFullYear()
    const dobMonth = dateOfBirth.getMonth() + 1
    const dobDay = dateOfBirth.getDate()
    const matches = fullYear === dobYear && month === dobMonth && day === dobDay
    return { verified: matches, method: 'id_number_validation', details: { matches } }
  }

  private calculateRiskScore(member: any, dto: PerformKycDto): number {
    let score = 10
    const age = this.calculateAge(new Date(member.date_of_birth))
    if (age < 25) score += 5
    else if (age > 65) score += 3
    if (dto.risk_factors) {
      if (dto.risk_factors.includes('high_value_transactions')) score += 15
      if (dto.risk_factors.includes('foreign_national')) score += 10
      if (dto.risk_factors.includes('cash_intensive_business')) score += 20
    }
    return Math.min(score, 100)
  }

  async updateRiskScore(memberId: string, dto: UpdateRiskScoreDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('*').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')
    if (dto.risk_score < 0 || dto.risk_score > 100) throw new BadRequestException('Risk score must be between 0 and 100')

    const { data: updated } = await this.supabase.getClient().from('members').update({ risk_score: dto.risk_score }).eq('id', memberId).select().single()
    await this.auditService.logEvent({ event_type: 'kyc', entity_type: 'member', entity_id: memberId, user_id: userId, action: 'risk_score_updated', before_state: { risk_score: member.risk_score }, after_state: { risk_score: dto.risk_score }, metadata: { reason: dto.reason } })
    return updated
  }

  async flagRisk(memberId: string, dto: FlagRiskDto, userId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('id').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')

    const { data: flag, error } = await this.supabase.getClient().from('member_risk_flags').insert({ member_id: memberId, flag_type: dto.flag_type, flag_reason: dto.reason, severity: dto.severity, flagged_by: userId }).select().single()
    if (error) throw new BadRequestException('Failed to create risk flag')

    await this.auditService.logEvent({ event_type: 'risk', entity_type: 'member_risk_flag', entity_id: flag.id, user_id: userId, action: 'risk_flagged', metadata: { member_id: memberId, flag_type: dto.flag_type, severity: dto.severity } })
    return flag
  }

  async resolveRiskFlag(flagId: string, resolution: string, userId: string) {
    const { data: flag } = await this.supabase.getClient().from('member_risk_flags').select('*').eq('id', flagId).single()
    if (!flag) throw new NotFoundException('Risk flag not found')

    const { data: updated } = await this.supabase.getClient().from('member_risk_flags').update({ resolved_at: new Date().toISOString(), resolved_by: userId }).eq('id', flagId).select().single()
    await this.auditService.logEvent({ event_type: 'risk', entity_type: 'member_risk_flag', entity_id: flagId, user_id: userId, action: 'risk_resolved', metadata: { member_id: flag.member_id, resolution } })
    return updated
  }

  async getMemberKycStatus(memberId: string) {
    const { data: member } = await this.supabase.getClient().from('members').select('*').eq('id', memberId).single()
    if (!member) throw new NotFoundException('Member not found')

    const { data: riskFlags } = await this.supabase.getClient().from('member_risk_flags').select('*').eq('member_id', memberId).is('resolved_at', null)
    return { member_id: memberId, kyc_status: member.kyc_status, risk_score: member.risk_score, pep_status: member.pep_status, active_risk_flags: riskFlags || [], requires_enhanced_dd: member.risk_score && member.risk_score > 70 }
  }

  async getMembersRequiringReview() {
    const { data } = await this.supabase.getClient().from('members').select('*').or('kyc_status.eq.pending,kyc_status.eq.failed,risk_score.gte.70,pep_status.eq.true').order('risk_score', { ascending: false })
    return data || []
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date()
    let age = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) age--
    return age
  }
}
