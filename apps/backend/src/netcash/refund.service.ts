import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NetcashApiClient } from './netcash-api.client';
import { CreateRefundDto, UpdateRefundStatusDto } from './dto/refund.dto';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly apiClient: NetcashApiClient,
  ) {}

  /**
   * Create a refund request
   */
  async createRefundRequest(dto: CreateRefundDto, requestedBy: string) {
    this.logger.log(`Creating refund request for member ${dto.memberId}`);

    // Validate member exists
    const { data: member, error: memberError } = await this.supabase.getClient()
      .from('members')
      .select('id, member_number, first_name, last_name, email')
      .eq('id', dto.memberId)
      .single();

    if (memberError || !member) {
      throw new NotFoundException('Member not found');
    }

    // Validate transaction if provided
    if (dto.originalTransactionId) {
      const { data: transaction, error: txError } = await this.supabase.getClient()
        .from('debit_order_transactions')
        .select('id, amount, status')
        .eq('id', dto.originalTransactionId)
        .single();

      if (txError || !transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Validate refund amount doesn't exceed transaction amount
      if (dto.refundAmount > transaction.amount) {
        throw new BadRequestException('Refund amount cannot exceed transaction amount');
      }
    }

    // Create refund request
    const { data: refund, error } = await this.supabase.getClient()
      .from('refund_requests')
      .insert({
        member_id: dto.memberId,
        original_transaction_id: dto.originalTransactionId,
        original_run_id: dto.originalRunId,
        refund_amount: dto.refundAmount,
        refund_reason: dto.refundReason,
        notes: dto.notes,
        status: 'pending',
        requested_by: requestedBy,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating refund request:', error);
      throw new Error(`Failed to create refund request: ${error.message}`);
    }

    this.logger.log(`Refund request created: ${refund.id}`);

    return {
      ...refund,
      member,
    };
  }

  /**
   * Get refund request by ID
   */
  async getRefundRequest(refundId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('refund_requests')
      .select(`
        *,
        member:members(id, member_number, first_name, last_name, email),
        transaction:debit_order_transactions(id, amount, status, netcash_reference),
        requested_by_user:users!refund_requests_requested_by_fkey(id, email, first_name, last_name)
      `)
      .eq('id', refundId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Refund request not found');
    }

    return data;
  }

  /**
   * List refund requests with filters
   */
  async listRefundRequests(filters: {
    memberId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.getClient()
      .from('refund_requests')
      .select(`
        *,
        member:members(id, member_number, first_name, last_name, email),
        transaction:debit_order_transactions(id, amount, status),
        requested_by_user:users!refund_requests_requested_by_fkey(id, email, first_name, last_name)
      `, { count: 'exact' });

    if (filters.memberId) {
      query = query.eq('member_id', filters.memberId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('requested_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error listing refund requests:', error);
      throw new Error(`Failed to list refund requests: ${error.message}`);
    }

    return {
      data,
      total: count,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Process refund via Netcash API
   */
  async processRefund(refundId: string, processedBy: string) {
    this.logger.log(`Processing refund: ${refundId}`);

    // Get refund request
    const refund = await this.getRefundRequest(refundId);

    if (refund.status !== 'pending') {
      throw new BadRequestException(`Refund is already ${refund.status}`);
    }

    // Update status to processing
    await this.updateRefundStatus(refundId, {
      status: 'processing',
    });

    try {
      // Call Netcash API to process refund
      // Note: This is a placeholder - actual Netcash refund API method needs to be implemented
      const result = await this.apiClient.processRefund({
        refundAmount: refund.refund_amount,
        originalReference: refund.transaction?.netcash_reference,
        reason: refund.refund_reason,
      });

      if (result.success) {
        // Update refund as completed
        await this.updateRefundStatus(refundId, {
          status: 'completed',
          netcashRefundReference: result.refundReference,
        });

        // Update member arrears if applicable
        if (refund.member_id) {
          await this.updateMemberArrears(refund.member_id, -refund.refund_amount);
        }

        this.logger.log(`Refund processed successfully: ${refundId}`);

        return {
          success: true,
          refundId,
          refundReference: result.refundReference,
          message: 'Refund processed successfully',
        };
      } else {
        // Update refund as failed
        await this.updateRefundStatus(refundId, {
          status: 'failed',
          errorMessage: result.error || 'Refund processing failed',
        });

        return {
          success: false,
          refundId,
          error: result.error,
          message: 'Refund processing failed',
        };
      }
    } catch (error) {
      this.logger.error('Error processing refund:', error);

      // Update refund as failed
      await this.updateRefundStatus(refundId, {
        status: 'failed',
        errorMessage: error.message,
      });

      throw error;
    }
  }

  /**
   * Update refund status
   */
  async updateRefundStatus(refundId: string, dto: UpdateRefundStatusDto) {
    const updateData: any = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    if (dto.errorMessage) {
      updateData.error_message = dto.errorMessage;
    }

    if (dto.netcashRefundReference) {
      updateData.netcash_refund_reference = dto.netcashRefundReference;
    }

    if (dto.notes) {
      updateData.notes = dto.notes;
    }

    if (dto.status === 'processing') {
      updateData.processed_at = new Date().toISOString();
    }

    if (dto.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase.getClient()
      .from('refund_requests')
      .update(updateData)
      .eq('id', refundId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating refund status:', error);
      throw new Error(`Failed to update refund status: ${error.message}`);
    }

    return data;
  }

  /**
   * Cancel refund request
   */
  async cancelRefund(refundId: string, reason: string) {
    const refund = await this.getRefundRequest(refundId);

    if (refund.status !== 'pending') {
      throw new BadRequestException(`Cannot cancel refund with status: ${refund.status}`);
    }

    return this.updateRefundStatus(refundId, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * Get refund statistics
   */
  async getRefundStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    memberId?: string;
  }) {
    let query = this.supabase.getClient()
      .from('refund_requests')
      .select('status, refund_amount, requested_at');

    if (filters?.startDate) {
      query = query.gte('requested_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('requested_at', filters.endDate);
    }

    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get refund statistics: ${error.message}`);
    }

    const stats = {
      total: data.length,
      totalAmount: data.reduce((sum, r) => sum + parseFloat(r.refund_amount), 0),
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      },
      amountByStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      },
    };

    data.forEach(refund => {
      const status = refund.status;
      const amount = parseFloat(refund.refund_amount);
      
      stats.byStatus[status]++;
      stats.amountByStatus[status] += amount;
    });

    return stats;
  }

  /**
   * Update member arrears
   */
  private async updateMemberArrears(memberId: string, amount: number) {
    const { data: member } = await this.supabase.getClient()
      .from('members')
      .select('total_arrears')
      .eq('id', memberId)
      .single();

    if (member) {
      const newArrears = Math.max(0, (member.total_arrears || 0) + amount);

      await this.supabase.getClient()
        .from('members')
        .update({ total_arrears: newArrears })
        .eq('id', memberId);
    }
  }
}
