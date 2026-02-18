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
    const { data: member, error: memberError } = await this.supabase
      .getClient()
      .from('members')
      .select('*')
      .eq('id', dto.memberId)
      .single();

    if (memberError || !member) {
      throw new NotFoundException(`Member ${dto.memberId} not found`);
    }

    // Validate bank account details
    this.validateBankAccountDetails({
      accountNumber: dto.accountNumber,
      accountType: dto.accountType,
      branchCode: dto.branchCode,
    });

    // Create mandate
    const { data: mandate, error: mandateError } = await this.supabase
      .getClient()
      .from('mandates')
      .insert({
        member_id: dto.memberId,
        bank_name: dto.bankName,
        account_number: dto.accountNumber,
        account_type: dto.accountType,
        branch_code: dto.branchCode,
        debicheck_ref: dto.debicheckRef,
        status: 'pending',
        expires_at: this.calculateExpiryDate().toISOString(),
      })
      .select()
      .single();

    if (mandateError || !mandate) {
      throw new BadRequestException('Failed to create mandate');
    }

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
    const { data: mandate, error } = await this.supabase
      .getClient()
      .from('mandates')
      .select('*')
      .eq('id', mandateId)
      .single();

    if (error || !mandate) {
      throw new NotFoundException(`Mandate ${mandateId} not found`);
    }

    return mandate;
  }

  /**
   * Get all mandates for a member
   */
  async getMandatesByMember(memberId: string) {
    const { data: mandates, error } = await this.supabase
      .getClient()
      .from('mandates')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch mandates');
    }

    return mandates || [];
  }

  /**
   * Get active mandate for a member
   */
  async getActiveMandateForMember(memberId: string) {
    const now = new Date().toISOString();
    
    const { data: mandate, error } = await this.supabase
      .getClient()
      .from('mandates')
      .select('*')
      .eq('member_id', memberId)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is acceptable
      throw new BadRequestException('Failed to fetch active mandate');
    }

    return mandate || null;
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

    const { data: updated, error } = await this.supabase
      .getClient()
      .from('mandates')
      .update({
        status: 'active',
        debicheck_ref: debicheckRef || mandate.debicheck_ref,
      })
      .eq('id', mandateId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to activate mandate');
    }

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

    const { data: updated, error } = await this.supabase
      .getClient()
      .from('mandates')
      .update({
        status: 'cancelled',
      })
      .eq('id', mandateId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to cancel mandate');
    }

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

    const { data: updated, error } = await this.supabase
      .getClient()
      .from('mandates')
      .update({
        status: 'expired',
      })
      .eq('id', mandateId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to expire mandate');
    }

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
    const now = new Date().toISOString();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString();

    const { data: mandates, error } = await this.supabase
      .getClient()
      .from('mandates')
      .select('*')
      .eq('status', 'active')
      .lte('expires_at', thirtyDaysStr)
      .gt('expires_at', now)
      .order('expires_at', { ascending: true });

    if (error) {
      throw new BadRequestException('Failed to fetch expiring mandates');
    }

    return mandates || [];
  }
}
