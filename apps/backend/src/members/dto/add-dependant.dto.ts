import { IsString, IsDateString, IsIn, Length } from 'class-validator'

export class AddDependantDto {
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

  @IsString()
  @IsIn(['spouse', 'child', 'parent', 'sibling', 'other'])
  relationship: string
}
