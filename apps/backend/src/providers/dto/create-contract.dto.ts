import { IsString, IsDateString, IsOptional, IsObject } from 'class-validator'

export class CreateContractDto {
  @IsString()
  tariff_schedule_id!: string

  @IsOptional()
  @IsString()
  contract_type?: string

  @IsDateString()
  effective_date!: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsOptional()
  @IsObject()
  terms?: any
}
