import { IsObject, IsNotEmpty } from 'class-validator'

export class SubmitUnderwritingDto {
  @IsObject()
  @IsNotEmpty()
  questionnaire_responses: {
    age?: number
    smoker?: boolean
    pre_existing_conditions?: string[]
    chronic_medication?: boolean
    hospitalizations_last_2_years?: number
    family_history_serious_illness?: boolean
    bmi?: number
    [key: string]: any
  }
}
