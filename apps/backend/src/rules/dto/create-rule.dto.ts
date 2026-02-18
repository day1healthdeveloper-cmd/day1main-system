import { IsString, IsDateString, IsObject, IsOptional, IsEnum } from 'class-validator'

export class CreateRuleDto {
  @IsString()
  rule_name: string

  @IsString()
  @IsEnum([
    'annual_limit',
    'per_event_limit',
    'co_payment',
    'exclusion',
    'network_penalty',
    'preauth_required',
    'waiting_period',
    'custom',
  ])
  rule_type: string

  @IsObject()
  rule_definition: any

  @IsString()
  version: string

  @IsDateString()
  effective_date: string

  @IsOptional()
  @IsDateString()
  end_date?: string
}
