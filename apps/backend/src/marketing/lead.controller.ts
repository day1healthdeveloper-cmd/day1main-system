import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeadService } from './lead.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/marketing/leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadController {
  constructor(private leadService: LeadService) {}

  /**
   * Capture a new lead
   */
  @Post()
  @RequirePermissions('marketing:write')
  async captureLead(
    @Body() body: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      sourceId?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.leadService.captureLead({
      ...body,
      userId: user.userId,
    });
  }

  /**
   * Get lead by ID
   */
  @Get(':leadId')
  @RequirePermissions('marketing:view')
  async getLeadById(@Param('leadId') leadId: string) {
    return this.leadService.getLeadById(leadId);
  }

  /**
   * Get lead by email
   */
  @Get('email/:email')
  @RequirePermissions('marketing:view')
  async getLeadByEmail(@Param('email') email: string) {
    return this.leadService.getLeadByEmail(email);
  }

  /**
   * Get leads by status
   */
  @Get('status/:status')
  @RequirePermissions('marketing:view')
  async getLeadsByStatus(@Param('status') status: string) {
    return this.leadService.getLeadsByStatus(status);
  }

  /**
   * Get leads assigned to current user
   */
  @Get('assigned/me')
  @RequirePermissions('marketing:view')
  async getMyLeads(@CurrentUser() user: any) {
    return this.leadService.getLeadsAssignedTo(user.userId);
  }

  /**
   * Get leads by source
   */
  @Get('source/:sourceId')
  @RequirePermissions('marketing:view')
  async getLeadsBySource(@Param('sourceId') sourceId: string) {
    return this.leadService.getLeadsBySource(sourceId);
  }

  /**
   * Assign lead to a user
   */
  @Put(':leadId/assign')
  @RequirePermissions('marketing:write')
  async assignLead(
    @Param('leadId') leadId: string,
    @Body() body: { assignedTo: string },
    @CurrentUser() user: any,
  ) {
    return this.leadService.assignLead(leadId, body.assignedTo, user.userId);
  }

  /**
   * Update lead status
   */
  @Put(':leadId/status')
  @RequirePermissions('marketing:write')
  async updateLeadStatus(
    @Param('leadId') leadId: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.leadService.updateLeadStatus(
      leadId,
      body.status,
      user.userId,
    );
  }

  /**
   * Convert lead to policy
   */
  @Put(':leadId/convert')
  @RequirePermissions('marketing:write')
  async convertLead(
    @Param('leadId') leadId: string,
    @Body() body: { policyId: string },
    @CurrentUser() user: any,
  ) {
    return this.leadService.convertLead(leadId, body.policyId, user.userId);
  }

  /**
   * Get conversion statistics
   */
  @Get('statistics/conversion')
  @RequirePermissions('marketing:view')
  async getConversionStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leadService.getConversionStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
