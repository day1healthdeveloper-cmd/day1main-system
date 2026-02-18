import { Controller, Post, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { KycService } from './kyc.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { PerformKycDto, UpdateRiskScoreDto, FlagRiskDto } from './dto'

@Controller('api/v1/kyc')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /**
   * Perform KYC/CDD checks on a member
   * POST /api/v1/kyc/members/:memberId/perform
   */
  @Post('members/:memberId/perform')
  @RequirePermissions('member:kyc')
  async performKyc(
    @Param('memberId') memberId: string,
    @Body() dto: PerformKycDto,
    @Request() req: any,
  ) {
    return this.kycService.performKyc(memberId, dto, req.user.userId)
  }

  /**
   * Get member KYC status
   * GET /api/v1/kyc/members/:memberId/status
   */
  @Get('members/:memberId/status')
  @RequirePermissions('member:read')
  async getMemberKycStatus(@Param('memberId') memberId: string) {
    return this.kycService.getMemberKycStatus(memberId)
  }

  /**
   * Update member risk score manually
   * PUT /api/v1/kyc/members/:memberId/risk-score
   */
  @Put('members/:memberId/risk-score')
  @RequirePermissions('member:kyc')
  async updateRiskScore(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateRiskScoreDto,
    @Request() req: any,
  ) {
    return this.kycService.updateRiskScore(memberId, dto, req.user.userId)
  }

  /**
   * Flag member for risk/fraud
   * POST /api/v1/kyc/members/:memberId/flag
   */
  @Post('members/:memberId/flag')
  @RequirePermissions('member:kyc')
  async flagRisk(
    @Param('memberId') memberId: string,
    @Body() dto: FlagRiskDto,
    @Request() req: any,
  ) {
    return this.kycService.flagRisk(memberId, dto, req.user.userId)
  }

  /**
   * Resolve risk flag
   * PUT /api/v1/kyc/flags/:flagId/resolve
   */
  @Put('flags/:flagId/resolve')
  @RequirePermissions('member:kyc')
  async resolveRiskFlag(
    @Param('flagId') flagId: string,
    @Body('resolution') resolution: string,
    @Request() req: any,
  ) {
    return this.kycService.resolveRiskFlag(flagId, resolution, req.user.userId)
  }

  /**
   * Get members requiring KYC review
   * GET /api/v1/kyc/review-queue
   */
  @Get('review-queue')
  @RequirePermissions('member:kyc')
  async getMembersRequiringReview() {
    return this.kycService.getMembersRequiringReview()
  }

  /**
   * Perform enhanced due diligence (EDD)
   * POST /api/v1/kyc/members/:memberId/edd
   */
  @Post('members/:memberId/edd')
  @RequirePermissions('member:kyc')
  async performEnhancedDueDiligence(@Param('memberId') memberId: string, @Request() req: any) {
    return this.kycService.performEnhancedDueDiligence(memberId, req.user.userId)
  }
}
