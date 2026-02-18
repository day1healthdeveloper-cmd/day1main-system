import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface ImportBankStatementDto {
  statementNumber: string;
  bankAccount: string;
  statementDate: Date;
  openingBalance: number;
  closingBalance: number;
  lines: BankStatementLineDto[];
}

export interface BankStatementLineDto {
  transactionDate: Date;
  description: string;
  reference?: string;
  amount: number;
  transactionType: 'debit' | 'credit';
  balance: number;
}

export interface AllocatePaymentDto {
  statementLineId: string;
  paymentId?: string;
  invoiceId?: string;
  amount: number;
}

export interface MatchResult {
  statementLineId: string;
  paymentId?: string;
  matchConfidence: 'exact' | 'probable' | 'possible' | 'none';
  matchReason?: string;
}

@Injectable()
export class ReconciliationService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async importBankStatement(dto: ImportBankStatementDto, userId: string) {
    // Check for duplicate statement number
    const { data: existing } = await this.supabase.getClient()
      .from('bank_statements')
      .select('*')
      .eq('statement_number', dto.statementNumber)
      .single();

    if (existing) {
      throw new BadRequestException('Bank statement with this number already exists');
    }

    const { data: statement, error } = await this.supabase.getClient()
      .from('bank_statements')
      .insert({
        statement_number: dto.statementNumber,
        bank_account: dto.bankAccount,
        statement_date: dto.statementDate.toISOString(),
        opening_balance: dto.openingBalance,
        closing_balance: dto.closingBalance,
        imported_by: userId,
      })
      .select()
      .single();

    // Insert statement lines
    const lineInserts = dto.lines.map(line => ({
      statement_id: statement.id,
      transaction_date: line.transactionDate.toISOString(),
      description: line.description,
      reference: line.reference,
      amount: line.amount,
      transaction_type: line.transactionType,
      balance: line.balance,
    }));

    const { data: lines } = await this.supabase.getClient()
      .from('bank_statement_lines')
      .insert(lineInserts)
      .select();

    const statementWithLines = { ...statement, lines: lines || [] };

    await this.auditService.logEvent({
      event_type: 'bank_statement_imported',
      user_id: userId,
      entity_type: 'bank_statement',
      entity_id: statement.id,
      action: 'create',
      metadata: {
        statement_number: dto.statementNumber,
        bank_account: dto.bankAccount,
        statement_date: dto.statementDate.toISOString(),
        line_count: dto.lines.length,
        opening_balance: dto.openingBalance,
        closing_balance: dto.closingBalance,
      },
    });

    return statementWithLines;
  }

  async getBankStatementById(statementId: string) {
    const { data: statement, error } = await this.supabase.getClient()
      .from('bank_statements')
      .select(`
        *,
        lines:bank_statement_lines(
          *,
          allocations:allocations(*)
        )
      `)
      .eq('id', statementId)
      .single();

    if (!statement) {
      throw new NotFoundException('Bank statement not found');
    }

    return statement;
  }

  async matchPayments(statementId: string): Promise<MatchResult[]> {
    const statement = await this.getBankStatementById(statementId);
    const results: MatchResult[] = [];

    for (const line of statement.lines) {
      // Skip if already allocated
      if (line.allocations.length > 0) {
        continue;
      }

      // Only match credit transactions (money in)
      if (line.transaction_type !== 'credit') {
        results.push({
          statementLineId: line.id,
          matchConfidence: 'none',
          matchReason: 'Debit transaction - not a payment',
        });
        continue;
      }

      const lineAmount = line.amount.toNumber();

      // Try to find matching payment by reference
      if (line.reference) {
        const { data: paymentByRef } = await this.supabase.getClient()
          .from('payments')
          .select('*')
          .eq('payment_reference', line.reference)
          .eq('status', 'completed')
          .limit(1)
          .single();

        if (paymentByRef) {
          const paymentAmount = Number(paymentByRef.amount);
          if (Math.abs(paymentAmount - lineAmount) < 0.01) {
            results.push({
              statementLineId: line.id,
              paymentId: paymentByRef.id,
              matchConfidence: 'exact',
              matchReason: 'Reference and amount match',
            });
            continue;
          } else {
            results.push({
              statementLineId: line.id,
              paymentId: paymentByRef.id,
              matchConfidence: 'probable',
              matchReason: 'Reference matches but amount differs',
            });
            continue;
          }
        }
      }

      // Try to find matching payment by amount and date
      const startOfDay = new Date(line.transaction_date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(line.transaction_date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: paymentsByAmount } = await this.supabase.getClient()
        .from('payments')
        .select('*')
        .eq('amount', lineAmount)
        .eq('status', 'completed')
        .gte('processed_at', startOfDay.toISOString())
        .lte('processed_at', endOfDay.toISOString());

      if ((paymentsByAmount || []).length === 1) {
        results.push({
          statementLineId: line.id,
          paymentId: (paymentsByAmount || [])[0].id,
          matchConfidence: 'probable',
          matchReason: 'Amount and date match',
        });
      } else if ((paymentsByAmount || []).length > 1) {
        results.push({
          statementLineId: line.id,
          matchConfidence: 'possible',
          matchReason: `Multiple payments (${(paymentsByAmount || []).length}) with same amount on same date`,
        });
      } else {
        results.push({
          statementLineId: line.id,
          matchConfidence: 'none',
          matchReason: 'No matching payment found',
        });
      }
    }

    return results;
  }

  async allocatePayment(dto: AllocatePaymentDto, userId: string) {
    // Validate statement line exists
    const { data: statementLine, error: lineError } = await this.supabase.getClient()
      .from('bank_statement_lines')
      .select(`
        *,
        allocations:allocations(*)
      `)
      .eq('id', dto.statementLineId)
      .single();

    if (!statementLine) {
      throw new NotFoundException('Bank statement line not found');
    }

    // Check if payment exists
    if (dto.paymentId) {
      const { data: payment } = await this.supabase.getClient()
        .from('payments')
        .select('*')
        .eq('id', dto.paymentId)
        .single();

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new BadRequestException('Can only allocate completed payments');
      }
    }

    // Check if invoice exists
    if (dto.invoiceId) {
      const { data: invoice } = await this.supabase.getClient()
        .from('invoices')
        .select('*')
        .eq('id', dto.invoiceId)
        .single();

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    }

    // Check total allocated amount doesn't exceed line amount
    const totalAllocated = (statementLine.allocations || []).reduce(
      (sum: number, alloc: any) => sum + Number(alloc.amount),
      0,
    );

    const lineAmount = Number(statementLine.amount);
    if (totalAllocated + dto.amount > lineAmount + 0.01) {
      throw new BadRequestException(
        `Total allocation (${totalAllocated + dto.amount}) exceeds line amount (${lineAmount})`,
      );
    }

    const { data: allocation, error: allocError } = await this.supabase.getClient()
      .from('allocations')
      .insert({
        statement_line_id: dto.statementLineId,
        payment_id: dto.paymentId,
        invoice_id: dto.invoiceId,
        amount: dto.amount,
        allocated_by: userId,
      })
      .select()
      .single();

    await this.auditService.logEvent({
      event_type: 'payment_allocated',
      user_id: userId,
      entity_type: 'allocation',
      entity_id: allocation.id,
      action: 'create',
      metadata: {
        statement_line_id: dto.statementLineId,
        payment_id: dto.paymentId,
        invoice_id: dto.invoiceId,
        amount: dto.amount,
      },
    });

    return allocation;
  }

  async getUnallocatedPayments() {
    // Get completed payments that don't have allocations
    const { data: payments } = await this.supabase.getClient()
      .from('payments')
      .select(`
        *,
        invoice:invoices(*)
      `)
      .eq('status', 'completed');

    const { data: allocations } = await this.supabase.getClient()
      .from('allocations')
      .select('payment_id')
      .in('payment_id', (payments || []).map(p => p.id));

    const allocatedPaymentIds = new Set((allocations || []).map(a => a.payment_id));
    return (payments || []).filter(p => !allocatedPaymentIds.has(p.id));
  }

  async getUnallocatedStatementLines(statementId: string) {
    const statement = await this.getBankStatementById(statementId);

    return (statement.lines || []).filter((line: any) => {
      const totalAllocated = (line.allocations || []).reduce(
        (sum: number, alloc: any) => sum + Number(alloc.amount),
        0,
      );
      const lineAmount = Number(line.amount);
      return Math.abs(totalAllocated - lineAmount) > 0.01;
    });
  }

  async performDailyReconciliation(reconciliationDate: Date, userId: string) {
    // Get all bank statements for the date
    const startOfDay = new Date(reconciliationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reconciliationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: statements } = await this.supabase.getClient()
      .from('bank_statements')
      .select(`
        *,
        lines:bank_statement_lines(
          *,
          allocations:allocations(*)
        )
      `)
      .gte('statement_date', startOfDay.toISOString())
      .lte('statement_date', endOfDay.toISOString());

    if (!statements || statements.length === 0) {
      throw new BadRequestException('No bank statements found for this date');
    }

    const reconciliations = [];

    for (const statement of statements) {
      // Calculate total expected (from payments)
      const { data: payments } = await this.supabase.getClient()
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .gte('processed_at', startOfDay.toISOString())
        .lte('processed_at', endOfDay.toISOString());

      const totalExpected = (payments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      // Calculate total received (from statement lines - credits only)
      const totalReceived = (statement.lines || [])
        .filter((line: any) => line.transaction_type === 'credit')
        .reduce((sum: number, line: any) => sum + Number(line.amount), 0);

      const discrepancy = totalReceived - totalExpected;

      const { data: reconciliation, error } = await this.supabase.getClient()
        .from('reconciliations')
        .insert({
          reconciliation_date: reconciliationDate.toISOString(),
          bank_statement_id: statement.id,
          total_expected: totalExpected,
          total_received: totalReceived,
          discrepancy: discrepancy,
          status: Math.abs(discrepancy) < 0.01 ? 'reconciled' : 'pending',
          reconciled_at: Math.abs(discrepancy) < 0.01 ? new Date().toISOString() : null,
          reconciled_by: Math.abs(discrepancy) < 0.01 ? userId : null,
        })
        .select()
        .single();

      reconciliations.push(reconciliation);

      await this.auditService.logEvent({
        event_type: 'daily_reconciliation_performed',
        user_id: userId,
        entity_type: 'reconciliation',
        entity_id: reconciliation.id,
        action: 'create',
        metadata: {
          reconciliation_date: reconciliationDate.toISOString(),
          bank_statement_id: statement.id,
          total_expected: totalExpected,
          total_received: totalReceived,
          discrepancy: discrepancy,
          status: reconciliation.status,
        },
      });
    }

    return reconciliations;
  }

  async getReconciliationById(reconciliationId: string) {
    const { data: reconciliation, error } = await this.supabase.getClient()
      .from('reconciliations')
      .select('*')
      .eq('id', reconciliationId)
      .single();

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return reconciliation;
  }

  async getReconciliationsByDateRange(startDate: Date, endDate: Date) {
    const { data } = await this.supabase.getClient()
      .from('reconciliations')
      .select('*')
      .gte('reconciliation_date', startDate.toISOString())
      .lte('reconciliation_date', endDate.toISOString())
      .order('reconciliation_date', { ascending: false });
    return data || [];
  }

  async getDiscrepancies() {
    const { data } = await this.supabase.getClient()
      .from('reconciliations')
      .select('*')
      .eq('status', 'pending')
      .neq('discrepancy', 0)
      .order('reconciliation_date', { ascending: false });
    return data || [];
  }

  async generateReconciliationReport(reconciliationId: string) {
    const reconciliation = await this.getReconciliationById(reconciliationId);

    const { data: statement } = await this.supabase.getClient()
      .from('bank_statements')
      .select(`
        *,
        lines:bank_statement_lines(
          *,
          allocations:allocations(*)
        )
      `)
      .eq('id', reconciliation.bank_statement_id)
      .single();

    if (!statement) {
      throw new NotFoundException('Bank statement not found');
    }

    const unallocatedLines = (statement.lines || []).filter((line: any) => {
      const totalAllocated = (line.allocations || []).reduce(
        (sum: number, alloc: any) => sum + Number(alloc.amount),
        0,
      );
      const lineAmount = Number(line.amount);
      return Math.abs(totalAllocated - lineAmount) > 0.01;
    });

    const unallocatedPayments = await this.getUnallocatedPayments();

    return {
      reconciliation,
      statement,
      unallocatedLines,
      unallocatedPayments,
      summary: {
        totalExpected: Number(reconciliation.total_expected),
        totalReceived: Number(reconciliation.total_received),
        discrepancy: Number(reconciliation.discrepancy),
        unallocatedLineCount: unallocatedLines.length,
        unallocatedPaymentCount: unallocatedPayments.length,
      },
    };
  }
}
