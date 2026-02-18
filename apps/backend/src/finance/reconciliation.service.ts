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
    const existing = await this.supabase.getClient().bankStatement.findUnique({
      where: { statement_number: dto.statementNumber },
    });

    if (existing) {
      throw new BadRequestException('Bank statement with this number already exists');
    }

    const statement = await this.supabase.getClient().bankStatement.create({
      data: {
        statement_number: dto.statementNumber,
        bank_account: dto.bankAccount,
        statement_date: dto.statementDate,
        opening_balance: new Decimal(dto.openingBalance),
        closing_balance: new Decimal(dto.closingBalance),
        imported_by: userId,
        lines: {
          create: dto.lines.map(line => ({
            transaction_date: line.transactionDate,
            description: line.description,
            reference: line.reference,
            amount: new Decimal(line.amount),
            transaction_type: line.transactionType,
            balance: new Decimal(line.balance),
          })),
        },
      },
      include: {
        lines: true,
      },
    });

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

    return statement;
  }

  async getBankStatementById(statementId: string) {
    const statement = await this.supabase.getClient().bankStatement.findUnique({
      where: { id: statementId },
      include: {
        lines: {
          include: {
            allocations: true,
          },
        },
      },
    });

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
        const paymentByRef = await this.supabase.getClient().payment.findFirst({
          where: {
            payment_reference: line.reference,
            status: 'completed',
          },
        });

        if (paymentByRef) {
          const paymentAmount = paymentByRef.amount.toNumber();
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

      const paymentsByAmount = await this.supabase.getClient().payment.findMany({
        where: {
          amount: new Decimal(lineAmount),
          status: 'completed',
          processed_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (paymentsByAmount.length === 1) {
        results.push({
          statementLineId: line.id,
          paymentId: paymentsByAmount[0].id,
          matchConfidence: 'probable',
          matchReason: 'Amount and date match',
        });
      } else if (paymentsByAmount.length > 1) {
        results.push({
          statementLineId: line.id,
          matchConfidence: 'possible',
          matchReason: `Multiple payments (${paymentsByAmount.length}) with same amount on same date`,
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
    const statementLine = await this.supabase.getClient().bankStatementLine.findUnique({
      where: { id: dto.statementLineId },
      include: { allocations: true },
    });

    if (!statementLine) {
      throw new NotFoundException('Bank statement line not found');
    }

    // Check if payment exists
    if (dto.paymentId) {
      const payment = await this.supabase.getClient().payment.findUnique({
        where: { id: dto.paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new BadRequestException('Can only allocate completed payments');
      }
    }

    // Check if invoice exists
    if (dto.invoiceId) {
      const invoice = await this.supabase.getClient().invoice.findUnique({
        where: { id: dto.invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    }

    // Check total allocated amount doesn't exceed line amount
    const totalAllocated = statementLine.allocations.reduce(
      (sum, alloc) => sum + alloc.amount.toNumber(),
      0,
    );

    const lineAmount = statementLine.amount.toNumber();
    if (totalAllocated + dto.amount > lineAmount + 0.01) {
      throw new BadRequestException(
        `Total allocation (${totalAllocated + dto.amount}) exceeds line amount (${lineAmount})`,
      );
    }

    const allocation = await this.supabase.getClient().allocation.create({
      data: {
        statement_line_id: dto.statementLineId,
        payment_id: dto.paymentId,
        invoice_id: dto.invoiceId,
        amount: new Decimal(dto.amount),
        allocated_by: userId,
      },
    });

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
    const payments = await this.supabase.getClient().payment.findMany({
      where: {
        status: 'completed',
      },
      include: {
        invoice: true,
      },
    });

    const allocations = await this.supabase.getClient().allocation.findMany({
      where: {
        payment_id: {
          in: payments.map(p => p.id),
        },
      },
    });

    const allocatedPaymentIds = new Set(allocations.map(a => a.payment_id));
    return payments.filter(p => !allocatedPaymentIds.has(p.id));
  }

  async getUnallocatedStatementLines(statementId: string) {
    const statement = await this.getBankStatementById(statementId);

    return statement.lines.filter(line => {
      const totalAllocated = line.allocations.reduce(
        (sum, alloc) => sum + alloc.amount.toNumber(),
        0,
      );
      const lineAmount = line.amount.toNumber();
      return Math.abs(totalAllocated - lineAmount) > 0.01;
    });
  }

  async performDailyReconciliation(reconciliationDate: Date, userId: string) {
    // Get all bank statements for the date
    const startOfDay = new Date(reconciliationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reconciliationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const statements = await this.supabase.getClient().bankStatement.findMany({
      where: {
        statement_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        lines: {
          include: {
            allocations: true,
          },
        },
      },
    });

    if (statements.length === 0) {
      throw new BadRequestException('No bank statements found for this date');
    }

    const reconciliations = [];

    for (const statement of statements) {
      // Calculate total expected (from payments)
      const payments = await this.supabase.getClient().payment.findMany({
        where: {
          status: 'completed',
          processed_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const totalExpected = payments.reduce(
        (sum, p) => sum + p.amount.toNumber(),
        0,
      );

      // Calculate total received (from statement lines - credits only)
      const totalReceived = statement.lines
        .filter(line => line.transaction_type === 'credit')
        .reduce((sum, line) => sum + line.amount.toNumber(), 0);

      const discrepancy = totalReceived - totalExpected;

      const reconciliation = await this.supabase.getClient().reconciliation.create({
        data: {
          reconciliation_date: reconciliationDate,
          bank_statement_id: statement.id,
          total_expected: new Decimal(totalExpected),
          total_received: new Decimal(totalReceived),
          discrepancy: new Decimal(discrepancy),
          status: Math.abs(discrepancy) < 0.01 ? 'reconciled' : 'pending',
          reconciled_at: Math.abs(discrepancy) < 0.01 ? new Date() : null,
          reconciled_by: Math.abs(discrepancy) < 0.01 ? userId : null,
        },
      });

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
    const reconciliation = await this.supabase.getClient().reconciliation.findUnique({
      where: { id: reconciliationId },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return reconciliation;
  }

  async getReconciliationsByDateRange(startDate: Date, endDate: Date) {
    return this.supabase.getClient().reconciliation.findMany({
      where: {
        reconciliation_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        reconciliation_date: 'desc',
      },
    });
  }

  async getDiscrepancies() {
    return this.supabase.getClient().reconciliation.findMany({
      where: {
        status: 'pending',
        discrepancy: {
          not: new Decimal(0),
        },
      },
      orderBy: {
        reconciliation_date: 'desc',
      },
    });
  }

  async generateReconciliationReport(reconciliationId: string) {
    const reconciliation = await this.getReconciliationById(reconciliationId);

    const statement = await this.supabase.getClient().bankStatement.findUnique({
      where: { id: reconciliation.bank_statement_id },
      include: {
        lines: {
          include: {
            allocations: true,
          },
        },
      },
    });

    if (!statement) {
      throw new NotFoundException('Bank statement not found');
    }

    const unallocatedLines = statement.lines.filter(line => {
      const totalAllocated = line.allocations.reduce(
        (sum, alloc) => sum + alloc.amount.toNumber(),
        0,
      );
      const lineAmount = line.amount.toNumber();
      return Math.abs(totalAllocated - lineAmount) > 0.01;
    });

    const unallocatedPayments = await this.getUnallocatedPayments();

    return {
      reconciliation,
      statement,
      unallocatedLines,
      unallocatedPayments,
      summary: {
        totalExpected: reconciliation.total_expected.toNumber(),
        totalReceived: reconciliation.total_received.toNumber(),
        discrepancy: reconciliation.discrepancy.toNumber(),
        unallocatedLineCount: unallocatedLines.length,
        unallocatedPaymentCount: unallocatedPayments.length,
      },
    };
  }
}
