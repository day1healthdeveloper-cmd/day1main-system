import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { QueryReconciliationsDto, ResolveDiscrepancyDto, QueryDiscrepanciesDto } from './dto/reconciliation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('netcash/reconciliation')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  /**
   * Run reconciliation for a specific date
   * POST /api/netcash/reconciliation/run
   */
  @Post('run')
  @RequirePermissions('finance:reconcile')
  async runReconciliation(@Body('date') date: string, @Request() req) {
    return this.reconciliationService.runReconciliation(date, req.user.id);
  }

  /**
   * Auto-reconcile (yesterday's transactions)
   * POST /api/netcash/reconciliation/auto
   */
  @Post('auto')
  @RequirePermissions('finance:reconcile')
  async autoReconcile(@Request() req) {
    return this.reconciliationService.autoReconcile(req.user.id);
  }

  /**
   * List reconciliations
   * GET /api/netcash/reconciliation
   */
  @Get()
  @RequirePermissions('finance:read')
  async listReconciliations(@Query() query: QueryReconciliationsDto) {
    return this.reconciliationService.listReconciliations(query);
  }

  /**
   * Get reconciliation by ID
   * GET /api/netcash/reconciliation/:id
   */
  @Get(':id')
  @RequirePermissions('finance:read')
  async getReconciliation(@Param('id') id: string) {
    return this.reconciliationService.getReconciliation(id);
  }

  /**
   * Get reconciliation statistics
   * GET /api/netcash/reconciliation/stats/summary
   */
  @Get('stats/summary')
  @RequirePermissions('finance:read')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reconciliationService.getReconciliationStatistics({
      startDate,
      endDate,
    });
  }

  /**
   * Get discrepancies
   * GET /api/netcash/reconciliation/discrepancies/list
   */
  @Get('discrepancies/list')
  @RequirePermissions('finance:read')
  async getDiscrepancies(@Query() query: QueryDiscrepanciesDto) {
    return this.reconciliationService.getDiscrepancies(query);
  }

  /**
   * Resolve a discrepancy
   * PUT /api/netcash/reconciliation/discrepancies/:id/resolve
   */
  @Put('discrepancies/:id/resolve')
  @RequirePermissions('finance:reconcile')
  async resolveDiscrepancy(
    @Param('id') id: string,
    @Body() dto: Omit<ResolveDiscrepancyDto, 'discrepancyId'>,
    @Request() req,
  ) {
    return this.reconciliationService.resolveDiscrepancy(
      { ...dto, discrepancyId: id },
      req.user.id,
    );
  }
}
