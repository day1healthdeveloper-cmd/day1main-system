import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import {
  CHRONIC_DISEASE_LIST,
  DIAGNOSIS_TREATMENT_PAIRS,
  EMERGENCY_CONDITIONS,
  PMB_COVERAGE_RULES,
  PMBCategory,
} from './constants/pmb-conditions.constants'
import { CheckPmbEligibilityDto, PmbEligibilityResult } from './dto/check-pmb-eligibility.dto'
import { EvaluateDtpDto, DtpEvaluationResult } from './dto/evaluate-dtp.dto'

@Injectable()
export class PmbService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Check if a diagnosis/procedure qualifies as a PMB
   * Returns eligibility status and category (emergency, DTP, chronic)
   */
  async checkPmbEligibility(
    dto: CheckPmbEligibilityDto,
    userId: string,
  ): Promise<PmbEligibilityResult> {
    // Check emergency conditions first
    if (dto.is_emergency) {
      return {
        is_pmb_eligible: true,
        pmb_category: 'emergency',
        must_pay_minimum: true,
        explanation: 'Emergency condition qualifies as PMB. No co-payments or limits apply.',
      }
    }

    // Check Diagnosis-Treatment Pairs (DTPs) before CDL when procedure code is provided
    // DTPs are more specific than CDL conditions
    if (dto.procedure_code) {
      const dtpMatch = this.checkDtpMatch(dto.diagnosis_code, [dto.procedure_code])
      if (dtpMatch) {
        await this.auditService.logEvent({
          event_type: 'pmb',
          entity_type: 'pmb_check',
          entity_id: dto.diagnosis_code,
          user_id: userId,
          action: 'pmb_dtp_match',
          metadata: {
            diagnosis_code: dto.diagnosis_code,
            procedure_code: dto.procedure_code,
            dtp_code: dtpMatch.dtp_code,
          },
        })

        return {
          is_pmb_eligible: true,
          pmb_category: 'dtp',
          condition_name: dtpMatch.diagnosis_name,
          must_pay_minimum: true,
          matched_dtp: dtpMatch,
          explanation: `Diagnosis-Treatment Pair matches PMB: ${dtpMatch.diagnosis_name} - ${dtpMatch.treatment_name}`,
        }
      }
    }

    // Check Chronic Disease List (CDL)
    const cdlMatch = this.checkCdlMatch(dto.diagnosis_code)
    if (cdlMatch) {
      await this.auditService.logEvent({
        event_type: 'pmb',
        entity_type: 'pmb_check',
        entity_id: dto.diagnosis_code,
        user_id: userId,
        action: 'pmb_cdl_match',
        metadata: {
          diagnosis_code: dto.diagnosis_code,
          cdl_condition: cdlMatch.name,
        },
      })

      return {
        is_pmb_eligible: true,
        pmb_category: 'chronic',
        condition_name: cdlMatch.name,
        must_pay_minimum: true,
        matched_cdl: cdlMatch,
        explanation: `Diagnosis matches CDL condition: ${cdlMatch.name}. Full coverage required.`,
      }
    }

    // Not a PMB
    return {
      is_pmb_eligible: false,
      must_pay_minimum: false,
      explanation: 'Diagnosis/procedure does not match any PMB criteria',
    }
  }

  /**
   * Evaluate Diagnosis-Treatment Pair (DTP) logic
   * Used during claims adjudication for medical schemes
   */
  async evaluateDtp(dto: EvaluateDtpDto, userId: string): Promise<DtpEvaluationResult> {
    const dtpMatch = this.checkDtpMatch(dto.diagnosis_code, dto.procedure_codes)

    if (dtpMatch) {
      await this.auditService.logEvent({
        event_type: 'pmb',
        entity_type: 'dtp_evaluation',
        entity_id: dto.claim_id || 'no-claim-id',
        user_id: userId,
        action: 'dtp_evaluated',
        metadata: {
          diagnosis_code: dto.diagnosis_code,
          procedure_codes: dto.procedure_codes,
          dtp_code: dtpMatch.dtp_code,
          matched: true,
        },
      })

      return {
        is_dtp_match: true,
        matched_dtp: dtpMatch,
        diagnosis_name: dtpMatch.diagnosis_name,
        treatment_name: dtpMatch.treatment_name,
        must_pay_minimum: true,
        explanation: `DTP match found: ${dtpMatch.dtp_code}. Claim must be paid at minimum benefit level.`,
      }
    }

    await this.auditService.logEvent({
      event_type: 'pmb',
      entity_type: 'dtp_evaluation',
      entity_id: dto.claim_id || 'no-claim-id',
      user_id: userId,
      action: 'dtp_evaluated',
      metadata: {
        diagnosis_code: dto.diagnosis_code,
        procedure_codes: dto.procedure_codes,
        matched: false,
      },
    })

    return {
      is_dtp_match: false,
      must_pay_minimum: false,
      explanation: 'No DTP match found. Standard benefit rules apply.',
    }
  }

  /**
   * Check if diagnosis code matches Chronic Disease List
   */
  private checkCdlMatch(diagnosisCode: string): any {
    return CHRONIC_DISEASE_LIST.find((cdl) => cdl.icd10_codes.includes(diagnosisCode))
  }

  /**
   * Check if diagnosis + procedure codes match a DTP
   */
  private checkDtpMatch(diagnosisCode: string, procedureCodes: string[]): any {
    return DIAGNOSIS_TREATMENT_PAIRS.find(
      (dtp) =>
        dtp.diagnosis_icd10 === diagnosisCode &&
        dtp.treatment_codes.some((code) => procedureCodes.includes(code)),
    )
  }

  /**
   * Apply PMB protection rules to a claim
   * Prevents rejection and removes co-payments/limits for PMB claims
   */
  async applyPmbProtection(claimData: any, userId: string): Promise<any> {
    const eligibility = await this.checkPmbEligibility(
      {
        diagnosis_code: claimData.diagnosis_code,
        procedure_code: claimData.procedure_code,
        is_emergency: claimData.is_emergency,
      },
      userId,
    )

    if (!eligibility.is_pmb_eligible) {
      return {
        is_pmb_protected: false,
        original_claim: claimData,
      }
    }

    // Apply PMB protection rules
    const protectedClaim = {
      ...claimData,
      is_pmb_protected: true,
      pmb_category: eligibility.pmb_category,
      co_payment_override: 0, // No co-payments for PMBs
      annual_limit_override: null, // No annual limits for PMBs
      network_penalty_override: 0, // No network penalties for PMBs
      cannot_reject: true, // Cannot reject valid PMB claims
      pmb_explanation: eligibility.explanation,
    }

    await this.auditService.logEvent({
      event_type: 'pmb',
      entity_type: 'claim',
      entity_id: claimData.claim_id || 'no-claim-id',
      user_id: userId,
      action: 'pmb_protection_applied',
      metadata: {
        pmb_category: eligibility.pmb_category,
        diagnosis_code: claimData.diagnosis_code,
        protection_rules: {
          co_payment_removed: true,
          annual_limit_removed: true,
          network_penalty_removed: true,
        },
      },
    })

    return protectedClaim
  }

  /**
   * Get all CDL conditions
   */
  getCdlConditions() {
    return CHRONIC_DISEASE_LIST
  }

  /**
   * Get all DTPs
   */
  getDtps() {
    return DIAGNOSIS_TREATMENT_PAIRS
  }

  /**
   * Get PMB coverage rules
   */
  getPmbCoverageRules() {
    return PMB_COVERAGE_RULES
  }

  /**
   * Get emergency conditions
   */
  getEmergencyConditions() {
    return EMERGENCY_CONDITIONS
  }
}
