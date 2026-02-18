import { IsString, IsEnum, IsOptional } from 'class-validator'

export enum AuthorisationType {
  CLAIM_SUBMISSION = 'claim_submission',
  EDI_ACCESS = 'edi_access',
  API_ACCESS = 'api_access',
}

export class GrantAuthorisationDto {
  @IsEnum(AuthorisationType)
  authorisation_type!: AuthorisationType

  @IsOptional()
  @IsString()
  scope?: string

  @IsOptional()
  @IsString()
  expires_at?: string
}
