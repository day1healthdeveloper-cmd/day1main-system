import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator'

export class CreateEndorsementDto {
  @IsString()
  endorsement_type: string

  @IsString()
  description: string

  @IsDateString()
  effective_date: string

  @IsOptional()
  @IsNumber()
  premium_change?: number
}
