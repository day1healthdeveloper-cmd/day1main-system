import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class CheckPmbEligibilityDto {
  @IsString()
  diagnosis_code: string

  @IsOptional()
  @IsString()
  procedure_code?: string

  @IsOptional()
  @IsBoolean()
  is_emergency?: boolean
}

export class PmbEligibilityResult {
  is_pmb_eligible: boolean
  pmb_category?: 'emergency' | 'dtp' | 'chronic'
  condition_name?: string
  must_pay_minimum: boolean
  explanation: string
  matched_cdl?: any
  matched_dtp?: any
}
