import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'

export type RegimeType = 'medical_scheme' | 'insurance'

export interface RegimeConfig {
  regime: RegimeType
  requires_underwriting: boolean
  requires_eligibility_validation: boolean
  pmb_applies: boolean
  waiting_periods_apply: boolean
  regulatory_body: string
  compliance_framework: string[]
}

@Injectable()
export class RegimeService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Get regime configuration for a product
   */
  getRegimeConfig(regime: RegimeType): RegimeConfig {
    if (regime === 'medical_scheme') {
      return {
        regime: 'medical_scheme',
        requires_underwriting: false,
        requires_eligibility_validation: true,
        pmb_applies: true,
        waiting_periods_apply: true,
        regulatory_body: 'Council for Medical Schemes (CMS)',
        compliance_framework: ['Medical Schemes Act 131 of 1998', 'POPIA', 'FICA'],
      }
    }

    if (regime === 'insurance') {
      return {
        regime: 'insurance',
        requires_underwriting: true,
        requires_eligibility_validation: false,
        pmb_applies: false,
        waiting_periods_apply: true,
        regulatory_body: 'Financial Sector Conduct Authority (FSCA)',
        compliance_framework: ['Insurance Act', 'POPIA', 'FICA', 'Treating Customers Fairly (TCF)'],
      }
    }

    throw new BadRequestException(`Invalid regime: ${regime}`)
  }

  /**
   * Validate that a workflow is appropriate for the regime
   */
  validateWorkflow(regime: RegimeType, workflow: string): boolean {
    const config = this.getRegimeConfig(regime)

    switch (workflow) {
      case 'underwriting':
        return config.requires_underwriting

      case 'eligibility_validation':
        return config.requires_eligibility_validation

      case 'pmb_checking':
        return config.pmb_applies

      default:
        return false
    }
  }

  /**
   * Get required onboarding steps for a regime
   */
  getOnboardingSteps(regime: RegimeType): string[] {
    const config = this.getRegimeConfig(regime)
    const steps = ['kyc', 'fica', 'consent_capture']

    if (config.requires_underwriting) {
      steps.push('underwriting')
    }

    if (config.requires_eligibility_validation) {
      steps.push('eligibility_validation')
    }

    steps.push('policy_creation')

    return steps
  }

  /**
   * Check if a regime requires specific compliance checks
   */
  requiresComplianceCheck(regime: RegimeType, checkType: string): boolean {
    const config = this.getRegimeConfig(regime)
    return config.compliance_framework.some((framework) =>
      framework.toLowerCase().includes(checkType.toLowerCase()),
    )
  }

  /**
   * Get regulatory body for a regime
   */
  getRegulatoryBody(regime: RegimeType): string {
    return this.getRegimeConfig(regime).regulatory_body
  }

  /**
   * Validate regime type
   */
  isValidRegime(regime: string): regime is RegimeType {
    return regime === 'medical_scheme' || regime === 'insurance'
  }
}
