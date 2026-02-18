import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/marketing/campaigns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  /**
   * Create a new campaign
   */
  @Post()
  @RequirePermissions('marketing:write')
  async createCampaign(
    @Body() body: {
      campaignName: string;
      campaignType: string;
      targetAudience?: any;
      startDate: string;
      endDate?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.campaignService.createCampaign({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      userId: user.userId,
    });
  }

  /**
   * Get campaign by ID
   */
  @Get(':campaignId')
  @RequirePermissions('marketing:view')
  async getCampaignById(@Param('campaignId') campaignId: string) {
    return this.campaignService.getCampaignById(campaignId);
  }

  /**
   * Get campaigns by status
   */
  @Get('status/:status')
  @RequirePermissions('marketing:view')
  async getCampaignsByStatus(@Param('status') status: string) {
    return this.campaignService.getCampaignsByStatus(status);
  }

  /**
   * Update campaign status
   */
  @Put(':campaignId/status')
  @RequirePermissions('marketing:write')
  async updateCampaignStatus(
    @Param('campaignId') campaignId: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.campaignService.updateCampaignStatus(
      campaignId,
      body.status,
      user.userId,
    );
  }

  /**
   * Send campaign message
   */
  @Post(':campaignId/messages')
  @RequirePermissions('marketing:write')
  async sendCampaignMessage(
    @Param('campaignId') campaignId: string,
    @Body() body: {
      recipientId: string;
      recipientType: string;
      messageType: string;
      subject?: string;
      body: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.campaignService.sendCampaignMessage({
      campaignId,
      ...body,
      userId: user.userId,
    });
  }

  /**
   * Get campaign messages
   */
  @Get(':campaignId/messages')
  @RequirePermissions('marketing:view')
  async getCampaignMessages(@Param('campaignId') campaignId: string) {
    return this.campaignService.getCampaignMessages(campaignId);
  }

  /**
   * Get campaign statistics
   */
  @Get(':campaignId/statistics')
  @RequirePermissions('marketing:view')
  async getCampaignStatistics(@Param('campaignId') campaignId: string) {
    return this.campaignService.getCampaignStatistics(campaignId);
  }

  /**
   * Check member marketing consent
   */
  @Get('consent/:memberId/check')
  @RequirePermissions('marketing:view')
  async checkMarketingConsent(@Param('memberId') memberId: string) {
    const hasConsent = await this.campaignService.checkMarketingConsent(memberId);
    return { memberId, hasConsent };
  }

  /**
   * Process opt-out request
   */
  @Post('consent/:memberId/opt-out')
  @RequirePermissions('marketing:write')
  async processOptOut(
    @Param('memberId') memberId: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.campaignService.processOptOut(memberId, body.reason, user.userId);
  }

  /**
   * Get member's message history
   */
  @Get('messages/recipient/:recipientId')
  @RequirePermissions('marketing:view')
  async getRecipientMessages(@Param('recipientId') recipientId: string) {
    return this.campaignService.getRecipientMessages(recipientId);
  }
}
