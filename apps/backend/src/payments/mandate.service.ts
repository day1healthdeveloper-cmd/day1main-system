import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface CreateMandateDto {
  memberId: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  branchCode?: string;
  debicheckRef?: string;
}

export interface ValidateBankAccountDto {
  accountNumber: string;
  accountType: string;
  branchCode?: string;
}

@Injectable()
export class MandateService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a new payment mandate for a member
   */
  async createMandate(dto: CreateMandateDto, userId: string) {
    // Validate member exists
    const member = await this.supabase.getClient().member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${dto.memberId} not found`);
    }

    // Validate bank account details
    this.validateBankAccountDetails({
      accountNumber: dto.accountNumber,
      accountType: dto.accountType,
      branchCode: dto.branchCode,
    });

    // Create mandate
    const mandate = await this.supabase.getClient().mandate.create({
      data: {
        member_id: dto.memberId,
        bank_name: dto.bankName,
        account_number: dto.accountNumber,
        account_type: dto.accountType,
        branch_code: dto.branchCode,
        debicheck_ref: dto.debicheckRef,
        status: 'pending',
        expires_at: this.calculateExpiryDate(),
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'mandate_created',
      entity_type: 'mandate',
      entity_id: mandate.id,
      user_id: userId,
      action: 'create',
      metadata: {
        memberId: dto.memberId,
        bankName: dto.bankName,
        accountType: dto.accountType,
      },
    });

    return mandate;
  }

  /**
   * Get mandate by ID
   */
  async getMandateById(mandateId: string) {
    const mandate = await this.supabase.getClient().mandate.findUnique({
      where: { id: mandateId },
    });

    if (!mandate) {
      throw new NotFoundException(`Mandate ${mandateId} not found`);
    }

    return mandate;
  }

  /**
   * Get all mandates for a member
   */
  async getMandatesByMember(memberId: string) {
    return this.supabase.getClient().mandate.findMany({
      where: { member_id: memberId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get active mandate for a member
   */
  async getActiveMandateForMember(memberId: string) {
    const mandate = await this.supabase.getClient().mandate.findFirst({
      where: {
        member_id: memberId,
        status: 'active',
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    return mandate;
  }

  /**
   * Activate a mandate (after DebiCheck registration)
   */
  async activateMandate(mandateId: string, userId: string, debicheckRef?: string) {
    const mandate = await this.getMandateById(mandateId);

    if (mandate.status === 'active') {
      throw new BadRequestException('Mandate is already active');
    }

    if (mandate.status === 'cancelled') {
      throw new BadRequestException('Cannot activate a cancelled mandate');
    }

    const updated = await this.supabase.getClient().mandate.update({
      where: { id: mandateId },
      data: {
        status: 'active',
        debicheck_ref: debicheckRef || mandate.debicheck_ref,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'mandate_activated',
      entity_type: 'mandate',
      entity_id: mandateId,
      user_id: userId,
      action: 'activate',
      metadata: {
        debicheckRef: debicheckRef || mandate.debicheck_ref,
      },
    });

    return updated;
  }

  /**
   * Cancel a mandate
   */
  async cancelMandate(mandateId: string, userId: string, reason?: string) {
    const mandate = await this.getMandateById(mandateId);

    if (mandate.status === 'cancelled') {
      throw new BadRequestException('Mandate is already cancelled');
    }

    const updated = await this.supabase.getClient().mandate.update({
      where: { id: mandateId },
      data: {
        status: 'cancelled',
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'mandate_cancelled',
      entity_type: 'mandate',
      entity_id: mandateId,
      user_id: userId,
      action: 'cancel',
      metadata: {
        reason,
        previousStatus: mandate.status,
      },
    });

    return updated;
  }

  /**
   * Mark mandate as expired
   */
  async expireMandate(mandateId: string, userId: string) {
    const mandate = await this.getMandateById(mandateId);

    if (mandate.status === 'expired') {
      throw new BadRequestException('Mandate is already expired');
    }

    const updated = await this.supabase.getClient().mandate.update({
      where: { id: mandateId },
      data: {
        status: 'expired',
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'mandate_expired',
      entity_type: 'mandate',
      entity_id: mandateId,
      user_id: userId,
      action: 'expire',
      metadata: {
        expiresAt: mandate.expires_at,
      },
    });

    return updated;
  }

  /**
   * Validate bank account details
   */
  validateBankAccountDetails(dto: ValidateBankAccountDto): boolean {
    // Validate account number (basic validation)
    if (!dto.accountNumber || dto.accountNumber.length < 8) {
      throw new BadRequestException('Invalid account number');
    }

    // Validate account type
    const validAccountTypes = ['cheque', 'savings', 'transmission', 'current'];
    if (!validAccountTypes.includes(dto.accountType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`,
      );
    }

    // Validate branch code (if provided)
    if (dto.branchCode && dto.branchCode.length !== 6) {
      throw new BadRequestException('Branch code must be 6 digits');
    }

    return true;
  }

  /**
   * Calculate mandate expiry date (3 years from now)
   */
  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    return expiryDate;
  }

  /**
   * Check if mandate is valid for use
   */
  async isMandateValid(mandateId: string): Promise<boolean> {
    const mandate = await this.getMandateById(mandateId);

    // Check status
    if (mandate.status !== 'active') {
      return false;
    }

    // Check expiry
    if (mandate.expires_at && mandate.expires_at < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get mandates expiring soon (within 30 days)
   */
  async getMandatesExpiringSoon() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.supabase.getClient().mandate.findMany({
      where: {
        status: 'active',
        expires_at: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
      orderBy: { expires_at: 'asc' },
    });
  }
}
