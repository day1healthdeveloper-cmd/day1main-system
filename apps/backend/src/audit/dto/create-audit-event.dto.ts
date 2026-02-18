import { IsString, IsOptional, IsObject } from 'class-validator'

export class CreateAuditEventDto {
  @IsString()
  event_type: string

  @IsString()
  entity_type: string

  @IsString()
  entity_id: string

  @IsString()
  user_id: string

  @IsString()
  action: string

  @IsObject()
  @IsOptional()
  before_state?: Record<string, any>

  @IsObject()
  @IsOptional()
  after_state?: Record<string, any>

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>

  @IsString()
  @IsOptional()
  ip_address?: string

  @IsString()
  @IsOptional()
  user_agent?: string
}
