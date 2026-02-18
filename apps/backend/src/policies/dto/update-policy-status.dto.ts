import { IsString, IsEnum, IsOptional } from 'class-validator'

export class UpdatePolicyStatusDto {
  @IsString()
  @IsEnum(['pending', 'active', 'lapsed', 'cancelled', 'suspended'])
  status: string

  @IsOptional()
  @IsString()
  reason?: string
}
