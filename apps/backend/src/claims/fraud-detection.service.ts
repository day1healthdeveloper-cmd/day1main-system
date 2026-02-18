import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'

export interface FraudScore {
  claim_id: string
  score: number // 0-100, higher = more suspicious
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

  /**
   * Calculate fraud score for a claim
   * Analyzes frequency, amount, patterns, and duplicates
   */
  async calculateFraudScore(claimId: string, userId: string): Promise<FraudScore> {
    const claim = await this.supabase.getClient().claim.findUnique({
      where: { id: claimId },
      include: {
        claim_lines: true,
        member: true,
        provider: true,
        policy: true,
      },
    })

    if (!claim) {
      throw new Error('Claim not found')
    }

    // Calculate individual scores
    const frequencyScore = await this.calculateFrequencyScore(claim)
    const amountScore = await this.calculateAmountScore(claim)
    const patternScore = await this.calculatePatternScore(claim)
    const duplicateScore = await this.detectDuplicates(claim)

    // Weighted average (frequency and duplicates are more important)
    const totalScore =
      frequencyScore * 0.3 + amountScore * 0.2 + patternScore * 0.2 + duplicateScore * 0.3

    // Determine risk level
    const riskLevel = this.determineRiskLevel(totalScore)

    // Generate flags
    const flags = this.generateFlags({
      frequencyScore,
      amountScore,
      patternScore,
      duplicateScore,
    })

    // Log fraud scoring
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

    // If high risk, automatically flag for review
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

  /**
   * Calculate frequency score based on claim submission patterns
   * High frequency of claims in short period = higher score
   */
  private async calculateFrequencyScore(claim: any): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Count claims from same member in last 30 days
    const memberClaimCount = await this.supabase.getClient().claim.count({
      where: {
        member_id: claim.member_id,
        submission_date: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Count claims from same provider in last 30 days
    const providerClaimCount = await this.supabase.getClient().claim.count({
      where: {
        provider_id: claim.provider_id,
        submission_date: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Score based on frequency (normalized to 0-100)
    let score = 0

    // Member frequency (more than 10 claims in 30 days is suspicious)
    if (memberClaimCount > 10) {
      score += Math.min((memberClaimCount - 10) * 5, 50)
    }

    // Provider frequency (more than 100 claims in 30 days is suspicious)
    if (providerClaimCount > 100) {
      score += Math.min((providerClaimCount - 100) * 0.5, 50)
    }

    return Math.min(score, 100)
  }

  /**
   * Calculate amount score based on claim amount anomalies
   * Unusually high amounts = higher score
   */
  private async calculateAmountScore(claim: any): Promise<number> {
    const claimedAmount = parseFloat(claim.total_claimed.toString())

    // Get average claim amount for same procedure codes
    const procedureCodes = claim.claim_lines.map((line: any) => line.procedure_code)

    const historicalClaims = await this.supabase.getClient().claim.findMany({
      where: {
        claim_lines: {
          some: {
            procedure_code: {
              in: procedureCodes,
            },
          },
        },
        status: 'approved',
      },
      select: {
        total_claimed: true,
      },
      take: 100,
    })

    if (historicalClaims.length === 0) {
      // No historical data, moderate score
      return 30
    }

    // Calculate average and standard deviation
    const amounts = historicalClaims.map((c) => parseFloat(c.total_claimed.toString()))
    const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const variance =
      amounts.reduce((sum, amt) => sum + Math.pow(amt - average, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    // Calculate z-score (how many standard deviations from mean)
    const zScore = (claimedAmount - average) / stdDev

    // Convert z-score to 0-100 scale
    // z-score > 2 (2 std devs above mean) = suspicious
    let score = 0
    if (zScore > 2) {
      score = Math.min((zScore - 2) * 25, 100)
    }

    return score
  }

  /**
   * Calculate pattern score based on suspicious patterns
   * Weekend submissions, round numbers, etc.
   */
  private async calculatePatternScore(claim: any): Promise<number> {
    let score = 0

    // Check if submitted on weekend
    const submissionDay = claim.submission_date.getDay()
    if (submissionDay === 0 || submissionDay === 6) {
      score += 20
    }

    // Check if service date is far in the past (> 90 days)
    const daysSinceService = Math.floor(
      (claim.submission_date.getTime() - claim.service_date.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysSinceService > 90) {
      score += 30
    }

    // Check for round numbers (often fabricated)
    const claimedAmount = parseFloat(claim.total_claimed.toString())
    if (claimedAmount % 1000 === 0 && claimedAmount > 1000) {
      score += 25
    }

    // Check if all claim lines have same amount (suspicious)
    const lineAmounts = claim.claim_lines.map((line: any) =>
      parseFloat(line.amount_claimed.toString()),
    )
    const allSame = lineAmounts.every((amt: number) => amt === lineAmounts[0])
    if (allSame && claim.claim_lines.length > 1) {
      score += 25
    }

    return Math.min(score, 100)
  }

  /**
   * Detect duplicate claims
   * Same member, provider, service date, and procedure codes
   */
  private async detectDuplicates(claim: any): Promise<number> {
    const procedureCodes = claim.claim_lines.map((line: any) => line.procedure_code)

    // Look for claims with same member, provider, and service date
    const duplicates = await this.supabase.getClient().claim.findMany({
      where: {
        id: {
          not: claim.id,
        },
        member_id: claim.member_id,
        provider_id: claim.provider_id,
        service_date: claim.service_date,
        claim_lines: {
          some: {
            procedure_code: {
              in: procedureCodes,
            },
          },
        },
      },
      include: {
        claim_lines: true,
      },
    })

    if (duplicates.length === 0) {
      return 0
    }

    // Check if procedure codes match exactly
    for (const duplicate of duplicates) {
      const dupProcedureCodes = duplicate.claim_lines.map((line) => line.procedure_code).sort()
      const claimProcedureCodes = procedureCodes.sort()

      if (JSON.stringify(dupProcedureCodes) === JSON.stringify(claimProcedureCodes)) {
        // Exact duplicate found
        return 100
      }
    }

    // Partial duplicates found
    return 60
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  /**
   * Generate human-readable flags
   */
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

  /**
   * Flag claim for review
   */
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

  /**
   * Create fraud investigation case
   */
  async createInvestigationCase(
    entityType: 'claim' | 'member' | 'provider',
    entityId: string,
    fraudType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId: string,
  ): Promise<FraudCase> {
    // Generate case number
    const caseNumber = await this.generateCaseNumber()

    const fraudCase = await this.supabase.getClient().fraudCase.create({
      data: {
        case_number: caseNumber,
        entity_type: entityType,
        entity_id: entityId,
        fraud_type: fraudType,
        description: description,
        severity: severity,
        status: 'open',
        opened_by: userId,
      },
    })

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

  /**
   * Generate unique case number
   */
  private async generateCaseNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    // Count cases created today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const count = await this.supabase.getClient().fraudCase.count({
      where: {
        opened_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const sequence = (count + 1).toString().padStart(6, '0')
    return `FRD-${dateStr}-${sequence}`
  }

  /**
   * Get investigation cases by status
   */
  async getInvestigationCases(status?: string): Promise<FraudCase[]> {
    const cases = await this.supabase.getClient().fraudCase.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        opened_at: 'desc',
      },
    })

    return cases.map((c) => ({
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

  /**
   * Close investigation case
   */
  async closeInvestigationCase(
    caseId: string,
    resolution: string,
    userId: string,
  ): Promise<void> {
    await this.supabase.getClient().fraudCase.update({
      where: { id: caseId },
      data: {
        status: 'closed',
        closed_at: new Date(),
        resolution: resolution,
      },
    })

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
