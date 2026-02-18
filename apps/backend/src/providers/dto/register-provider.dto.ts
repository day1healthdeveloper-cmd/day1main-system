import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator'

export enum ProviderType {
  DOCTOR = 'doctor',
  HOSPITAL = 'hospital',
  PHARMACY = 'pharmacy',
  SPECIALIST = 'specialist',
}

export class RegisterProviderDto {
  @IsString()
  name!: string

  @IsEnum(ProviderType)
  provider_type!: ProviderType

  @IsOptional()
  @IsString()
  registration_num?: string

  @IsEmail()
  email!: string

  @IsString()
  phone!: string
}
