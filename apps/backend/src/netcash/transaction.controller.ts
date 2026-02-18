import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, UpdateTransactionStatusDto, QueryTransactionsDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

export { FailedPaymentsController };

@Controller('netcash/transactions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @RequirePermissions('debit_orders:read')
  async listTransactions(@Query() query: QueryTransactionsDto) {
    return this.transactionService.listTransactions(query);
  }

  @Get('stats/summary')
  @RequirePermissions('debit_orders:read')
  async getStatistics(
    @Query('runId') runId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getTransactionStatistics({
      runId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @RequirePermissions('debit_orders:read')
  async getTransaction(@Param('id') id: string) {
    return this.transactionService.getTransaction(id);
  }

  @Put(':id/status')
  @RequirePermissions('debit_orders:update')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTransactionStatusDto) {
    return this.transactionService.updateTransactionStatus(id, dto);
  }

  @Post(':id/retry')
  @RequirePermissions('debit_orders:update')
  async retryTransaction(@Param('id') id: string, @Request() req) {
    return this.transactionService.retryTransaction(id, req.user.id);
  }
}


@Controller('netcash/failed-payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class FailedPaymentsController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @RequirePermissions('debit_orders:read')
  async listFailedPayments(@Query() query: QueryTransactionsDto) {
    return this.transactionService.getFailedPayments(query);
  }

  @Get('stats/summary')
  @RequirePermissions('debit_orders:read')
  async getFailedPaymentsStatistics(
    @Query('runId') runId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getFailedPaymentsStatistics({
      runId,
      startDate,
      endDate,
    });
  }
}
