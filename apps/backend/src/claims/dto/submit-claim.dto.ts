import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class ClaimLineDto {
  @IsString()
  procedure_code: string

  @IsString()
  procedure_description: string

  @IsNumber()
  quantity: number

  @IsNumber()
  unit_price: number

  @IsNumber()
  line_amount: number
}

export class SubmitClaimDto {
  @IsString()
  member_id: string

  @IsString()
  provider_id: string

  @IsString()
  policy_id: string

  @IsDateString()
  service_date: string

  @IsOptional()
  @IsString()
  submission_channel?: string // api, edi, portal

  @IsString()
  diagnosis_code: string

  @IsString()
  diagnosis_description: string

  @IsArray()
  @IsString({ each: true })
  procedure_codes: string[]

  @IsNumber()
  claim_amount: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClaimLineDto)
  claim_lines: ClaimLineDto[]
}
