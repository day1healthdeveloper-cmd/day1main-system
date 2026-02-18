import { IsString, IsUUID } from 'class-validator'

export class RevokeRoleDto {
  @IsString()
  @IsUUID()
  role_id: string
}
