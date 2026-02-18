import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class AddPracticeDto {
  @IsString()
  practice_name!: string

  @IsOptional()
  @IsString()
  practice_number?: string

  @IsString()
  address_line1!: string

  @IsOptional()
  @IsString()
  address_line2?: string

  @IsString()
  city!: string

  @IsString()
  province!: string

  @IsString()
  postal_code!: string

  @IsString()
  phone!: string

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean
}
