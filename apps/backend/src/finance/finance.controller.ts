import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  LedgerService,
  CreateGlAccountDto,
  CreateJournalEntryDto,
  GetAccountBalanceDto,
} from './ledger.service';
import {
  ReconciliationService,
  ImportBankStatementDto,
  AllocatePaymentDto,
} from './reconciliation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceController {
  constructor(
    private ledgerService: LedgerService,
    private reconciliationService: ReconciliationService,
  ) {}

  // GL Account endpoints
  @Post('accounts')
  @RequirePermissions('finance:write')
  async createGlAccount(@Body() dto: CreateGlAccountDto, @Request() req: AuthRequest) {
    return this.ledgerService.createGlAccount(dto, req.user.userId);
  }

  @Get('accounts')
  @RequirePermissions('finance:read')
  async getAllGlAccounts() {
    return this.ledgerService.getAllGlAccounts();
  }

  @Get('accounts/:accountId')
  @RequirePermissions('finance:read')
  async getGlAccountById(@Param('accountId') accountId: string) {
    return this.ledgerService.getGlAccountById(accountId);
  }

  @Get('accounts/number/:accountNumber')
  @RequirePermissions('finance:read')
  async getGlAccountByNumber(@Param('accountNumber') accountNumber: string) {
    return this.ledgerService.getGlAccountByNumber(accountNumber);
  }

  @Get('accounts/:accountId/balance')
  @RequirePermissions('finance:read')
  async getAccountBalance(
    @Param('accountId') accountId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.ledgerService.getAccountBalance({
      accountId,
      asOfDate: asOfDate ? new Date(asOfDate) : undefined,
    });
  }

  // Journal entry endpoints
  @Post('journals')
  @RequirePermissions('finance:write')
  async postJournalEntry(@Body() dto: CreateJournalEntryDto, @Request() req: AuthRequest) {
    return this.ledgerService.postJournalEntry(dto, req.user.userId);
  }

  @Get('journals/:journalId')
  @RequirePermissions('finance:read')
  async getJournalById(@Param('journalId') journalId: string) {
    return this.ledgerService.getJournalById(journalId);
  }

  @Get('journals/number/:journalNumber')
  @RequirePermissions('finance:read')
  async getJournalByNumber(@Param('journalNumber') journalNumber: string) {
    return this.ledgerService.getJournalByNumber(journalNumber);
  }

  @Get('journals')
  @RequirePermissions('finance:read')
  async getJournalsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ledgerService.getJournalsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Trial balance endpoint
  @Get('trial-balance')
  @RequirePermissions('finance:read')
  async getTrialBalance(@Query('asOfDate') asOfDate?: string) {
    return this.ledgerService.getTrialBalance(
      asOfDate ? new Date(asOfDate) : undefined,
    );
  }

  // Cost centre endpoints
  @Post('cost-centres')
  @RequirePermissions('finance:write')
  async createCostCentre(
    @Body() body: { code: string; name: string; description: string },
    @Request() req: AuthRequest,
  ) {
    return this.ledgerService.createCostCentre(
      body.code,
      body.name,
      body.description,
      req.user.userId,
    );
  }

  @Get('cost-centres')
  @RequirePermissions('finance:read')
  async getAllCostCentres() {
    return this.ledgerService.getAllCostCentres();
  }

  // Reconciliation endpoints
  @Post('bank-statements')
  @RequirePermissions('finance:write')
  async importBankStatement(@Body() dto: ImportBankStatementDto, @Request() req: AuthRequest) {
    return this.reconciliationService.importBankStatement(dto, req.user.userId);
  }

  @Get('bank-statements/:statementId')
  @RequirePermissions('finance:read')
  async getBankStatementById(@Param('statementId') statementId: string) {
    return this.reconciliationService.getBankStatementById(statementId);
  }

  @Post('bank-statements/:statementId/match')
  @RequirePermissions('finance:write')
  async matchPayments(@Param('statementId') statementId: string) {
    return this.reconciliationService.matchPayments(statementId);
  }

  @Post('allocations')
  @RequirePermissions('finance:write')
  async allocatePayment(@Body() dto: AllocatePaymentDto, @Request() req: AuthRequest) {
    return this.reconciliationService.allocatePayment(dto, req.user.userId);
  }

  @Get('unallocated-payments')
  @RequirePermissions('finance:read')
  async getUnallocatedPayments() {
    return this.reconciliationService.getUnallocatedPayments();
  }

  @Get('bank-statements/:statementId/unallocated-lines')
  @RequirePermissions('finance:read')
  async getUnallocatedStatementLines(@Param('statementId') statementId: string) {
    return this.reconciliationService.getUnallocatedStatementLines(statementId);
  }

  @Post('reconciliations/daily')
  @RequirePermissions('finance:write')
  async performDailyReconciliation(
    @Body() body: { reconciliationDate: string },
    @Request() req: AuthRequest,
  ) {
    return this.reconciliationService.performDailyReconciliation(
      new Date(body.reconciliationDate),
      req.user.userId,
    );
  }

  @Get('reconciliations/:reconciliationId')
  @RequirePermissions('finance:read')
  async getReconciliationById(@Param('reconciliationId') reconciliationId: string) {
    return this.reconciliationService.getReconciliationById(reconciliationId);
  }

  @Get('reconciliations')
  @RequirePermissions('finance:read')
  async getReconciliationsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reconciliationService.getReconciliationsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('reconciliations/discrepancies/pending')
  @RequirePermissions('finance:read')
  async getDiscrepancies() {
    return this.reconciliationService.getDiscrepancies();
  }

  @Get('reconciliations/:reconciliationId/report')
  @RequirePermissions('finance:read')
  async generateReconciliationReport(@Param('reconciliationId') reconciliationId: string) {
    return this.reconciliationService.generateReconciliationReport(reconciliationId);
  }
}
