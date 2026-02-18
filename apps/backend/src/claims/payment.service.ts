import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'

export interface ClaimPayment {
  id: string
  claim_id: string
  payment_type: 'provider' | 'member_reimbursement'
  payee_id: string
  payee_name: string
  amount: number
  status: 'scheduled' | 'batched' | 'processing' | 'paid' | 'failed'
  scheduled_date: Date
  payment_date?: Date
  batch_id?: string
  reference: string
}

export interface PaymentBatch {
  id: string
  batch_number: string
  batch_date: Date
  total_amount: number
  payment_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_by: string
}

export interface Statement {
  id: string
  statement_type: 'member' | 'provider_remittance'
  recipient_id: string
  statement_number: string
  period_start: Date
  period_end: Date
  total_amount: number
  claims: any[]
  generated_at: Date
}

@Injectable()
export class PaymentService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async scheduleClaimPayment(
    claimId: string,
    paymentType: 'provider' | 'member_reimbursement',
    userId: string,
  ): Promise<ClaimPayment> {
    const { data: claim, error } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        provider:providers(*),
        member:members(*),
        policy:policies(*)
      `)
      .eq('id', claimId)
      .single()

    if (error || !claim) {
      throw new NotFoundException('Claim not found')
    }

    if (claim.status !== 'approved') {
      throw new BadRequestException('Only approved claims can be scheduled for payment')
    }

    const payeeId = paymentType === 'provider' ? claim.provider_id : claim.member_id
    const payeeName =
      paymentType === 'provider'
        ? claim.provider.name
        : `${claim.member.first_name} ${claim.member.last_name}`

    const reference = await this.generatePaymentReference(paymentType)
    const scheduledDate = this.calculateScheduledDate(3)
    const paymentId = `payment-${claimId}-${Date.now()}`

    await this.auditService.logEvent({
      event_type: 'payment',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'payment_scheduled',
      metadata: {
        payment_id: paymentId,
        claim_number: claim.claim_number,
        payment_type: paymentType,
        payee_id: payeeId,
        payee_name: payeeName,
        amount: claim.total_approved.toString(),
        scheduled_date: scheduledDate.toISOString(),
        reference: reference,
      },
    })

    return {
      id: paymentId,
      claim_id: claimId,
      payment_type: paymentType,
      payee_id: payeeId,
      payee_name: payeeName,
      amount: parseFloat(claim.total_approved.toString()),
      status: 'scheduled',
      scheduled_date: scheduledDate,
      reference: reference,
    }
  }

  private async generatePaymentReference(paymentType: string): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const prefix = paymentType === 'provider' ? 'PP' : 'MR'
    const sequence = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0')

    return `${prefix}-${dateStr}-${sequence}`
  }

  private calculateScheduledDate(businessDays: number): Date {
    const date = new Date()
    let daysAdded = 0

    while (daysAdded < businessDays) {
      date.setDate(date.getDate() + 1)
      const dayOfWeek = date.getDay()

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++
      }
    }

    return date
  }

  async generatePaymentBatch(
    paymentType: 'provider' | 'member_reimbursement',
    userId: string,
  ): Promise<PaymentBatch> {
    const batchNumber = await this.generateBatchNumber()
    const batchId = `batch-${Date.now()}`

    await this.auditService.logEvent({
      event_type: 'payment',
      entity_type: 'payment_batch',
      entity_id: batchId,
      user_id: userId,
      action: 'batch_created',
      metadata: {
        batch_number: batchNumber,
        payment_type: paymentType,
        batch_date: new Date().toISOString(),
      },
    })

    return {
      id: batchId,
      batch_number: batchNumber,
      batch_date: new Date(),
      total_amount: 0,
      payment_count: 0,
      status: 'pending',
      created_by: userId,
    }
  }

  private async generateBatchNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const sequence = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')

    return `BATCH-${dateStr}-${sequence}`
  }

  async generateMemberStatement(
    memberId: string,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<Statement> {
    const { data: member, error: memberError } = await this.supabase
      .getClient()
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      throw new NotFoundException('Member not found')
    }

    const { data: claims, error: claimsError } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        provider:providers(*),
        claim_lines(*)
      `)
      .eq('member_id', memberId)
      .gte('service_date', periodStart.toISOString())
      .lte('service_date', periodEnd.toISOString())
      .eq('status', 'paid')
      .order('service_date', { ascending: true })

    if (claimsError) throw claimsError

    const totalAmount = (claims || []).reduce((sum, claim) => {
      return sum + parseFloat(claim.total_approved.toString())
    }, 0)

    const statementNumber = await this.generateStatementNumber('MEM')
    const statementId = `statement-${Date.now()}`

    await this.auditService.logEvent({
      event_type: 'statement',
      entity_type: 'member',
      entity_id: memberId,
      user_id: userId,
      action: 'statement_generated',
      metadata: {
        statement_id: statementId,
        statement_number: statementNumber,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        claim_count: claims?.length || 0,
        total_amount: totalAmount.toString(),
      },
    })

    return {
      id: statementId,
      statement_type: 'member',
      recipient_id: memberId,
      statement_number: statementNumber,
      period_start: periodStart,
      period_end: periodEnd,
      total_amount: totalAmount,
      claims: (claims || []).map((c) => ({
        claim_number: c.claim_number,
        service_date: c.service_date,
        provider_name: c.provider.name,
        total_claimed: parseFloat(c.total_claimed.toString()),
        total_approved: parseFloat(c.total_approved.toString()),
      })),
      generated_at: new Date(),
    }
  }

  async generateProviderRemittance(
    providerId: string,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<Statement> {
    const { data: provider, error: providerError } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      throw new NotFoundException('Provider not found')
    }

    const { data: claims, error: claimsError } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        member:members(*),
        claim_lines(*)
      `)
      .eq('provider_id', providerId)
      .gte('service_date', periodStart.toISOString())
      .lte('service_date', periodEnd.toISOString())
      .eq('status', 'paid')
      .order('service_date', { ascending: true })

    if (claimsError) throw claimsError

    const totalAmount = (claims || []).reduce((sum, claim) => {
      return sum + parseFloat(claim.total_approved.toString())
    }, 0)

    const statementNumber = await this.generateStatementNumber('RA')
    const statementId = `remittance-${Date.now()}`

    await this.auditService.logEvent({
      event_type: 'statement',
      entity_type: 'provider',
      entity_id: providerId,
      user_id: userId,
      action: 'remittance_generated',
      metadata: {
        statement_id: statementId,
        statement_number: statementNumber,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        claim_count: claims?.length || 0,
        total_amount: totalAmount.toString(),
      },
    })

    return {
      id: statementId,
      statement_type: 'provider_remittance',
      recipient_id: providerId,
      statement_number: statementNumber,
      period_start: periodStart,
      period_end: periodEnd,
      total_amount: totalAmount,
      claims: (claims || []).map((c) => ({
        claim_number: c.claim_number,
        service_date: c.service_date,
        member_name: `${c.member.first_name} ${c.member.last_name}`,
        total_claimed: parseFloat(c.total_claimed.toString()),
        total_approved: parseFloat(c.total_approved.toString()),
      })),
      generated_at: new Date(),
    }
  }

  private async generateStatementNumber(prefix: string): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const sequence = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0')

    return `${prefix}-${dateStr}-${sequence}`
  }

  async markClaimAsPaid(claimId: string, paymentDate: Date, userId: string): Promise<void> {
    const { data: claim, error } = await this.supabase
      .getClient()
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single()

    if (error || !claim) {
      throw new NotFoundException('Claim not found')
    }

    const { error: updateError } = await this.supabase
      .getClient()
      .from('claims')
      .update({
        status: 'paid',
        total_paid: claim.total_approved,
      })
      .eq('id', claimId)

    if (updateError) throw updateError

    await this.auditService.logEvent({
      event_type: 'payment',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'claim_paid',
      metadata: {
        claim_number: claim.claim_number,
        payment_date: paymentDate.toISOString(),
        amount_paid: claim.total_approved.toString(),
      },
    })
  }
}
