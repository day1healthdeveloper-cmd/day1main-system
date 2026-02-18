import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator'

export enum NetworkType {
  DSP = 'dsp',
  PREFERRED = 'preferred',
  STANDARD = 'standard',
}

export class AssignNetworkDto {
  @IsString()
  network_id!: string

  @IsOptional()
  @IsString()
  tier?: string

  @IsDateString()
  effective_date!: string

  @IsOptional()
  @IsDateString()
  end_date?: string
}
