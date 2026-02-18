import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FailedPaymentService } from './failed-payment.service';
import { QueryFailedPaymentsDto, RetryFailedPaymentDto, SuspendMemberDto, EscalateFailedPaymentDto, NotifyMemberDto } from './dto/failed-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('netcash/failed-payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class FailedPaymentController {
  constructor(private readonly failedPaymentService: FailedPaymentService) {}

  /**
   * Get all failed payments with filters
   * GET /api/netcash/failed-payments
   */
  @Get()
  @RequirePermissions('debit_orders:read')
  async getFailedPayments(@Query() query: QueryFailedPaymentsDto) {
    return this.failedPaymentService.getFailedPayments(query);
  }

  /**
   * Get failed payment statistics
   * GET /api/netcash/failed-payments/stats/summary
   */
  @Get('stats/summary')
  @RequirePermissions('debit_orders:read')
  async getStatistics(
    @Query('brokerGroup') brokerGroup?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.failedPaymentService.getFailedPaymentStatistics({
      brokerGroup,
      startDate,
      endDate,
    });
  }

  /**
   * Get members with repeated payment failures
   * GET /api/netcash/failed-payments/repeated-failures
   */
  @Get('repeated-failures')
  @RequirePermissions('debit_orders:read')
  async getMembersWithRepeatedFailures(@Query('minFailures') minFailures?: string) {
    const min = minFailures ? parseInt(minFailures) : 3;
    return this.failedPaymentService.getMembersWithRepeatedFailures(min);
  }

  /**
   * Automatically retry all failed payments
   * POST /api/netcash/failed-payments/auto-retry
   */
  @Post('auto-retry')
  @RequirePermissions('debit_orders:update')
  async autoRetryFailedPayments() {
    return this.failedPaymentService.autoRetryFailedPayments();
  }

  /**
   * Manually retry a specific failed payment
   * POST /api/netcash/failed-payments/:id/retry
   */
  @Post(':id/retry')
  @RequirePermissions('debit_orders:update')
  async retryFailedPayment(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req,
  ) {
    return this.failedPaymentService.retryFailedPayment(id, req.user.id, notes);
  }

  /**
   * Suspend member due to repeated failures
   * POST /api/netcash/failed-payments/suspend-member
   */
  @Post('suspend-member')
  @RequirePermissions('members:update')
  async suspendMember(@Body() dto: SuspendMemberDto, @Request() req) {
    return this.failedPaymentService.suspendMember(dto, req.user.id);
  }

  /**
   * Escalate failed payment for manual review
   * POST /api/netcash/failed-payments/:id/escalate
   */
  @Post(':id/escalate')
  @RequirePermissions('debit_orders:update')
  async escalateFailedPayment(
    @Param('id') id: string,
    @Body() dto: Omit<EscalateFailedPaymentDto, 'transactionId'>,
    @Request() req,
  ) {
    return this.failedPaymentService.escalateFailedPayment(
      { ...dto, transactionId: id },
      req.user.id,
    );
  }

  /**
   * Notify member about failed payment
   * POST /api/netcash/failed-payments/notify-member
   */
  @Post('notify-member')
  @RequirePermissions('members:update')
  async notifyMember(@Body() dto: NotifyMemberDto, @Request() req) {
    return this.failedPaymentService.notifyMember(dto, req.user.id);
  }
}
