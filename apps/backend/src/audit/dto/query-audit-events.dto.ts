import { IsString, IsOptional, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryAuditEventsDto {
  @IsString()
  @IsOptional()
  event_type?: string

  @IsString()
  @IsOptional()
  entity_type?: string

  @IsString()
  @IsOptional()
  entity_id?: string

  @IsString()
  @IsOptional()
  user_id?: string

  @IsString()
  @IsOptional()
  action?: string

  @IsString()
  @IsOptional()
  start_date?: string

  @IsString()
  @IsOptional()
  end_date?: string

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  skip?: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  take?: number
}
