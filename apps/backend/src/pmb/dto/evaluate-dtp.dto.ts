import { IsString, IsArray, IsOptional } from 'class-validator'

export class EvaluateDtpDto {
  @IsString()
  diagnosis_code: string

  @IsArray()
  @IsString({ each: true })
  procedure_codes: string[]

  @IsOptional()
  @IsString()
  claim_id?: string
}

export class DtpEvaluationResult {
  is_dtp_match: boolean
  matched_dtp?: any
  diagnosis_name?: string
  treatment_name?: string
  must_pay_minimum: boolean
  explanation: string
}
