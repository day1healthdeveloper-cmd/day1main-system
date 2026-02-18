import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common'
import { RegimeService } from './regime.service'
import { UnderwritingService } from './underwriting.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { SubmitUnderwritingDto } from './dto'

@Controller('api/v1/regime')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegimeController {
  constructor(
    private readonly regimeService: RegimeService,
    private readonly underwritingService: UnderwritingService,
  ) {}

  /**
   * Get regime configuration for a product regime type
   */
  @Get('config/:regime')
  @RequirePermissions('products:read')
  getRegimeConfig(@Param('regime') regime: 'medical_scheme' | 'insurance') {
    return this.regimeService.getRegimeConfig(regime)
  }

  /**
   * Get required onboarding steps for a regime
   */
  @Get('onboarding-steps/:regime')
  @RequirePermissions('members:read')
  getOnboardingSteps(@Param('regime') regime: 'medical_scheme' | 'insurance') {
    return {
      regime,
      steps: this.regimeService.getOnboardingSteps(regime),
    }
  }

  /**
   * Submit underwriting questionnaire (insurance products only)
   */
  @Post('underwriting/:memberId/:productId')
  @RequirePermissions('members:write')
  async submitUnderwriting(
    @Param('memberId') memberId: string,
    @Param('productId') productId: string,
    @Body() dto: SubmitUnderwritingDto,
    @Request() req: any,
  ) {
    return this.underwritingService.submitUnderwriting(memberId, productId, dto, req.user.userId)
  }

  /**
   * Get underwriting result
   */
  @Get('underwriting/:memberId/:productId')
  @RequirePermissions('members:read')
  async getUnderwritingResult(
    @Param('memberId') memberId: string,
    @Param('productId') productId: string,
  ) {
    return this.underwritingService.getUnderwritingResult(memberId, productId)
  }

  /**
   * Validate eligibility (medical scheme products only)
   */
  @Post('eligibility/:memberId/:productId')
  @RequirePermissions('members:read')
  async validateEligibility(
    @Param('memberId') memberId: string,
    @Param('productId') productId: string,
    @Request() req: any,
  ) {
    return this.underwritingService.validateEligibility(memberId, productId, req.user.userId)
  }

  /**
   * Validate workflow for regime
   */
  @Get('validate-workflow/:regime/:workflow')
  @RequirePermissions('products:read')
  validateWorkflow(
    @Param('regime') regime: 'medical_scheme' | 'insurance',
    @Param('workflow') workflow: string,
  ) {
    return {
      regime,
      workflow,
      valid: this.regimeService.validateWorkflow(regime, workflow),
    }
  }
}
