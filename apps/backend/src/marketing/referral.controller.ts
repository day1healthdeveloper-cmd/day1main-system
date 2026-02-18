import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

/**
 * Referral Programme Controller
 * 
 * Handles referral code generation, tracking, and rewards
 * Requirements: 21.7
 */
@Controller('api/v1/marketing/referrals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * Generate referral code for a member
   */
  @Post('generate')
  @RequirePermissions('marketing:referrals:create')
  async generateReferralCode(
    @Body() body: { memberId: string },
    @Request() req: any,
  ) {
    return this.referralService.generateReferralCode(
      body.memberId,
      req.user.userId,
    );
  }

  /**
   * Get referral by code
   */
  @Get('code/:referralCode')
  @RequirePermissions('marketing:referrals:read')
  async getReferralByCode(@Param('referralCode') referralCode: string) {
    return this.referralService.getReferralByCode(referralCode);
  }

  /**
   * Track referral conversion
   */
  @Post('convert')
  @RequirePermissions('marketing:referrals:update')
  async trackReferralConversion(
    @Body() body: {
      referralCode: string;
      referredMemberId: string;
      policyId?: string;
    },
    @Request() req: any,
  ) {
    return this.referralService.trackReferralConversion({
      ...body,
      userId: req.user.userId,
    });
  }

  /**
   * Get referrals by member (as referrer)
   */
  @Get('member/:memberId')
  @RequirePermissions('marketing:referrals:read')
  async getReferralsByMember(@Param('memberId') memberId: string) {
    return this.referralService.getReferralsByMember(memberId);
  }

  /**
   * Calculate referral rewards for a member
   */
  @Get('member/:memberId/rewards')
  @RequirePermissions('marketing:referrals:read')
  async calculateReferralRewards(@Param('memberId') memberId: string) {
    return this.referralService.calculateReferralRewards(memberId);
  }

  /**
   * Get referral statistics
   */
  @Get('statistics')
  @RequirePermissions('marketing:referrals:read')
  async getReferralStatistics() {
    return this.referralService.getReferralStatistics();
  }

  /**
   * Get referral statistics for a specific member
   */
  @Get('statistics/:memberId')
  @RequirePermissions('marketing:referrals:read')
  async getMemberReferralStatistics(@Param('memberId') memberId: string) {
    return this.referralService.getReferralStatistics(memberId);
  }
}
