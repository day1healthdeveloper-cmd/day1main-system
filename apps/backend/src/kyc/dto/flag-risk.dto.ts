import { IsString, IsEnum } from 'class-validator'

export class FlagRiskDto {
  @IsEnum(['kyc_failure', 'fraud_suspicion', 'pep', 'sanctions', 'adverse_media', 'other'])
  flag_type: string

  @IsString()
  reason: string

  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: string
}
