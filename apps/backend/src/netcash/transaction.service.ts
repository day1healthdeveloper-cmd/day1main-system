import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTransactionDto, UpdateTransactionStatusDto, QueryTransactionsDto, TransactionStatus } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listTransactions(query: QueryTransactionsDto) {
    const supabase = this.supabaseService.getClient();
    
    let queryBuilder = supabase
      .from('debit_order_transactions')
      .select('*', { count: 'exact' });

    if (query.runId) {
      queryBuilder = queryBuilder.eq('run_id', query.runId);
    }

    if (query.memberId) {
      queryBuilder = queryBuilder.eq('member_id', query.memberId);
    }

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('created_at', query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte('created_at', query.endDate);
    }

    const limit = query.limit || 50;
    const offset = query.offset || 0;
    
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: transactions, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch transactions: ${error.message}`);
    }

    return {
      transactions: transactions || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  async getTransaction(transactionId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data: transaction, error } = await supabase
      .from('debit_order_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getTransactionStatistics(filters?: { runId?: string; startDate?: string; endDate?: string }) {
    const supabase = this.supabaseService.getClient();
    
    let queryBuilder = supabase
      .from('debit_order_transactions')
      .select('status, amount');

    if (filters?.runId) {
      queryBuilder = queryBuilder.eq('run_id', filters.runId);
    }

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

    const stats = {
      total: transactions?.length || 0,
      byStatus: {
        pending: 0,
        successful: 0,
        failed: 0,
        reversed: 0,
        processing: 0,
      },
      amounts: {
        total: 0,
        successful: 0,
        failed: 0,
      },
      successRate: 0,
    };

    transactions?.forEach((txn: any) => {
      stats.byStatus[txn.status as keyof typeof stats.byStatus]++;
      stats.amounts.total += txn.amount;
      
      if (txn.status === TransactionStatus.SUCCESSFUL) {
        stats.amounts.successful += txn.amount;
      } else if (txn.status === TransactionStatus.FAILED) {
        stats.amounts.failed += txn.amount;
      }
    });

    if (stats.total > 0) {
      stats.successRate = (stats.byStatus.successful / stats.total) * 100;
    }

    return stats;
  }

  async updateTransactionStatus(transactionId: string, dto: UpdateTransactionStatusDto) {
    const supabase = this.supabaseService.getClient();
    
    const updateData: any = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    if (dto.netcashStatus) {
      updateData.netcash_reference = dto.netcashStatus;
    }

    if (dto.netcashResponse) {
      updateData.bank_reference = dto.netcashResponse;
    }

    if (dto.failureReason) {
      updateData.rejection_reason = dto.failureReason;
    }

    if (dto.status === TransactionStatus.SUCCESSFUL) {
      updateData.processed_at = new Date().toISOString();
    }

    if (dto.status === TransactionStatus.FAILED) {
      updateData.processed_at = new Date().toISOString();
    }

    const { data: transaction, error } = await supabase
      .from('debit_order_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update transaction: ${error.message}`);
    }

    return transaction;
  }

  async retryTransaction(transactionId: string, userId: string) {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status !== TransactionStatus.FAILED) {
      throw new BadRequestException('Only failed transactions can be retried');
    }

    const retryCount = transaction.retry_count || 0;
    if (retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts (3) reached');
    }

    const supabase = this.supabaseService.getClient();
    
    const { data: updatedTransaction, error } = await supabase
      .from('debit_order_transactions')
      .update({
        status: TransactionStatus.PROCESSING,
        retry_count: retryCount + 1,
        last_retry_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to retry transaction: ${error.message}`);
    }

    return updatedTransaction;
  }

  async getFailedPayments(query: QueryTransactionsDto) {
    const supabase = this.supabaseService.getClient();
    
    let queryBuilder = supabase
      .from('debit_order_transactions')
      .select('*', { count: 'exact' })
      .eq('status', TransactionStatus.FAILED);

    if (query.runId) {
      queryBuilder = queryBuilder.eq('run_id', query.runId);
    }

    if (query.memberId) {
      queryBuilder = queryBuilder.eq('member_id', query.memberId);
    }

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('created_at', query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte('created_at', query.endDate);
    }

    const limit = query.limit || 50;
    const offset = query.offset || 0;
    
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: transactions, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch failed payments: ${error.message}`);
    }

    return {
      transactions: transactions || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  async getFailedPaymentsStatistics(filters?: { runId?: string; startDate?: string; endDate?: string }) {
    const supabase = this.supabaseService.getClient();
    
    let queryBuilder = supabase
      .from('debit_order_transactions')
      .select('retry_count, amount')
      .eq('status', TransactionStatus.FAILED);

    if (filters?.runId) {
      queryBuilder = queryBuilder.eq('run_id', filters.runId);
    }

    if (filters?.startDate) {
      queryBuilder = queryBuilder.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      queryBuilder = queryBuilder.lte('created_at', filters.endDate);
    }

    const { data: transactions, error } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch failed payment statistics: ${error.message}`);
    }

    const stats = {
      total: transactions?.length || 0,
      totalAmount: 0,
      canRetry: 0,
      needsEscalation: 0,
    };

    transactions?.forEach((txn: any) => {
      stats.totalAmount += txn.amount;
      
      const retryCount = txn.retry_count || 0;
      if (retryCount < 3) {
        stats.canRetry++;
      } else {
        stats.needsEscalation++;
      }
    });

    return stats;
  }
}
