import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RefundService } from './refund.service';
import { CreateRefundDto, UpdateRefundStatusDto } from './dto/refund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('netcash/refunds')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /**
   * Create a refund request
   * POST /api/netcash/refunds
   */
  @Post()
  @RequirePermissions('refunds:create')
  async createRefund(@Body() dto: CreateRefundDto, @Request() req: any) {
    return this.refundService.createRefundRequest(dto, req.user.id);
  }

  /**
   * List refund requests
   * GET /api/netcash/refunds
   */
  @Get()
  @RequirePermissions('refunds:read')
  async listRefunds(
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.refundService.listRefundRequests({
      memberId,
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  /**
   * Get refund request by ID
   * GET /api/netcash/refunds/:id
   */
  @Get(':id')
  @RequirePermissions('refunds:read')
  async getRefund(@Param('id') id: string) {
    return this.refundService.getRefundRequest(id);
  }

  /**
   * Process a refund
   * POST /api/netcash/refunds/:id/process
   */
  @Post(':id/process')
  @RequirePermissions('refunds:process')
  async processRefund(@Param('id') id: string, @Request() req: any) {
    return this.refundService.processRefund(id, req.user.id);
  }

  /**
   * Update refund status
   * PUT /api/netcash/refunds/:id/status
   */
  @Put(':id/status')
  @RequirePermissions('refunds:update')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateRefundStatusDto) {
    return this.refundService.updateRefundStatus(id, dto);
  }

  /**
   * Cancel a refund request
   * POST /api/netcash/refunds/:id/cancel
   */
  @Post(':id/cancel')
  @RequirePermissions('refunds:update')
  async cancelRefund(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.refundService.cancelRefund(id, reason);
  }

  /**
   * Get refund statistics
   * GET /api/netcash/refunds/stats
   */
  @Get('stats/summary')
  @RequirePermissions('refunds:read')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('memberId') memberId?: string,
  ) {
    return this.refundService.getRefundStatistics({
      startDate,
      endDate,
      memberId,
    });
  }
}
