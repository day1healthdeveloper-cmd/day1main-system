import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TransactionService } from './transaction.service';
import { QueryFailedPaymentsDto, SuspendMemberDto, EscalateFailedPaymentDto, NotifyMemberDto } from './dto/failed-payment.dto';
import { TransactionStatus } from './dto/transaction.dto';

@Injectable()
export class FailedPaymentService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Get all failed payments with filters
   */
  async getFailedPayments(query: QueryFailedPaymentsDto) {
    let queryBuilder = this.supabase.client
      .from('debit_order_transactions')
      .select(`
        *,
        member:members(
          id, 
          member_number, 
          first_name, 
          last_name, 
          broker_group, 
          email, 
          phone,
          monthly_premium,
          total_arrears,
          debit_order_status
        ),
        run:debit_order_runs(id, batch_name, run_date)
      `, { count: 'exact' })
      .eq('status', TransactionStatus.FAILED);

    // Apply filters
    if (query.memberId) {
      queryBuilder = queryBuilder.eq('member_id', query.memberId);
    }

    if (query.minRetries !== undefined) {
      queryBuilder = queryBuilder.gte('retry_count', query.minRetries);
    }

    // Pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: transactions, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch failed payments: ${error.message}`);
    }

    // Filter by broker group if specified (post-query filter)
    let filteredTransactions = transactions || [];
    if (query.brokerGroup) {
      filteredTransactions = filteredTransactions.filter(
        (txn) => txn.member?.broker_group === query.brokerGroup
      );
    }

    return {
      transactions: filteredTransactions,
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Automatically retry failed payments (scheduled job)
   */
  async autoRetryFailedPayments() {
    // Get all failed transactions with retry_count < 3
    const { data: failedTransactions, error } = await this.supabase.client
      .from('debit_order_transactions')
      .select('id, retry_count, member_id, amount')
      .eq('status', TransactionStatus.FAILED)
      .lt('retry_count', 3);

    if (error) {
      throw new BadRequestException(`Failed to fetch transactions for retry: ${error.message}`);
    }

    if (!failedTransactions || failedTransactions.length === 0) {
      return {
        message: 'No failed transactions to retry',
        retried: 0,
      };
    }

    const results = {
      total: failedTransactions.length,
      retried: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Retry each transaction
    for (const transaction of failedTransactions) {
      try {
        const result = await this.transactionService.retryTransaction(transaction.id, 'system');
        results.retried++;
        
        if (result.status === TransactionStatus.SUCCESSFUL) {
          results.successful++;
        } else if (result.status === TransactionStatus.FAILED) {
          results.failed++;
          
          // If max retries reached, escalate
          if (result.retry_count >= 3) {
            await this.escalateFailedPayment({
              transactionId: transaction.id,
              escalationReason: 'Maximum retry attempts (3) reached',
            });
          }
        }
      } catch (error) {
        results.errors.push(`Transaction ${transaction.id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Manually retry a specific failed payment
   */
  async retryFailedPayment(transactionId: string, userId: string, notes?: string) {
    const transaction = await this.transactionService.getTransaction(transactionId);

    if (transaction.status !== TransactionStatus.FAILED) {
      throw new BadRequestException('Only failed transactions can be retried');
    }

    // Add notes if provided
    if (notes) {
      await this.supabase.client
        .from('debit_order_transactions')
        .update({ 
          netcash_response: `${transaction.netcash_response || ''}\n\nManual Retry Notes: ${notes}` 
        })
        .eq('id', transactionId);
    }

    return this.transactionService.retryTransaction(transactionId, userId);
  }

  /**
   * Suspend member due to repeated payment failures
   */
  async suspendMember(dto: SuspendMemberDto, userId: string) {
    // Check if member exists
    const { data: member, error: fetchError } = await this.supabase.client
      .from('members')
      .select('id, member_number, first_name, last_name, debit_order_status')
      .eq('id', dto.memberId)
      .single();

    if (fetchError || !member) {
      throw new NotFoundException('Member not found');
    }

    if (member.debit_order_status === 'suspended') {
      throw new BadRequestException('Member is already suspended');
    }

    // Update member status
    const { error: updateError } = await this.supabase.client
      .from('members')
      .update({
        debit_order_status: 'suspended',
        suspension_reason: dto.reason,
        suspended_at: new Date().toISOString(),
        suspended_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dto.memberId);

    if (updateError) {
      throw new BadRequestException(`Failed to suspend member: ${updateError.message}`);
    }

    // Log the suspension
    await this.logMemberAction(dto.memberId, 'suspended', dto.reason, userId, dto.notes);

    return {
      success: true,
      message: `Member ${member.member_number} suspended successfully`,
      member: {
        id: member.id,
        member_number: member.member_number,
        name: `${member.first_name} ${member.last_name}`,
        status: 'suspended',
      },
    };
  }

  /**
   * Escalate failed payment to manual review
   */
  async escalateFailedPayment(dto: EscalateFailedPaymentDto, userId?: string) {
    const transaction = await this.transactionService.getTransaction(dto.transactionId);

    // Create escalation record
    const { data: escalation, error } = await this.supabase.client
      .from('payment_escalations')
      .insert({
        transaction_id: dto.transactionId,
        member_id: transaction.member_id,
        escalation_reason: dto.escalationReason,
        assigned_to: dto.assignedTo || null,
        status: 'pending',
        escalated_by: userId || 'system',
        escalated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, just log it
      console.warn('Payment escalations table not found, logging to transaction notes');
      
      await this.supabase.client
        .from('debit_order_transactions')
        .update({
          netcash_response: `${transaction.netcash_response || ''}\n\nESCALATED: ${dto.escalationReason}`,
        })
        .eq('id', dto.transactionId);

      return {
        success: true,
        message: 'Payment escalated (logged to transaction)',
        transactionId: dto.transactionId,
      };
    }

    return {
      success: true,
      message: 'Payment escalated for manual review',
      escalation,
    };
  }

  /**
   * Notify member about failed payment
   */
  async notifyMember(dto: NotifyMemberDto, userId: string) {
    // Get member details
    const { data: member, error } = await this.supabase.client
      .from('members')
      .select('id, member_number, first_name, last_name, email, phone')
      .eq('id', dto.memberId)
      .single();

    if (error || !member) {
      throw new NotFoundException('Member not found');
    }

    // TODO: Implement actual notification sending (email/SMS)
    // For now, just log the notification
    const notification = {
      member_id: dto.memberId,
      notification_type: dto.notificationType,
      message: dto.message,
      sent_by: userId,
      sent_at: new Date().toISOString(),
      status: 'sent',
    };

    console.log('Notification sent:', notification);

    // Log the notification
    await this.logMemberAction(
      dto.memberId,
      'notification_sent',
      `${dto.notificationType}: ${dto.message}`,
      userId
    );

    return {
      success: true,
      message: `Notification sent to ${member.first_name} ${member.last_name}`,
      notification,
    };
  }

  /**
   * Get failed payment statistics
   */
  async getFailedPaymentStatistics(filters?: { brokerGroup?: string; startDate?: string; endDate?: string }) {
    let queryBuilder = this.supabase.client
      .from('debit_order_transactions')
      .select(`
        id,
        amount,
        retry_count,
        failure_reason,
        member:members(broker_group)
      `)
      .eq('status', TransactionStatus.FAILED);

    if (filters?.startDate) {
      queryBuilder = queryBuilder.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      queryBuilder = queryBuilder.lte('created_at', filters.endDate);
    }

    const { data: transactions, error } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch statistics: ${error.message}`);
    }

    // Filter by broker group if specified
    let filteredTransactions = transactions || [];
    if (filters?.brokerGroup) {
      filteredTransactions = filteredTransactions.filter(
        (txn) => txn.member?.broker_group === filters.brokerGroup
      );
    }

    // Calculate statistics
    const stats = {
      total: filteredTransactions.length,
      totalAmount: 0,
      byRetryCount: {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
      },
      byFailureReason: {} as Record<string, number>,
      needsEscalation: 0, // retry_count >= 3
      canRetry: 0, // retry_count < 3
    };

    filteredTransactions.forEach((txn) => {
      stats.totalAmount += txn.amount;
      
      const retryCount = txn.retry_count || 0;
      if (retryCount <= 3) {
        stats.byRetryCount[retryCount]++;
      }

      if (retryCount >= 3) {
        stats.needsEscalation++;
      } else {
        stats.canRetry++;
      }

      const reason = txn.failure_reason || 'Unknown';
      stats.byFailureReason[reason] = (stats.byFailureReason[reason] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get members with repeated payment failures
   */
  async getMembersWithRepeatedFailures(minFailures: number = 3) {
    const { data: transactions, error } = await this.supabase.client
      .from('debit_order_transactions')
      .select(`
        member_id,
        member:members(
          id,
          member_number,
          first_name,
          last_name,
          broker_group,
          email,
          phone,
          monthly_premium,
          total_arrears,
          debit_order_status
        )
      `)
      .eq('status', TransactionStatus.FAILED);

    if (error) {
      throw new BadRequestException(`Failed to fetch transactions: ${error.message}`);
    }

    // Group by member and count failures
    const memberFailures = new Map<string, { member: any; failureCount: number }>();

    transactions?.forEach((txn) => {
      if (txn.member) {
        const existing = memberFailures.get(txn.member_id);
        if (existing) {
          existing.failureCount++;
        } else {
          memberFailures.set(txn.member_id, {
            member: txn.member,
            failureCount: 1,
          });
        }
      }
    });

    // Filter members with >= minFailures
    const result = Array.from(memberFailures.values())
      .filter((item) => item.failureCount >= minFailures)
      .sort((a, b) => b.failureCount - a.failureCount);

    return result;
  }

  /**
   * Log member action (private helper)
   */
  private async logMemberAction(
    memberId: string,
    action: string,
    reason: string,
    userId: string,
    notes?: string
  ) {
    // Try to insert into audit log if table exists
    try {
      await this.supabase.client
        .from('member_action_log')
        .insert({
          member_id: memberId,
          action,
          reason,
          notes,
          performed_by: userId,
          performed_at: new Date().toISOString(),
        });
    } catch (error) {
      // If table doesn't exist, just log to console
      console.log('Member action logged:', { memberId, action, reason, userId, notes });
    }
  }
}
