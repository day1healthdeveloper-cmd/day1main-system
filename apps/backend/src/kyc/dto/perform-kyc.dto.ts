import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator'

export class PerformKycDto {
  @IsOptional()
  @IsEnum(['manual', 'automated', 'third_party'])
  verification_method?: string

  @IsOptional()
  @IsString()
  occupation?: string

  @IsOptional()
  @IsString()
  source_of_funds?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risk_factors?: string[]
}
