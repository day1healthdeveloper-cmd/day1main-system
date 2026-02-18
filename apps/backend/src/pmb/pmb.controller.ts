import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'
import { PmbService } from './pmb.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { CheckPmbEligibilityDto, EvaluateDtpDto } from './dto'

@Controller('api/v1/pmb')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PmbController {
  constructor(private readonly pmbService: PmbService) {}

  /**
   * Check if a diagnosis/procedure qualifies as PMB
   */
  @Post('check-eligibility')
  @RequirePermissions('claims:read')
  async checkEligibility(@Body() dto: CheckPmbEligibilityDto, @Request() req: any) {
    return this.pmbService.checkPmbEligibility(dto, req.user.userId)
  }

  /**
   * Evaluate Diagnosis-Treatment Pair logic
   */
  @Post('evaluate-dtp')
  @RequirePermissions('claims:read')
  async evaluateDtp(@Body() dto: EvaluateDtpDto, @Request() req: any) {
    return this.pmbService.evaluateDtp(dto, req.user.userId)
  }

  /**
   * Get all CDL conditions
   */
  @Get('cdl-conditions')
  @RequirePermissions('products:read')
  async getCdlConditions() {
    return this.pmbService.getCdlConditions()
  }

  /**
   * Get all DTPs
   */
  @Get('dtps')
  @RequirePermissions('products:read')
  async getDtps() {
    return this.pmbService.getDtps()
  }

  /**
   * Get PMB coverage rules
   */
  @Get('coverage-rules')
  @RequirePermissions('products:read')
  async getCoverageRules() {
    return this.pmbService.getPmbCoverageRules()
  }

  /**
   * Get emergency conditions
   */
  @Get('emergency-conditions')
  @RequirePermissions('products:read')
  async getEmergencyConditions() {
    return this.pmbService.getEmergencyConditions()
  }
}
