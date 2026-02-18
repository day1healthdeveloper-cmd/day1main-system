export class UnderwritingDecision {
  underwriting_id: string
  status: 'pending' | 'approved' | 'declined' | 'referred'
  risk_rating: 'low' | 'medium' | 'high' | 'very_high'
  risk_score: number
  reason: string
  premium_loading: number
  exclusions: string[]
  conditions: string[]
  assessed_at: Date
}
