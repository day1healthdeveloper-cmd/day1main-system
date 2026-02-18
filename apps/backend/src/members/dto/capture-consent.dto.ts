import { IsString, IsBoolean, IsIn, IsOptional, IsDateString } from 'class-validator'

export class CaptureConsentDto {
  @IsString()
  @IsIn(['processing', 'marketing'])
  consent_type: string

  @IsString()
  purpose: string

  @IsBoolean()
  is_granted: boolean

  @IsDateString()
  @IsOptional()
  expires_at?: string
}
