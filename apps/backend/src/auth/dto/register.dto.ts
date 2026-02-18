import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(2)
  first_name: string

  @IsString()
  @MinLength(2)
  last_name: string

  @IsString()
  @IsOptional()
  phone?: string
}
