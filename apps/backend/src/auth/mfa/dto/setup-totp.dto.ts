import { IsString, IsOptional } from 'class-validator'

export class SetupTotpDto {
  @IsString()
  @IsOptional()
  device_name?: string
}
