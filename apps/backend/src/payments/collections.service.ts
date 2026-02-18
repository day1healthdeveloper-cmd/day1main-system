import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { PaymentProcessingService } from './payment-processing.service';

export interface ScheduleDebitOrderDto {
  policyId: string;
  amount: number;
  scheduledDate: Date;
}

export interface ProcessArrearsDto {
  policyId: string;
}

export interface ReinstatePolicyDto {
  policyId: string;
  paymentReference?: string;
}

@Injectable()
export class CollectionsService {
  // Grace period in days before lapse
  private readonly GRACE_PERIOD_DAYS = 30;

  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private paymentProcessingService: PaymentProcessingService,
  ) {}

  /**
   * Schedule debit order for policy
   */
  async scheduleDebitOrder(dto: ScheduleDebitOrderDto, userId: string) {
    // Validate policy exists
    const policy = await this.supabase.getClient().policy.findUnique({
      where: { id: dto.policyId },
      include: { policy_members: { include: { member: true } } },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${dto.policyId} not found`);
    }

    if (policy.status === 'lapsed' || policy.status === 'cancelled') {
      throw new BadRequestException('Cannot schedule debit order for lapsed or cancelled policy');
    }

    // Get active mandate for principal member
    const principalMember = policy.policy_members.find(pm => pm.relationship === 'principal');
    if (!principalMember) {
      throw new BadRequestException('No principal member found for policy');
    }

    // Create invoice for the billing period
    const invoice = await this.supabase.getClient().invoice.create({
      data: {
        invoice_number: this.generateInvoiceNumber(),
        policy_id: dto.policyId,
        billing_period_start: new Date(),
        billing_period_end: this.calculateBillingPeriodEnd(policy.billing_frequency),
        total_amount: dto.amount,
        status: 'pending',
        due_date: dto.scheduledDate,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'debit_order_scheduled',
      entity_type: 'invoice',
      entity_id: invoice.id,
      user_id: userId,
      action: 'schedule',
      metadata: {
        policyId: dto.policyId,
        amount: dto.amount,
        scheduledDate: dto.scheduledDate,
      },
    });

    return invoice;
  }

  /**
   * Process arrears for a policy (check grace period and lapse)
   */
  async processArrears(dto: ProcessArrearsDto, userId: string) {
    const policy = await this.supabase.getClient().policy.findUnique({
      where: { id: dto.policyId },
      include: {
        invoices: {
          where: { status: 'pending' },
          orderBy: { due_date: 'asc' },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${dto.policyId} not found`);
    }

    // Check for overdue invoices
    const overdueInvoices = policy.invoices.filter(
      inv => inv.due_date < new Date() && inv.status === 'pending',
    );

    if (overdueInvoices.length === 0) {
      return {
        policyId: dto.policyId,
        status: 'current',
        overdueAmount: 0,
        gracePeriodExpiry: null,
      };
    }

    // Calculate total arrears
    const totalArrears = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.total_amount),
      0,
    );

    // Get oldest overdue invoice to calculate grace period
    const oldestOverdue = overdueInvoices[0];
    const gracePeriodExpiry = new Date(oldestOverdue.due_date);
    gracePeriodExpiry.setDate(gracePeriodExpiry.getDate() + this.GRACE_PERIOD_DAYS);

    const now = new Date();
    const isGracePeriodExpired = now > gracePeriodExpiry;

    // If grace period expired, lapse the policy
    if (isGracePeriodExpired && policy.status === 'active') {
      await this.lapsePolicy(dto.policyId, userId, 'Grace period expired due to non-payment');
    }

    // Send arrears notification
    await this.sendArrearsNotification(dto.policyId, totalArrears, gracePeriodExpiry);

    return {
      policyId: dto.policyId,
      status: isGracePeriodExpired ? 'lapsed' : 'in_arrears',
      overdueAmount: totalArrears,
      gracePeriodExpiry,
      overdueInvoices: overdueInvoices.length,
    };
  }

  /**
   * Lapse a policy due to non-payment
   */
  async lapsePolicy(policyId: string, userId: string, reason: string) {
    const policy = await this.supabase.getClient().policy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${policyId} not found`);
    }

    if (policy.status === 'lapsed') {
      throw new BadRequestException('Policy is already lapsed');
    }

    // Update policy status
    const updated = await this.supabase.getClient().policy.update({
      where: { id: policyId },
      data: { status: 'lapsed' },
    });

    // Create status history record
    await this.supabase.getClient().policyStatusHistory.create({
      data: {
        policy_id: policyId,
        status: 'lapsed',
        reason,
        changed_by: userId,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'policy_lapsed',
      entity_type: 'policy',
      entity_id: policyId,
      user_id: userId,
      action: 'lapse',
      metadata: {
        reason,
        previousStatus: policy.status,
      },
    });

    return updated;
  }

  /**
   * Reinstate a lapsed policy
   */
  async reinstatePolicy(dto: ReinstatePolicyDto, userId: string) {
    const policy = await this.supabase.getClient().policy.findUnique({
      where: { id: dto.policyId },
      include: {
        invoices: {
          where: { status: 'pending' },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${dto.policyId} not found`);
    }

    if (policy.status !== 'lapsed') {
      throw new BadRequestException('Only lapsed policies can be reinstated');
    }

    // Check if all arrears are paid
    const unpaidInvoices = policy.invoices.filter(inv => inv.status === 'pending');
    if (unpaidInvoices.length > 0 && !dto.paymentReference) {
      throw new BadRequestException('All arrears must be paid before reinstatement');
    }

    // Update policy status
    const updated = await this.supabase.getClient().policy.update({
      where: { id: dto.policyId },
      data: { status: 'active' },
    });

    // Create status history record
    await this.supabase.getClient().policyStatusHistory.create({
      data: {
        policy_id: dto.policyId,
        status: 'active',
        reason: 'Policy reinstated after arrears payment',
        changed_by: userId,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'policy_reinstated',
      entity_type: 'policy',
      entity_id: dto.policyId,
      user_id: userId,
      action: 'reinstate',
      metadata: {
        paymentReference: dto.paymentReference,
      },
    });

    return updated;
  }

  /**
   * Get policies in arrears
   */
  async getPoliciesInArrears() {
    const policies = await this.supabase.getClient().policy.findMany({
      where: {
        status: 'active',
        invoices: {
          some: {
            status: 'pending',
            due_date: { lt: new Date() },
          },
        },
      },
      include: {
        invoices: {
          where: {
            status: 'pending',
            due_date: { lt: new Date() },
          },
        },
      },
    });

    return policies.map(policy => {
      const totalArrears = policy.invoices.reduce(
        (sum, inv) => sum + Number(inv.total_amount),
        0,
      );

      const oldestOverdue = policy.invoices.sort(
        (a, b) => a.due_date.getTime() - b.due_date.getTime(),
      )[0];

      const gracePeriodExpiry = new Date(oldestOverdue.due_date);
      gracePeriodExpiry.setDate(gracePeriodExpiry.getDate() + this.GRACE_PERIOD_DAYS);

      return {
        policyId: policy.id,
        policyNumber: policy.policy_number,
        totalArrears,
        overdueInvoices: policy.invoices.length,
        gracePeriodExpiry,
        daysOverdue: Math.floor(
          (new Date().getTime() - oldestOverdue.due_date.getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    });
  }

  /**
   * Get policies approaching grace period expiry
   */
  async getPoliciesApproachingLapse() {
    const policies = await this.getPoliciesInArrears();

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return policies.filter(
      p => p.gracePeriodExpiry > now && p.gracePeriodExpiry <= sevenDaysFromNow,
    );
  }

  /**
   * Get lapsed policies eligible for reinstatement
   */
  async getLapsedPolicies() {
    return this.supabase.getClient().policy.findMany({
      where: { status: 'lapsed' },
      include: {
        invoices: {
          where: { status: 'pending' },
        },
        status_history: {
          where: { status: 'lapsed' },
          orderBy: { changed_at: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Send arrears notification (placeholder - would integrate with messaging service)
   */
  private async sendArrearsNotification(
    policyId: string,
    amount: number,
    gracePeriodExpiry: Date,
  ) {
    // This would integrate with the messaging service to send SMS/email
    // For now, just log it
    console.log(`Arrears notification for policy ${policyId}: R${amount}, grace period expires ${gracePeriodExpiry}`);
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `INV-${dateStr}-${random}`;
  }

  /**
   * Calculate billing period end based on frequency
   */
  private calculateBillingPeriodEnd(frequency: string): Date {
    const end = new Date();
    switch (frequency.toLowerCase()) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'annually':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    return end;
  }
}
