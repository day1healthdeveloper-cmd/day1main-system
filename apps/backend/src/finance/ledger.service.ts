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
    const { data: existing } = await this.supabase.getClient()
      .from('gl_accounts')
      .select('*')
      .eq('account_number', dto.accountNumber)
      .single();

    if (existing) {
      throw new BadRequestException(`Account number ${dto.accountNumber} already exists`);
    }

    // Validate parent account if provided
    if (dto.parentAccountId) {
      const { data: parent } = await this.supabase.getClient()
        .from('gl_accounts')
        .select('*')
        .eq('id', dto.parentAccountId)
        .single();

      if (!parent) {
        throw new NotFoundException(`Parent account ${dto.parentAccountId} not found`);
      }
    }

    const { data: account, error } = await this.supabase.getClient()
      .from('gl_accounts')
      .insert({
        account_number: dto.accountNumber,
        account_name: dto.accountName,
        account_type: dto.accountType,
        parent_account_id: dto.parentAccountId,
        is_active: true,
      })
      .select()
      .single();

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
    const { data: account, error } = await this.supabase.getClient()
      .from('gl_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (!account) {
      throw new NotFoundException(`GL account ${accountId} not found`);
    }

    return account;
  }

  /**
   * Get GL account by account number
   */
  async getGlAccountByNumber(accountNumber: string) {
    const { data: account, error } = await this.supabase.getClient()
      .from('gl_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .single();

    if (!account) {
      throw new NotFoundException(`GL account ${accountNumber} not found`);
    }

    return account;
  }

  /**
   * Get all GL accounts
   */
  async getAllGlAccounts() {
    const { data } = await this.supabase.getClient()
      .from('gl_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_number', { ascending: true });
    return data || [];
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
    const { data: journal, error: journalError } = await this.supabase.getClient()
      .from('gl_journals')
      .insert({
        journal_number: journalNumber,
        journal_date: dto.journalDate.toISOString(),
        description: dto.description,
        reference: dto.reference,
        status: 'posted',
        created_by: userId,
      })
      .select()
      .single();

    // Create journal entries
    const entryInserts = dto.entries.map(entry => ({
      journal_id: journal.id,
      account_id: entry.accountId,
      entry_type: entry.entryType,
      amount: entry.amount,
      cost_centre_id: entry.costCentreId,
      description: entry.description,
    }));

    const { data: entries, error: entriesError } = await this.supabase.getClient()
      .from('gl_entries')
      .insert(entryInserts)
      .select();

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
    const { data: journal, error } = await this.supabase.getClient()
      .from('gl_journals')
      .select(`
        *,
        entries:gl_entries(
          *,
          account:gl_accounts(*),
          cost_centre:cost_centres(*)
        )
      `)
      .eq('id', journalId)
      .single();

    if (!journal) {
      throw new NotFoundException(`Journal ${journalId} not found`);
    }

    return journal;
  }

  /**
   * Get journal entry by journal number
   */
  async getJournalByNumber(journalNumber: string) {
    const { data: journal, error } = await this.supabase.getClient()
      .from('gl_journals')
      .select(`
        *,
        entries:gl_entries(
          *,
          account:gl_accounts(*),
          cost_centre:cost_centres(*)
        )
      `)
      .eq('journal_number', journalNumber)
      .single();

    if (!journal) {
      throw new NotFoundException(`Journal ${journalNumber} not found`);
    }

    return journal;
  }

  /**
   * Get journals by date range
   */
  async getJournalsByDateRange(startDate: Date, endDate: Date) {
    const { data } = await this.supabase.getClient()
      .from('gl_journals')
      .select(`
        *,
        entries:gl_entries(
          *,
          account:gl_accounts(*)
        )
      `)
      .gte('journal_date', startDate.toISOString())
      .lte('journal_date', endDate.toISOString())
      .order('journal_date', { ascending: false });
    return data || [];
  }

  /**
   * Calculate account balance as of a specific date
   */
  async getAccountBalance(dto: GetAccountBalanceDto) {
    const account = await this.getGlAccountById(dto.accountId);

    const asOfDate = dto.asOfDate || new Date();

    // Get all entries for this account up to the specified date
    const { data: entries } = await this.supabase.getClient()
      .from('gl_entries')
      .select(`
        *,
        journal:gl_journals(*)
      `)
      .eq('account_id', dto.accountId)
      .lte('journal.journal_date', asOfDate.toISOString())
      .eq('journal.status', 'posted');

    // Calculate balance based on account type
    let balance = 0;

    for (const entry of (entries || [])) {
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
      entryCount: (entries || []).length,
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
    const { data: existing } = await this.supabase.getClient()
      .from('cost_centres')
      .select('*')
      .eq('code', code)
      .single();

    if (existing) {
      throw new BadRequestException(`Cost centre ${code} already exists`);
    }

    const { data: costCentre, error } = await this.supabase.getClient()
      .from('cost_centres')
      .insert({
        code,
        name,
        description,
        is_active: true,
      })
      .select()
      .single();

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
    const { data } = await this.supabase.getClient()
      .from('cost_centres')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });
    return data || [];
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
