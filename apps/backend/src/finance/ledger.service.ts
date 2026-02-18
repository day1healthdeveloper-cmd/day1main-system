import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface CreateGlAccountDto {
  accountNumber: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccountId?: string;
}

export interface CreateJournalEntryDto {
  journalDate: Date;
  description: string;
  reference?: string;
  entries: JournalEntryLineDto[];
}

export interface JournalEntryLineDto {
  accountId: string;
  entryType: 'debit' | 'credit';
  amount: number;
  costCentreId?: string;
  description?: string;
}

export interface GetAccountBalanceDto {
  accountId: string;
  asOfDate?: Date;
}

@Injectable()
export class LedgerService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a GL account
   */
  async createGlAccount(dto: CreateGlAccountDto, userId: string) {
    // Check if account number already exists
    const existing = await this.supabase.getClient().glAccount.findUnique({
      where: { account_number: dto.accountNumber },
    });

    if (existing) {
      throw new BadRequestException(`Account number ${dto.accountNumber} already exists`);
    }

    // Validate parent account if provided
    if (dto.parentAccountId) {
      const parent = await this.supabase.getClient().glAccount.findUnique({
        where: { id: dto.parentAccountId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent account ${dto.parentAccountId} not found`);
      }
    }

    const account = await this.supabase.getClient().glAccount.create({
      data: {
        account_number: dto.accountNumber,
        account_name: dto.accountName,
        account_type: dto.accountType,
        parent_account_id: dto.parentAccountId,
        is_active: true,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'gl_account_created',
      entity_type: 'gl_account',
      entity_id: account.id,
      user_id: userId,
      action: 'create',
      metadata: {
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        accountType: dto.accountType,
      },
    });

    return account;
  }

  /**
   * Get GL account by ID
   */
  async getGlAccountById(accountId: string) {
    const account = await this.supabase.getClient().glAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`GL account ${accountId} not found`);
    }

    return account;
  }

  /**
   * Get GL account by account number
   */
  async getGlAccountByNumber(accountNumber: string) {
    const account = await this.supabase.getClient().glAccount.findUnique({
      where: { account_number: accountNumber },
    });

    if (!account) {
      throw new NotFoundException(`GL account ${accountNumber} not found`);
    }

    return account;
  }

  /**
   * Get all GL accounts
   */
  async getAllGlAccounts() {
    return this.supabase.getClient().glAccount.findMany({
      where: { is_active: true },
      orderBy: { account_number: 'asc' },
    });
  }

  /**
   * Post journal entry (with double-entry validation)
   */
  async postJournalEntry(dto: CreateJournalEntryDto, userId: string) {
    // Validate double-entry: sum of debits must equal sum of credits
    const totalDebits = dto.entries
      .filter(e => e.entryType === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredits = dto.entries
      .filter(e => e.entryType === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`,
      );
    }

    // Validate all accounts exist
    for (const entry of dto.entries) {
      await this.getGlAccountById(entry.accountId);
    }

    // Generate journal number
    const journalNumber = this.generateJournalNumber();

    // Create journal
    const journal = await this.supabase.getClient().glJournal.create({
      data: {
        journal_number: journalNumber,
        journal_date: dto.journalDate,
        description: dto.description,
        reference: dto.reference,
        status: 'posted',
        created_by: userId,
      },
    });

    // Create journal entries
    const entries = await Promise.all(
      dto.entries.map(entry =>
        this.supabase.getClient().glEntry.create({
          data: {
            journal_id: journal.id,
            account_id: entry.accountId,
            entry_type: entry.entryType,
            amount: entry.amount,
            cost_centre_id: entry.costCentreId,
            description: entry.description,
          },
        }),
      ),
    );

    // Audit log
    await this.auditService.logEvent({
      event_type: 'journal_entry_posted',
      entity_type: 'gl_journal',
      entity_id: journal.id,
      user_id: userId,
      action: 'post',
      metadata: {
        journalNumber,
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    });

    return {
      journal,
      entries,
    };
  }

  /**
   * Get journal entry by ID
   */
  async getJournalById(journalId: string) {
    const journal = await this.supabase.getClient().glJournal.findUnique({
      where: { id: journalId },
      include: {
        entries: {
          include: {
            account: true,
            cost_centre: true,
          },
        },
      },
    });

    if (!journal) {
      throw new NotFoundException(`Journal ${journalId} not found`);
    }

    return journal;
  }

  /**
   * Get journal entry by journal number
   */
  async getJournalByNumber(journalNumber: string) {
    const journal = await this.supabase.getClient().glJournal.findUnique({
      where: { journal_number: journalNumber },
      include: {
        entries: {
          include: {
            account: true,
            cost_centre: true,
          },
        },
      },
    });

    if (!journal) {
      throw new NotFoundException(`Journal ${journalNumber} not found`);
    }

    return journal;
  }

  /**
   * Get journals by date range
   */
  async getJournalsByDateRange(startDate: Date, endDate: Date) {
    return this.supabase.getClient().glJournal.findMany({
      where: {
        journal_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { journal_date: 'desc' },
    });
  }

  /**
   * Calculate account balance as of a specific date
   */
  async getAccountBalance(dto: GetAccountBalanceDto) {
    const account = await this.getGlAccountById(dto.accountId);

    const asOfDate = dto.asOfDate || new Date();

    // Get all entries for this account up to the specified date
    const entries = await this.supabase.getClient().glEntry.findMany({
      where: {
        account_id: dto.accountId,
        journal: {
          journal_date: { lte: asOfDate },
          status: 'posted',
        },
      },
      include: {
        journal: true,
      },
    });

    // Calculate balance based on account type
    let balance = 0;

    for (const entry of entries) {
      const amount = Number(entry.amount);

      // For asset and expense accounts: debit increases, credit decreases
      // For liability, equity, and revenue accounts: credit increases, debit decreases
      if (['asset', 'expense'].includes(account.account_type)) {
        balance += entry.entry_type === 'debit' ? amount : -amount;
      } else {
        balance += entry.entry_type === 'credit' ? amount : -amount;
      }
    }

    return {
      accountId: dto.accountId,
      accountNumber: account.account_number,
      accountName: account.account_name,
      accountType: account.account_type,
      balance,
      asOfDate,
      entryCount: entries.length,
    };
  }

  /**
   * Get trial balance (all account balances)
   */
  async getTrialBalance(asOfDate?: Date) {
    const accounts = await this.getAllGlAccounts();
    const date = asOfDate || new Date();

    const balances = await Promise.all(
      accounts.map(account =>
        this.getAccountBalance({
          accountId: account.id,
          asOfDate: date,
        }),
      ),
    );

    // Calculate totals
    const totalDebits = balances
      .filter(b => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0);

    const totalCredits = balances
      .filter(b => b.balance < 0)
      .reduce((sum, b) => sum + Math.abs(b.balance), 0);

    return {
      asOfDate: date,
      accounts: balances,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }

  /**
   * Create cost centre
   */
  async createCostCentre(
    code: string,
    name: string,
    description: string,
    userId: string,
  ) {
    const existing = await this.supabase.getClient().costCentre.findUnique({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException(`Cost centre ${code} already exists`);
    }

    const costCentre = await this.supabase.getClient().costCentre.create({
      data: {
        code,
        name,
        description,
        is_active: true,
      },
    });

    // Audit log
    await this.auditService.logEvent({
      event_type: 'cost_centre_created',
      entity_type: 'cost_centre',
      entity_id: costCentre.id,
      user_id: userId,
      action: 'create',
      metadata: {
        code,
        name,
      },
    });

    return costCentre;
  }

  /**
   * Get all cost centres
   */
  async getAllCostCentres() {
    return this.supabase.getClient().costCentre.findMany({
      where: { is_active: true },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Generate unique journal number
   */
  private generateJournalNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `JE-${dateStr}-${random}`;
  }
}
