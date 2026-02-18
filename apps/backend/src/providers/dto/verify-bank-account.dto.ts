import { IsString, IsBoolean, IsOptional } from 'class-validator'

export class VerifyBankAccountDto {
  @IsString()
  bank_name!: string

  @IsString()
  account_number!: string

  @IsString()
  account_type!: string

  @IsString()
  branch_code!: string

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean
}
