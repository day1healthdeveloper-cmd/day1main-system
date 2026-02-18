import { IsString, IsDateString, IsOptional } from 'class-validator'

export class VerifyCredentialDto {
  @IsString()
  credential_type!: string

  @IsString()
  credential_number!: string

  @IsString()
  issuing_body!: string

  @IsDateString()
  issue_date!: string

  @IsOptional()
  @IsDateString()
  expiry_date?: string
}
