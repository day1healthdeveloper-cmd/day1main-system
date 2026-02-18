import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TransactionService } from './transaction.service';
import { NetcashWebhookDto, QueryWebhookLogsDto } from './dto/webhook.dto';
import { TransactionStatus } from './dto/transaction.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly webhookSecret = process.env.NETCASH_WEBHOOK_SECRET || 'your-webhook-secret';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Process incoming webhook from Netcash
   */
  async processWebhook(payload: NetcashWebhookDto, signature?: string) {
    // Log the webhook
    const webhookLog = await this.logWebhook(payload, signature);

    try {
      // Verify signature if provided
      if (signature && !this.verifySignature(payload, signature)) {
        await this.updateWebhookLog(webhookLog.id, false, 'Invalid signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process based on webhook type
      if (payload.transactionReference) {
        await this.processTransactionWebhook(payload);
      } else if (payload.batchReference) {
        await this.processBatchWebhook(payload);
      } else {
        await this.updateWebhookLog(webhookLog.id, false, 'Unknown webhook type');
        throw new BadRequestException('Unknown webhook type');
      }

      // Mark webhook as processed
      await this.updateWebhookLog(webhookLog.id, true);

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      await this.updateWebhookLog(webhookLog.id, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Process transaction status webhook
   */
  private async processTransactionWebhook(payload: NetcashWebhookDto) {
    // Find transaction by reference
    const { data: transaction, error } = await this.supabase.getClient()
      .from('debit_order_transactions')
      .select('id, status')
      .eq('transaction_reference', payload.transactionReference)
      .single();

    if (error || !transaction) {
      console.warn(`Transaction not found for reference: ${payload.transactionReference}`);
      return;
    }

    // Map Netcash status to our status
    const status = this.mapNetcashStatus(payload.status);

    // Update transaction status
    await this.transactionService.updateTransactionStatus(transaction.id, {
      status,
      netcashStatus: payload.status,
      netcashResponse: JSON.stringify({
        responseCode: payload.responseCode,
        responseMessage: payload.responseMessage,
        netcashReference: payload.netcashReference,
        timestamp: payload.timestamp,
      }),
      failureReason: status === TransactionStatus.FAILED ? payload.responseMessage : undefined,
    });

    console.log(`Transaction ${transaction.id} updated to ${status} via webhook`);
  }

  /**
   * Process batch status webhook
   */
  private async processBatchWebhook(payload: NetcashWebhookDto) {
    // Find batch by reference
    const { data: batch, error } = await this.supabase.getClient()
      .from('debit_order_runs')
      .select('id, status')
      .eq('batch_reference', payload.batchReference)
      .single();

    if (error || !batch) {
      console.warn(`Batch not found for reference: ${payload.batchReference}`);
      return;
    }

    // Update batch status
    const status = this.mapNetcashBatchStatus(payload.status);
    
    await this.supabase.getClient()
      .from('debit_order_runs')
      .update({
        status,
        netcash_response: JSON.stringify(payload),
        updated_at: new Date().toISOString(),
      })
      .eq('id', batch.id);

    console.log(`Batch ${batch.id} updated to ${status} via webhook`);
  }

  /**
   * Log webhook to database
   */
  private async logWebhook(payload: NetcashWebhookDto, signature?: string) {
    const { data: log, error } = await this.supabase.getClient()
      .from('netcash_webhook_logs')
      .insert({
        payload: JSON.stringify(payload),
        signature,
        processed: false,
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log webhook:', error);
      throw new BadRequestException('Failed to log webhook');
    }

    return log;
  }

  /**
   * Update webhook log status
   */
  private async updateWebhookLog(logId: string, processed: boolean, errorMessage?: string) {
    await this.supabase.getClient()
      .from('netcash_webhook_logs')
      .update({
        processed,
        error_message: errorMessage,
        processed_at: processed ? new Date().toISOString() : null,
      })
      .eq('id', logId);
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: NetcashWebhookDto, signature: string): boolean {
    try {
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payloadString)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Map Netcash status to our transaction status
   */
  private mapNetcashStatus(netcashStatus?: string): TransactionStatus {
    if (!netcashStatus) return TransactionStatus.PENDING;

    const statusMap: Record<string, TransactionStatus> = {
      'APPROVED': TransactionStatus.SUCCESSFUL,
      'SUCCESS': TransactionStatus.SUCCESSFUL,
      'SUCCESSFUL': TransactionStatus.SUCCESSFUL,
      'DECLINED': TransactionStatus.FAILED,
      'FAILED': TransactionStatus.FAILED,
      'REJECTED': TransactionStatus.FAILED,
      'REVERSED': TransactionStatus.REVERSED,
      'PENDING': TransactionStatus.PENDING,
      'PROCESSING': TransactionStatus.PROCESSING,
    };

    return statusMap[netcashStatus.toUpperCase()] || TransactionStatus.PENDING;
  }

  /**
   * Map Netcash batch status
   */
  private mapNetcashBatchStatus(netcashStatus?: string): string {
    if (!netcashStatus) return 'pending';

    const statusMap: Record<string, string> = {
      'APPROVED': 'completed',
      'SUCCESS': 'completed',
      'SUCCESSFUL': 'completed',
      'PROCESSING': 'processing',
      'FAILED': 'failed',
      'REJECTED': 'failed',
    };

    return statusMap[netcashStatus.toUpperCase()] || 'pending';
  }

  /**
   * Get webhook logs with filters
   */
  async getWebhookLogs(query: QueryWebhookLogsDto) {
    let queryBuilder = this.supabase.getClient()
      .from('netcash_webhook_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query.processed !== undefined) {
      queryBuilder = queryBuilder.eq('processed', query.processed);
    }

    // Pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, error, count } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch webhook logs: ${error.message}`);
    }

    return {
      logs: logs || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStatistics(filters?: { startDate?: string; endDate?: string }) {
    let queryBuilder = this.supabase.getClient()
      .from('netcash_webhook_logs')
      .select('processed, error_message');

    if (filters?.startDate) {
      queryBuilder = queryBuilder.gte('received_at', filters.startDate);
    }

    if (filters?.endDate) {
      queryBuilder = queryBuilder.lte('received_at', filters.endDate);
    }

    const { data: logs, error } = await queryBuilder;

    if (error) {
      throw new BadRequestException(`Failed to fetch statistics: ${error.message}`);
    }

    const stats = {
      total: logs?.length || 0,
      processed: 0,
      failed: 0,
      pending: 0,
      successRate: 0,
    };

    logs?.forEach((log: any) => {
      if (log.processed) {
        if (log.error_message) {
          stats.failed++;
        } else {
          stats.processed++;
        }
      } else {
        stats.pending++;
      }
    });

    if (stats.total > 0) {
      stats.successRate = (stats.processed / stats.total) * 100;
    }

    return stats;
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(webhookLogId: string) {
    const { data: log, error } = await this.supabase.getClient()
      .from('netcash_webhook_logs')
      .select('*')
      .eq('id', webhookLogId)
      .single();

    if (error || !log) {
      throw new BadRequestException('Webhook log not found');
    }

    if (log.processed && !log.error_message) {
      throw new BadRequestException('Webhook already processed successfully');
    }

    // Parse payload and reprocess
    const payload = JSON.parse(log.payload);
    return this.processWebhook(payload, log.signature);
  }
}
