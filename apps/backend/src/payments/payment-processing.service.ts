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
      const invoice = await this.supabase.getClient().invoice.findUnique({
        where: { id: dto.invoiceId },
      });

      if (!invoice) {
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
    const payment = await this.supabase.getClient().payment.create({
      data: {
        payment_reference: paymentReference,
        invoice_id: dto.invoiceId,
        mandate_id: dto.mandateId,
        amount: dto.amount,
        payment_method: dto.paymentMethod,
        status: 'pending',
        gateway_reference: dto.gatewayReference,
      },
    });

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
    const payment = await this.supabase.getClient().payment.findUnique({
      where: { payment_reference: dto.paymentReference },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${dto.paymentReference} not found`);
    }

    // Idempotency check - if already processed, return existing payment
    if (payment.status === 'completed' || payment.status === 'failed') {
      return payment;
    }

    // Update payment status
    const updatedPayment = await this.supabase.getClient().payment.update({
      where: { id: payment.id },
      data: {
        status: dto.status === 'success' ? 'completed' : 'failed',
        gateway_reference: dto.gatewayReference,
        processed_at: new Date(),
      },
    });

    // If payment succeeded, update invoice status
    if (dto.status === 'success' && payment.invoice_id) {
      await this.supabase.getClient().invoice.update({
        where: { id: payment.invoice_id },
        data: { status: 'paid' },
      });
    }

    // If payment failed, create failure record
    if (dto.status === 'failed') {
      await this.supabase.getClient().paymentFailure.create({
        data: {
          payment_id: payment.id,
          failure_reason: dto.failureReason || 'Unknown failure',
          failure_code: dto.metadata?.failureCode,
        },
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
    const payment = await this.supabase.getClient().payment.findUnique({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${dto.paymentId} not found`);
    }

    // Calculate retry schedule with exponential backoff
    // Retry 1: 1 hour, Retry 2: 4 hours, Retry 3: 24 hours, Retry 4: 72 hours
    const retryDelays = [1, 4, 24, 72]; // hours
    const maxRetries = 4;

    if (dto.retryAttempt > maxRetries) {
      // Max retries reached, mark as permanently failed
      await this.supabase.getClient().payment.update({
        where: { id: dto.paymentId },
        data: { status: 'permanently_failed' },
      });
      return null;
    }

    const delayHours = retryDelays[dto.retryAttempt - 1] || 72;
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + delayHours);

    // Create retry record
    const retry = await this.supabase.getClient().paymentRetry.create({
      data: {
        payment_id: dto.paymentId,
        retry_attempt: dto.retryAttempt,
        scheduled_at: scheduledAt,
        status: 'scheduled',
      },
    });

    return retry;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    const payment = await this.supabase.getClient().payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: true,
        mandate: true,
        failures: true,
        retries: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return payment;
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(paymentReference: string) {
    const payment = await this.supabase.getClient().payment.findUnique({
      where: { payment_reference: paymentReference },
      include: {
        invoice: true,
        mandate: true,
        failures: true,
        retries: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentReference} not found`);
    }

    return payment;
  }

  /**
   * Get payments by invoice
   */
  async getPaymentsByInvoice(invoiceId: string) {
    return this.supabase.getClient().payment.findMany({
      where: { invoice_id: invoiceId },
      include: {
        failures: true,
        retries: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get pending retries
   */
  async getPendingRetries() {
    return this.supabase.getClient().paymentRetry.findMany({
      where: {
        status: 'scheduled',
        scheduled_at: { lte: new Date() },
      },
      include: {
        payment: true,
      },
      orderBy: { scheduled_at: 'asc' },
    });
  }

  /**
   * Process refund
   */
  async processRefund(dto: ProcessRefundDto, userId: string) {
    // Validate payment if provided
    if (dto.paymentId) {
      const payment = await this.supabase.getClient().payment.findUnique({
        where: { id: dto.paymentId },
      });

      if (!payment) {
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
    const refund = await this.supabase.getClient().refund.create({
      data: {
        payment_id: dto.paymentId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'pending',
        requested_at: new Date(),
        requested_by: dto.requestedBy,
      },
    });

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
    const refund = await this.supabase.getClient().refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    if (refund.status !== 'pending') {
      throw new BadRequestException('Refund is not pending approval');
    }

    const updated = await this.supabase.getClient().refund.update({
      where: { id: refundId },
      data: {
        status: 'approved',
        approved_at: new Date(),
        approved_by: userId,
      },
    });

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
    const refund = await this.supabase.getClient().refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    if (refund.status !== 'approved') {
      throw new BadRequestException('Refund must be approved before processing');
    }

    // Update refund status to processed
    const updated = await this.supabase.getClient().refund.update({
      where: { id: refundId },
      data: {
        status: 'processed',
        processed_at: new Date(),
      },
    });

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
    const refund = await this.supabase.getClient().refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException(`Refund ${refundId} not found`);
    }

    return refund;
  }

  /**
   * Get refunds by status
   */
  async getRefundsByStatus(status: string) {
    return this.supabase.getClient().refund.findMany({
      where: { status },
      orderBy: { requested_at: 'desc' },
    });
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
