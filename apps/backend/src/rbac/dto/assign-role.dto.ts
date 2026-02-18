import { IsString, IsUUID } from 'class-validator'

export class AssignRoleDto {
  @IsString()
  @IsUUID()
  role_id: string
}
