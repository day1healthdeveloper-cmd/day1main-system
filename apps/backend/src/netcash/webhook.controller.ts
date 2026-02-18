import { Controller, Get, Post, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { NetcashWebhookDto, QueryWebhookLogsDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('netcash/webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Receive webhook from Netcash (PUBLIC endpoint - no auth)
   * POST /api/netcash/webhook
   */
  @Post()
  async receiveWebhook(
    @Body() payload: NetcashWebhookDto,
    @Headers('x-netcash-signature') signature?: string,
  ) {
    return this.webhookService.processWebhook(payload, signature);
  }

  /**
   * Get webhook logs (PROTECTED endpoint)
   * GET /api/netcash/webhook/logs
   */
  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('debit_orders:read')
  async getWebhookLogs(@Query() query: QueryWebhookLogsDto) {
    return this.webhookService.getWebhookLogs(query);
  }

  /**
   * Get webhook statistics
   * GET /api/netcash/webhook/stats/summary
   */
  @Get('stats/summary')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('debit_orders:read')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.webhookService.getWebhookStatistics({
      startDate,
      endDate,
    });
  }

  /**
   * Retry failed webhook
   * POST /api/netcash/webhook/:id/retry
   */
  @Post(':id/retry')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('debit_orders:update')
  async retryWebhook(@Param('id') id: string) {
    return this.webhookService.retryWebhook(id);
  }
}
