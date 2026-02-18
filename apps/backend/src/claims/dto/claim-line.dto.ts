import { IsString, IsNumber, IsOptional } from 'class-validator'

export class ClaimLineDto {
  @IsString()
  procedure_code: string

  @IsString()
  procedure_description: string

  @IsNumber()
  quantity: number

  @IsNumber()
  amount_charged: number

  @IsOptional()
  @IsString()
  tariff_code?: string

  @IsOptional()
  @IsString()
  modifier?: string
}
