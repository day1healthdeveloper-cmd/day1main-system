import { IsString, IsEmail, IsOptional } from 'class-validator'

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  first_name?: string

  @IsString()
  @IsOptional()
  last_name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string
}
