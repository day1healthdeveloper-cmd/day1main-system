import { IsString, IsEnum, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @IsString()
  name: string

  @IsString()
  @IsEnum(['medical_scheme', 'insurance'])
  regime: string

  @IsString()
  version: string

  @IsDateString()
  effective_date: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanDto)
  plans: CreatePlanDto[]
}

export class CreatePlanDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  premium_base: string

  @IsOptional()
  waiting_period_days?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBenefitDto)
  benefits: CreateBenefitDto[]
}

export class CreateBenefitDto {
  @IsString()
  benefit_code: string

  @IsString()
  benefit_name: string

  @IsOptional()
  @IsString()
  annual_limit?: string

  @IsOptional()
  @IsString()
  per_event_limit?: string

  @IsOptional()
  @IsString()
  co_payment_pct?: string

  @IsOptional()
  requires_preauth?: boolean

  @IsOptional()
  network_only?: boolean
}
