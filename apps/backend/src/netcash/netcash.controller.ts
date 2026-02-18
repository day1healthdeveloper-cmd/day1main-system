import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NetcashService } from './netcash.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('netcash')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class NetcashController {
  constructor(private readonly netcashService: NetcashService) {}

  /**
   * Generate monthly debit order batch
   * POST /api/netcash/generate-batch
   */
  @Post('generate-batch')
  @RequirePermissions('debit_orders:create')
  async generateBatch(
    @Body()
    body: {
      actionDate: string;
      instruction?: 'Sameday' | 'TwoDay';
      brokerGroups?: string[];
      autoSubmit?: boolean;
    },
  ) {
    return this.netcashService.generateMonthlyBatch(body);
  }

  /**
   * Submit existing batch to Netcash
   * POST /api/netcash/submit-batch/:runId
   */
  @Post('submit-batch/:runId')
  @RequirePermissions('debit_orders:create')
  async submitBatch(@Param('runId') runId: string) {
    const batch = await this.netcashService.getBatchStatus(runId);
    
    if (!batch.file_path) {
      throw new Error('Batch file path not found');
    }

    const filepath = batch.file_path.startsWith('batches/') 
      ? `uploads/netcash/${batch.file_path}`
      : batch.file_path;

    return this.netcashService.submitBatchToNetcash(
      runId,
      filepath,
      batch.batch_name,
    );
  }

  /**
   * Check batch status from Netcash
   * GET /api/netcash/batch/:runId/netcash-status
   */
  @Get('batch/:runId/netcash-status')
  @RequirePermissions('debit_orders:read')
  async checkNetcashStatus(@Param('runId') runId: string) {
    return this.netcashService.checkNetcashBatchStatus(runId);
  }

  /**
   * Get batch results from Netcash
   * GET /api/netcash/batch/:runId/results
   */
  @Get('batch/:runId/results')
  @RequirePermissions('debit_orders:read')
  async getBatchResults(@Param('runId') runId: string) {
    return this.netcashService.getNetcashBatchResults(runId);
  }

  /**
   * Test Netcash API connection
   * GET /api/netcash/test-connection
   */
  @Get('test-connection')
  async testConnection() {
    return this.netcashService.testNetcashConnection();
  }

  /**
   * Get batch status
   * GET /api/netcash/batch/:runId
   */
  @Get('batch/:runId')
  @RequirePermissions('debit_orders:read')
  async getBatchStatus(@Param('runId') runId: string) {
    return this.netcashService.getBatchStatus(runId);
  }

  /**
   * Get batch history
   * GET /api/netcash/batches
   */
  @Get('batches')
  @RequirePermissions('debit_orders:read')
  async getBatchHistory(@Query('limit') limit?: string) {
    return this.netcashService.getBatchHistory(limit ? parseInt(limit) : 10);
  }

  /**
   * Get member summary
   * GET /api/netcash/summary
   */
  @Get('summary')
  @RequirePermissions('debit_orders:read')
  async getMemberSummary(
    @Query('brokerGroup') brokerGroup?: string,
    @Query('status') status?: string,
  ) {
    return this.netcashService.getMemberSummary({
      brokerGroup,
      status,
    });
  }

  /**
   * Get next debit date
   * GET /api/netcash/next-debit-date
   */
  @Get('next-debit-date')
  @RequirePermissions('debit_orders:read')
  async getNextDebitDate(@Query('daysAhead') daysAhead?: string) {
    const days = daysAhead ? parseInt(daysAhead) : 2;
    return {
      nextDebitDate: this.netcashService.getNextDebitDate(days),
      formatted: this.formatDate(this.netcashService.getNextDebitDate(days)),
    };
  }

  /**
   * Get broker groups with statistics
   * GET /api/netcash/groups
   */
  @Get('groups')
  @RequirePermissions('debit_orders:read')
  async getBrokerGroups() {
    try {
      console.log('🔵 Controller: getBrokerGroups called');
      const result = await this.netcashService.getBrokerGroups();
      console.log(`🔵 Controller: Returning ${result.length} groups`);
      return result;
    } catch (error) {
      console.error('🔴 Controller: Error in getBrokerGroups:', error);
      throw error;
    }
  }

  /**
   * Get members with filters
   * GET /api/netcash/members
   */
  @Get('members')
  @RequirePermissions('debit_orders:read')
  async getMembers(
    @Query('brokerGroup') brokerGroup?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.netcashService.getMembers({
      brokerGroup,
      status,
      search,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  /**
   * Get batches that need to be submitted today
   * GET /api/netcash/submission-batches
   */
  @Get('submission-batches')
  @RequirePermissions('debit_orders:read')
  async getSubmissionBatches(@Query('date') date?: string) {
    const submissionDate = date ? new Date(date) : new Date();
    return this.netcashService.getBatchesForSubmission(submissionDate);
  }

  /**
   * Get upcoming submission schedule
   * GET /api/netcash/submission-schedule
   */
  @Get('submission-schedule')
  @RequirePermissions('debit_orders:read')
  async getSubmissionSchedule(@Query('daysAhead') daysAhead?: string) {
    const days = daysAhead ? parseInt(daysAhead) : 30;
    return this.netcashService.getSubmissionSchedule(days);
  }

  private formatDate(dateStr: string): string {
    // Convert CCYYMMDD to YYYY-MM-DD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
}
