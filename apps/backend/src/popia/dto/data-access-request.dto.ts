import { IsString, IsEnum } from 'class-validator'

export class DataAccessRequestDto {
  @IsString()
  member_id: string

  @IsString()
  request_type: string // 'access', 'rectification', 'erasure'

  @IsString()
  reason: string
}
