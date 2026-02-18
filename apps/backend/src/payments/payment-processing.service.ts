import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { MandateService } from './mandate.service';

export interface ProcessPaymentDto {
  invoiceId?: string;
  mandateId?: string;
  amount: number;
  paymentMethod: string;
  gatewayReference?: string;
}

export interface PaymentCallbackDto {
  paymentReference: string;
  gatewayReference: string;
  status: 'success' | 'failed';
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface SchedulePaymentRetryDto {
  paymentId: string;
  retryAttempt: number;
}

export interface ProcessRefundDto {
  paymentId?: string;
  amount: number;
  reason: string;
  requestedBy: string;
}

@Injectable()
export class PaymentProcessingService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private mandateService: MandateService,
  ) {}

  /**
   * Process a payment (initiate payment via gateway)
   */
  async processPayment(dto: ProcessPaymentDto, userId: string) {
    // Validate invoice if provided
    if (dto.invoiceId) {
      const { data: invoice, error } = await this.supabase
        .getClient()
        .from('invoices')
        .select('*')
        .eq('id', dto.invoiceId)
        .single();

      if (error || !invoice) {
        throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);
      }

      if (invoice.status === 'paid') {
        throw new BadRequestException('Invoice is already paid');
      }
    }

    // Validate mandate if provided
    if (dto.mandateId) {
      const isValid = await this.mandateService.isMandateValid(dto.mandateId);
      if (!isValid) {
        throw new BadRequestException('Mandate is not valid');
      }
    }

    // Generate unique payment reference
    const paymentReference = this.generatePaymentReference();

    // Create payment record
    const { data: payment, error: paymentError } = await this.supabase
      .getClient()
      .from('payments')
      .insert({
        payment_reference: paymentReference,
        invoice_id: dto.invoiceId,
        mandate_id: dto.mandateId,
        amount: dto.amount,
        payment_method: dto.paymentMethod,
        status: 'pending',
        gateway_reference: dto.gatewayReference,
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new BadRequestException('Failed to create payment');
    }

    // Audit log
    await this.auditService.logEvent({
      event_type: 'payment_initiated',
      entity_type: 'payment',
      entity_id: payment.id,
      user_id: userId,
      action: 'initiate',
      metadata: {
        paymentReference,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        invoiceId: dto.invoiceId,
        mandateId: dto.mandateId,
      },
    });

    return payment;
  }

  /**
   * Handle payment callback from gateway (idempotent)
   */
  async handlePaymentCallback(dto: PaymentCallbackDto, userId: string) {
    // Find payment by reference
    const { data: payment, error } = await this.supabase
      .getClient()
      .from('payments')
      .select('*, invoice:invoices(*)')
      .eq('payment_reference', dto.paymentReference)
      .single();

    if (error || !payment) {
      throw new NotFoundException(`Payment ${dto.paymentReference} not found`);
    }

    // Idempotency check - if already processed, return existing payment
    if (payment.status === 'completed' || payment.status === 'failed') {
      return payment;
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await this.supabase
      .getClient()
      .from('payments')
      .update({
        status: dto.status === 'success' ? 'completed' : 'failed',
        gateway_reference: dto.gatewayReference,
        processed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to update payment');
    }

    // If payment succeeded, update invoice status
    if (dto.status === 'success' && payment.invoice_id) {
      await this.supabase
        .getClient()
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', payment.invoice_id);
    }

    // If payment failed, create failure record
    if (dto.status === 'failed') {
      await this.supabase
        .getClient()
        .from('payment_failures')
        .insert({
          payment_id: payment.id,
          failure_reason: dto.failureReason || 'Unknown failure',
          failure_code: dto.metadata?.failureCode,
        });

      // Schedule retry
      await this.schedulePaymentRetry({
        paymentId: payment.id,
        retryAttempt: 1,
      });
    }

    // Audit log
    await this.auditService.logEvent({
      event_type: dto.status === 'success' ? 'payment_completed' : 'payment_failed',
      entity_type: 'payment',
      entity_id: payment.id,
      user_id: userId,
      action: dto.status === 'success' ? 'complete' : 'fail',
      metadata: {
        paymentReference: dto.paymentReference,
        gatewayReference: dto.gatewayReference,
        status: dto.status,
        failureReason: dto.failureReason,
        invoiceId: payment.invoice_id,
      },
    });

    return updatedPayment;
  }

  /**
   * Schedule payment retry with exponential backoff
   */
  async schedulePaymentRetry(dto: SchedulePaymentRetryDto) {
    const { data: payment, error } = await this.supabase
      .getClient()
      .from('payments')
      .select('*')
      .eq('id', dto.paymentId)
      .single();

    if (error || !payment) {
      throw new NotFoundException(`Payment ${dto.paymentId} not found`);
    }

    // Calculate retry schedule with exponential backoff
    // Retry 1: 1 hour, Retry 2: 4 hours, Retry 3: 24 hours, Retry 4: 72 hours
    const retryDelays = [1, 4, 24, 72]; // hours
    const maxRetries = 4;

    if (dto.retryAttempt > maxRetries) {
      // Max retries reached, mark as permanently failed
      await this.supabase
        .getClient()
        .from('payments')
        .update({ status: 'permanently_failed' })
        .eq('id', dto.paymentId);
      return null;
    }

    const delayHours = retryDelays[dto.retryAttempt - 1] || 72;
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + delayHours);

    // Create retry record
    const { data: retry, error: retryError } = await this.supabase
      .getClient()
      .from('payment_retries')
      .insert({
        payment_id: dto.paymentId,
        retry_attempt: dto.retryAttempt,
        scheduled_at: scheduledAt.toISOString(),
        status: 'scheduled',
      })
      .select()
      .single();

    if (retryError) {
      throw new BadRequestException('Failed to schedule retry');
    }

    return retry;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    const { data: payment, error } = await this.supabase
      .getClient()
      .from('payments')
      .select(`
        *,
        invoice:invoices(*),
        mandate:mandates(*),
        failures:payment_failures(*),
        retries:payment_retries(*)
      `)
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return payment;
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(paymentReference: string) {
    const { data: payment, error } = await this.supabase
      .getClient()
      .from('payments')
      .select(`
        *,
        invoice:invoices(*),
        mandate:mandates(*),
        failures:payment_failures(*),
        retries:payment_retries(*)
      `)
      .eq('payment_reference', paymentReference)
      .single();

    if (error || !payment) {
      throw new NotFoundException(`Payment ${paymentReference} not found`);
    }

    return payment;
  }

  /**
   * Get payments by invoice
   */
  async getPaymentsByInvoice(invoiceId: string) {
    const { data: payments, error } = await this.supabase
      .getClient()
      .from('payments')
      .select(`
        *,
        failures:payment_failures(*),
        retries:payment_retries(*)
      `)
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch payments');
    }

    return payments || [];
  }

  /**
   * Get pending retries
   */
  async getPendingRetries() {
    const now = new Date().toISOString();
    
    const { data: retries, error } = await this.supabase
      .getClient()
      .from('payment_retries')
      .select('*, payment:payments(*)')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new BadRequestException('Failed to fetch pending retries');
    }

    return retries || [];
  }

  /**
   * Process refund
   */
  async processRefund(dto: ProcessRefundDto, userId: string) {
    // Validate payment if provided
    if (dto.paymentId) {
      const { data: payment, error } = await this.supabase
        .getClient()
        .from('payments')
        .select('*')
        .eq('id', dto.paymentId)
        .single();

      if (error || !payment) {
        throw new NotFoundException(`Payment ${dto.paymentId} not found`);
      }

      if (payment.status !== 'completed') {
        throw new BadRequestException('Can only refund completed payments');
      }

      if (dto.amount > Number(payment.amount)) {
        throw new BadRequestException('Refund amount cannot exceed payment amount');
      }
    }

    // Create refund record
    const { data: refund, error: refundError } = await this.supabase
      .getClient()
      .from('refunds')
      .insert({
        payment_id: dto.paymentId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'pending',
        requested_at: new Date().toISOString(),
        requested_by: dto.requestedBy,
      })
      .select()
      .single();

    if (refundError || !refund) {
      throw new BadRequestException('Failed to create refund');
    }

    // Audit log
    await this.auditService.logEvent({
      event_type: 'refund_requested',
      entity_type: 'refund',
      entity_id: refund.id,
      user_id: userId,
      action: 'request',
      metadata: {
        paymentId: dto.paymentId,
        amount: dto.amount,
        reason: dto.reason,
      },
    });

    return refund;
  }

  /**
   * Approve refund
   */
  async approveRefund(refundId: string, userId: string) {
    const { data: refund, error } = await this.supabase
      .getClient()
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (error || !refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    if (refund.status !== 'pending') {
      throw new BadRequestException('Refund is not pending approval');
    }

    const { data: updated, error: updateError } = await this.supabase
      .getClient()
      .from('refunds')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
      })
      .eq('id', refundId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to approve refund');
    }

    // Audit log
    await this.auditService.logEvent({
      event_type: 'refund_approved',
      entity_type: 'refund',
      entity_id: refundId,
      user_id: userId,
      action: 'approve',
      metadata: {
        paymentId: refund.payment_id,
        amount: refund.amount,
      },
    });

    return updated;
  }

  /**
   * Process approved refund (via gateway)
   */
  async processApprovedRefund(refundId: string, userId: string) {
    const { data: refund, error } = await this.supabase
      .getClient()
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (error || !refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    if (refund.status !== 'approved') {
      throw new BadRequestException('Refund must be approved before processing');
    }

    // Update refund status to processed
    const { data: updated, error: updateError } = await this.supabase
      .getClient()
      .from('refunds')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to process refund');
    }

    // Audit log
    await this.auditService.logEvent({
      event_type: 'refund_processed',
      entity_type: 'refund',
      entity_id: refundId,
      user_id: userId,
      action: 'process',
      metadata: {
        paymentId: refund.payment_id,
        amount: refund.amount,
      },
    });

    return updated;
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string) {
    const { data: refund, error } = await this.supabase
      .getClient()
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (error || !refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    return refund;
  }

  /**
   * Get refunds by status
   */
  async getRefundsByStatus(status: string) {
    const { data: refunds, error } = await this.supabase
      .getClient()
      .from('refunds')
      .select('*')
      .eq('status', status)
      .order('requested_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch refunds');
    }

    return refunds || [];
  }

  /**
   * Generate unique payment reference
   */
  private generatePaymentReference(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `PAY-${dateStr}-${random}`;
  }
}
