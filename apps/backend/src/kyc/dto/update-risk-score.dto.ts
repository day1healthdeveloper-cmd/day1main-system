import { IsNumber, IsString, Min, Max } from 'class-validator'

export class UpdateRiskScoreDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  risk_score: number

  @IsString()
  reason: string
}
