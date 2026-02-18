import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('api/v1/compliance/reporting')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  /**
   * Generate PMB reporting dashboard (CMS)
   * Requirements: 23.1
   */
  @Get('cms/pmb')
  @RequirePermissions('compliance:view')
  async getPMBReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generatePMBReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Generate claims turnaround time report (CMS)
   * Requirements: 23.2
   */
  @Get('cms/claims-turnaround')
  @RequirePermissions('compliance:view')
  async getClaimsTurnaroundReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generateClaimsTurnaroundReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Generate complaints and disputes statistics (CMS)
   * Requirements: 23.3
   */
  @Get('cms/complaints')
  @RequirePermissions('compliance:view')
  async getComplaintsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generateComplaintsReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Generate provider network statistics (CMS)
   * Requirements: 23.4
   */
  @Get('cms/provider-network')
  @RequirePermissions('compliance:view')
  async getProviderNetworkReport() {
    return this.reportingService.generateProviderNetworkReport();
  }

  /**
   * Generate member movement report (CMS)
   * Requirements: 23.5
   */
  @Get('cms/member-movement')
  @RequirePermissions('compliance:view')
  async getMemberMovementReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generateMemberMovementReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Generate solvency and financial extracts (CMS)
   * Requirements: 23.6
   */
  @Get('cms/solvency')
  @RequirePermissions('compliance:view')
  async getSolvencyReport(@Query('asAtDate') asAtDate: string) {
    return this.reportingService.generateSolvencyReport(new Date(asAtDate));
  }

  /**
   * Generate policy register (FSCA/PA)
   * Requirements: 24.1
   */
  @Get('fsca/policy-register')
  @RequirePermissions('compliance:view')
  async getPolicyRegister() {
    return this.reportingService.generatePolicyRegister('insurance');
  }

  /**
   * Generate claims register (FSCA/PA)
   * Requirements: 24.2
   */
  @Get('fsca/claims-register')
  @RequirePermissions('compliance:view')
  async getClaimsRegister(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generateClaimsRegister(
      new Date(startDate),
      new Date(endDate),
      'insurance',
    );
  }

  /**
   * Generate conduct metrics (FSCA/PA)
   * Requirements: 24.3
   */
  @Get('fsca/conduct-metrics')
  @RequirePermissions('compliance:view')
  async getConductMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportingService.generateConductMetrics(
      new Date(startDate),
      new Date(endDate),
      'insurance',
    );
  }

  /**
   * Generate product governance report (FSCA/PA)
   * Requirements: 24.4
   */
  @Get('fsca/product-governance')
  @RequirePermissions('compliance:view')
  async getProductGovernanceReport() {
    return this.reportingService.generateProductGovernanceReport('insurance');
  }
}
