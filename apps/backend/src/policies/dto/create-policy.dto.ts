import { IsString, IsDateString, IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator'

export class CreatePolicyDto {
  @IsString()
  plan_id: string

  @IsString()
  @IsEnum(['medical_scheme', 'insurance'])
  regime: string

  @IsDateString()
  start_date: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsNumber()
  premium: number

  @IsString()
  @IsEnum(['monthly', 'quarterly', 'annually'])
  billing_frequency: string

  @IsOptional()
  @IsString()
  broker_id?: string

  @IsArray()
  members: PolicyMemberDto[]
}

export class PolicyMemberDto {
  @IsString()
  member_id: string

  @IsString()
  @IsEnum(['principal', 'dependant'])
  relationship: string

  @IsDateString()
  cover_start_date: string

  @IsOptional()
  @IsDateString()
  cover_end_date?: string
}
