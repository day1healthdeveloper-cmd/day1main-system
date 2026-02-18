import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'

export interface FraudScore {
  claim_id: string
  score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  details: {
    frequency_score: number
    amount_score: number
    pattern_score: number
    duplicate_score: number
  }
}

export interface FraudCase {
  id: string
  case_number: string
  entity_type: string
  entity_id: string
  fraud_type: string
  description: string
  severity: string
  status: string
}

@Injectable()
export class FraudDetectionService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async calculateFraudScore(claimId: string, userId: string): Promise<FraudScore> {
    const { data: claim, error } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        claim_lines(*),
        member:members(*),
        provider:providers(*),
        policy:policies(*)
      `)
      .eq('id', claimId)
      .single()

    if (error || !claim) {
      throw new Error('Claim not found')
    }

    const frequencyScore = await this.calculateFrequencyScore(claim)
    const amountScore = await this.calculateAmountScore(claim)
    const patternScore = await this.calculatePatternScore(claim)
    const duplicateScore = await this.detectDuplicates(claim)

    const totalScore =
      frequencyScore * 0.3 + amountScore * 0.2 + patternScore * 0.2 + duplicateScore * 0.3

    const riskLevel = this.determineRiskLevel(totalScore)

    const flags = this.generateFlags({
      frequencyScore,
      amountScore,
      patternScore,
      duplicateScore,
    })

    await this.auditService.logEvent({
      event_type: 'fraud',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'fraud_score_calculated',
      metadata: {
        claim_number: claim.claim_number,
        score: totalScore,
        risk_level: riskLevel,
        flags: flags,
        details: {
          frequency_score: frequencyScore,
          amount_score: amountScore,
          pattern_score: patternScore,
          duplicate_score: duplicateScore,
        },
      },
    })

    if (riskLevel === 'high' || riskLevel === 'critical') {
      await this.flagForReview(claimId, totalScore, flags, userId)
    }

    return {
      claim_id: claimId,
      score: Math.round(totalScore),
      risk_level: riskLevel,
      flags: flags,
      details: {
        frequency_score: Math.round(frequencyScore),
        amount_score: Math.round(amountScore),
        pattern_score: Math.round(patternScore),
        duplicate_score: Math.round(duplicateScore),
      },
    }
  }

  private async calculateFrequencyScore(claim: any): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: memberClaimCount } = await this.supabase
      .getClient()
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', claim.member_id)
      .gte('submission_date', thirtyDaysAgo.toISOString())

    const { count: providerClaimCount } = await this.supabase
      .getClient()
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', claim.provider_id)
      .gte('submission_date', thirtyDaysAgo.toISOString())

    let score = 0

    if ((memberClaimCount || 0) > 10) {
      score += Math.min(((memberClaimCount || 0) - 10) * 5, 50)
    }

    if ((providerClaimCount || 0) > 100) {
      score += Math.min(((providerClaimCount || 0) - 100) * 0.5, 50)
    }

    return Math.min(score, 100)
  }

  private async calculateAmountScore(claim: any): Promise<number> {
    const claimedAmount = parseFloat(claim.total_claimed.toString())

    const procedureCodes = claim.claim_lines.map((line: any) => line.procedure_code)

    // Get historical claims with similar procedure codes
    const { data: historicalClaims } = await this.supabase
      .getClient()
      .from('claims')
      .select('total_claimed')
      .eq('status', 'approved')
      .limit(100)

    if (!historicalClaims || historicalClaims.length === 0) {
      return 30
    }

    const amounts = historicalClaims.map((c) => parseFloat(c.total_claimed.toString()))
    const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const variance =
      amounts.reduce((sum, amt) => sum + Math.pow(amt - average, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    const zScore = (claimedAmount - average) / stdDev

    let score = 0
    if (zScore > 2) {
      score = Math.min((zScore - 2) * 25, 100)
    }

    return score
  }

  private async calculatePatternScore(claim: any): Promise<number> {
    let score = 0

    const submissionDay = new Date(claim.submission_date).getDay()
    if (submissionDay === 0 || submissionDay === 6) {
      score += 20
    }

    const daysSinceService = Math.floor(
      (new Date(claim.submission_date).getTime() - new Date(claim.service_date).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    if (daysSinceService > 90) {
      score += 30
    }

    const claimedAmount = parseFloat(claim.total_claimed.toString())
    if (claimedAmount % 1000 === 0 && claimedAmount > 1000) {
      score += 25
    }

    const lineAmounts = claim.claim_lines.map((line: any) =>
      parseFloat(line.amount_claimed.toString()),
    )
    const allSame = lineAmounts.every((amt: number) => amt === lineAmounts[0])
    if (allSame && claim.claim_lines.length > 1) {
      score += 25
    }

    return Math.min(score, 100)
  }

  private async detectDuplicates(claim: any): Promise<number> {
    const procedureCodes = claim.claim_lines.map((line: any) => line.procedure_code)

    const { data: duplicates } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        claim_lines(*)
      `)
      .neq('id', claim.id)
      .eq('member_id', claim.member_id)
      .eq('provider_id', claim.provider_id)
      .eq('service_date', claim.service_date)

    if (!duplicates || duplicates.length === 0) {
      return 0
    }

    for (const duplicate of duplicates) {
      const dupProcedureCodes = duplicate.claim_lines.map((line: any) => line.procedure_code).sort()
      const claimProcedureCodes = procedureCodes.sort()

      if (JSON.stringify(dupProcedureCodes) === JSON.stringify(claimProcedureCodes)) {
        return 100
      }
    }

    return 60
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  private generateFlags(details: {
    frequencyScore: number
    amountScore: number
    patternScore: number
    duplicateScore: number
  }): string[] {
    const flags: string[] = []

    if (details.frequencyScore > 50) {
      flags.push('HIGH_FREQUENCY')
    }

    if (details.amountScore > 50) {
      flags.push('UNUSUAL_AMOUNT')
    }

    if (details.patternScore > 50) {
      flags.push('SUSPICIOUS_PATTERN')
    }

    if (details.duplicateScore > 80) {
      flags.push('DUPLICATE_CLAIM')
    } else if (details.duplicateScore > 40) {
      flags.push('POSSIBLE_DUPLICATE')
    }

    if (flags.length === 0) {
      flags.push('NO_ISSUES')
    }

    return flags
  }

  private async flagForReview(
    claimId: string,
    score: number,
    flags: string[],
    userId: string,
  ): Promise<void> {
    await this.auditService.logEvent({
      event_type: 'fraud',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'claim_flagged_for_review',
      metadata: {
        score: score,
        flags: flags,
        reason: 'Automatic fraud detection',
      },
    })
  }

  async createInvestigationCase(
    entityType: 'claim' | 'member' | 'provider',
    entityId: string,
    fraudType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId: string,
  ): Promise<FraudCase> {
    const caseNumber = await this.generateCaseNumber()

    const { data: fraudCase, error } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .insert({
        case_number: caseNumber,
        entity_type: entityType,
        entity_id: entityId,
        fraud_type: fraudType,
        description: description,
        severity: severity,
        status: 'open',
        opened_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    await this.auditService.logEvent({
      event_type: 'fraud',
      entity_type: 'fraud_case',
      entity_id: fraudCase.id,
      user_id: userId,
      action: 'investigation_case_created',
      metadata: {
        case_number: caseNumber,
        entity_type: entityType,
        entity_id: entityId,
        fraud_type: fraudType,
        severity: severity,
      },
    })

    return {
      id: fraudCase.id,
      case_number: fraudCase.case_number,
      entity_type: fraudCase.entity_type,
      entity_id: fraudCase.entity_id,
      fraud_type: fraudCase.fraud_type,
      description: fraudCase.description,
      severity: fraudCase.severity,
      status: fraudCase.status,
    }
  }

  private async generateCaseNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const { count } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*', { count: 'exact', head: true })
      .gte('opened_at', startOfDay.toISOString())
      .lte('opened_at', endOfDay.toISOString())

    const sequence = ((count || 0) + 1).toString().padStart(6, '0')
    return `FRD-${dateStr}-${sequence}`
  }

  async getInvestigationCases(status?: string): Promise<FraudCase[]> {
    let query = this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*')
      .order('opened_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: cases, error } = await query

    if (error) throw error

    return (cases || []).map((c) => ({
      id: c.id,
      case_number: c.case_number,
      entity_type: c.entity_type,
      entity_id: c.entity_id,
      fraud_type: c.fraud_type,
      description: c.description,
      severity: c.severity,
      status: c.status,
    }))
  }

  async closeInvestigationCase(
    caseId: string,
    resolution: string,
    userId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        resolution: resolution,
      })
      .eq('id', caseId)

    if (error) throw error

    await this.auditService.logEvent({
      event_type: 'fraud',
      entity_type: 'fraud_case',
      entity_id: caseId,
      user_id: userId,
      action: 'investigation_case_closed',
      metadata: {
        resolution: resolution,
      },
    })
  }
}
