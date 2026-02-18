import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReconciliationDto, QueryReconciliationsDto, ResolveDiscrepancyDto, QueryDiscrepanciesDto, ReconciliationStatus } from './dto/reconciliation.dto';
import { TransactionStatus } from './dto/transaction.dto';

@Injectable()
export class ReconciliationService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Run daily reconciliation
   */
  async runReconciliation(date: string, userId: string) {
    // Get all transactions for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: transactions, error: txnError } = await this.supabase.client
      .from('debit_order_transactions')
      .select(`
        *,
        member:members(id, member_number, first_name, last_name, monthly_premium)
      `)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (txnError) {
      throw new BadRequestException(`Failed to fetch transactions: ${txnError.message}`);
    }

    // Calculate expected and received amounts
    const totalExpected = transactions
      ?.filter((t) => t.status !== TransactionStatus.REVERSED)
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const totalReceived = transactions
      ?.filter((t) => t.status === TransactionStatus.SUCCESSFUL)
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const matchedCount = transactions?.filter((t) => t.status === TransactionStatus.SUCCESSFUL).length || 0;
    const unmatchedCount = transactions?.filter((t) => t.status === TransactionStatus.FAILED).length || 0;
    const discrepancyAmount = totalExpected - totalReceived;

    // Create reconciliation record
    const { data: reconciliation, error: recError } = await this.supabase.client
      .from('payment_reconciliations')
      .insert({
        reconciliation_date: date,
        total_expected: totalExpected,
        total_received: totalReceived,
        matched_count: matchedCount,
        unmatched_count: unmatchedCount,
        discrepancy_amount: discrepancyAmount,
        status: ReconciliationStatus.IN_PROGRESS,
        reconciled_by: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (recError) {
      throw new BadRequestException(`Failed to create reconciliation: ${recError.message}`);
    }

    // Identify discrepancies (failed transactions)
    const failedTransactions = transactions?.filter((t) => t.status === TransactionStatus.FAILED) || [];

    for (const txn of failedTransactions) {
      await this.createDiscrepancy({
        reconciliationId: reconciliation.id,
        memberId: txn.member_id,
        expectedAmount: txn.amount,
        receivedAmount: 0,
        difference: txn.amount,
        reason: txn.failure_reason || 'Payment failed',
      });
    }

    // Update reconciliation status
    await this.supabase.client
      .from('payment_reconciliations')
      .update({
        status: ReconciliationStatus.COMPLETED,
        reconciled_at: new Date().toISOString(),
      })
      .eq('id', reconciliation.id);

    return {
      ...reconciliation,
      status: ReconciliationStatus.COMPLETED,
      discrepancies: failedTransactions.length,
    };
  }

  /**
   * Get reconciliation by ID
   */
  async getReconciliation(reconciliationId: string) {
    const { data: reconciliation, error } = await this.supabase.client
      .from('payment_reconciliations')
      .select(`
        *,
        reconciled_by_user:users!reconciled_by(id, email, first_name, last_name)
      `)
      .eq('id', reconciliationId)
      .single();

    if (error || !reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    // Get discrepancies
    const { data: discrepancies } = await this.supabase.client
      .from('payment_discrepancies')
      .select(`
        *,
        member:members(id, member_number, first_name, last_name, broker_group)
      `)
      .eq('reconciliation_id', reconciliationId);

    return {
      ...reconciliation,
      discrepancies: discrepancies || [],
    };
  }

  /**
   * List reconciliations with filters
   */
  async listReconciliations(query: QueryReconciliationsDto) {
    let queryBuilder = this.supabase.client
      .from('payment_reconciliations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('reconciliation_date', query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte('reconciliation_date', query.endDate);
    }

    // Pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder
      .order('reconciliation_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reconciliations, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch reconciliations: ${error.message}`);
    }

    return {
      reconciliations: reconciliations || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Create a discrepancy record
   */
  private async createDiscrepancy(data: {
    reconciliationId: string;
    memberId: string;
    expectedAmount: number;
    receivedAmount: number;
    difference: number;
    reason: string;
  }) {
    const { error } = await this.supabase.client
      .from('payment_discrepancies')
      .insert({
        reconciliation_id: data.reconciliationId,
        member_id: data.memberId,
        expected_amount: data.expectedAmount,
        received_amount: data.receivedAmount,
        difference: data.difference,
        reason: data.reason,
        resolved: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to create discrepancy:', error);
    }
  }

  /**
   * Get discrepancies with filters
   */
  async getDiscrepancies(query: QueryDiscrepanciesDto) {
    let queryBuilder = this.supabase.client
      .from('payment_discrepancies')
      .select(`
        *,
        reconciliation:payment_reconciliations(id, reconciliation_date, status),
        member:members(id, member_number, first_name, last_name, broker_group, email, phone)
      `, { count: 'exact' });

    // Apply filters
    if (query.reconciliationId) {
      queryBuilder = queryBuilder.eq('reconciliation_id', query.reconciliationId);
    }

    if (query.memberId) {
      queryBuilder = queryBuilder.eq('member_id', query.memberId);
    }

    if (query.resolved !== undefined) {
      queryBuilder = queryBuilder.eq('resolved', query.resolved);
    }

    // Pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: discrepancies, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch discrepancies: ${error.message}`);
    }

    return {
      discrepancies: discrepancies || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Resolve a discrepancy
   */
  async resolveDiscrepancy(dto: ResolveDiscrepancyDto, userId: string) {
    const { data: discrepancy, error: fetchError } = await this.supabase.client
      .from('payment_discrepancies')
      .select('*')
      .eq('id', dto.discrepancyId)
      .single();

    if (fetchError || !discrepancy) {
      throw new NotFoundException('Discrepancy not found');
    }

    if (discrepancy.resolved) {
      throw new BadRequestException('Discrepancy already resolved');
    }

    const { error: updateError } = await this.supabase.client
      .from('payment_discrepancies')
      .update({
        resolved: true,
        resolution: dto.resolution,
        resolution_notes: dto.notes,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', dto.discrepancyId);

    if (updateError) {
      throw new BadRequestException(`Failed to resolve discrepancy: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Discrepancy resolved successfully',
    };
  }

  /**
   * Get reconciliation statistics
   */
  async getReconciliationStatistics(filters?: { startDate?: string; endDate?: string }) {
    let queryBuilder = this.supabase.client
      .from('payment_reconciliations')
      .select('*');

    if (filters?.startDate) {
      queryBuilder = queryBuilder.gte('reconciliation_date', filters.startDate);
    }

    if (filters?.endDate) {
      queryBuilder = queryBuilder.lte('reconciliation_date', filters.endDate);
    }

    const { data: reconciliations, error } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch statistics: ${error.message}`);
    }

    const stats = {
      total: reconciliations?.length || 0,
      byStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        reviewed: 0,
        failed: 0,
      },
      totals: {
        expected: 0,
        received: 0,
        discrepancy: 0,
      },
      averageMatchRate: 0,
    };

    let totalMatchRate = 0;

    reconciliations?.forEach((rec) => {
      stats.byStatus[rec.status]++;
      stats.totals.expected += rec.total_expected;
      stats.totals.received += rec.total_received;
      stats.totals.discrepancy += rec.discrepancy_amount;

      const matchRate = rec.total_expected > 0 
        ? (rec.total_received / rec.total_expected) * 100 
        : 0;
      totalMatchRate += matchRate;
    });

    if (stats.total > 0) {
      stats.averageMatchRate = totalMatchRate / stats.total;
    }

    return stats;
  }

  /**
   * Auto-reconcile (scheduled job)
   */
  async autoReconcile(userId: string = 'system') {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Check if reconciliation already exists for this date
    const { data: existing } = await this.supabase.client
      .from('payment_reconciliations')
      .select('id')
      .eq('reconciliation_date', dateStr)
      .single();

    if (existing) {
      return {
        success: false,
        message: `Reconciliation already exists for ${dateStr}`,
      };
    }

    // Run reconciliation
    const result = await this.runReconciliation(dateStr, userId);

    return {
      success: true,
      message: `Auto-reconciliation completed for ${dateStr}`,
      result,
    };
  }
}
