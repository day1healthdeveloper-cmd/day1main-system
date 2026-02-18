import {
  IsString,
  IsEmail,
  IsDateString,
  IsIn,
  IsOptional,
  ValidateNested,
  Length,
} from 'class-validator'
import { Type } from 'class-transformer'

class AddressDto {
  @IsString()
  line1: string

  @IsString()
  @IsOptional()
  line2?: string

  @IsString()
  city: string

  @IsString()
  province: string

  @IsString()
  postal_code: string

  @IsString()
  @IsOptional()
  country?: string
}

export class RegisterMemberDto {
  @IsString()
  @Length(13, 13, { message: 'ID number must be exactly 13 digits' })
  id_number: string

  @IsString()
  first_name: string

  @IsString()
  last_name: string

  @IsDateString()
  date_of_birth: string

  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender: string

  @IsEmail()
  email: string

  @IsString()
  phone: string

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto
}
