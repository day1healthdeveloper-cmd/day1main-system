import { IsString, Length } from 'class-validator'

export class VerifyTotpSetupDto {
  @IsString()
  device_id: string

  @IsString()
  @Length(6, 6)
  code: string
}
