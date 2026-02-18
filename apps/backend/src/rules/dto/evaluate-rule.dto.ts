import { IsObject, IsOptional, IsBoolean } from 'class-validator'

export class EvaluateRuleDto {
  @IsObject()
  context: any

  @IsOptional()
  @IsBoolean()
  simulation_mode?: boolean
}
