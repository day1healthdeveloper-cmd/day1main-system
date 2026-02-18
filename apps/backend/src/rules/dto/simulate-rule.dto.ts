import { IsString, IsObject, IsOptional } from 'class-validator'

export class SimulateRuleDto {
  @IsOptional()
  @IsString()
  rule_name?: string

  @IsObject()
  rule_definition: any

  @IsObject()
  context: any
}
