import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateLandingPageDto, UpdateLandingPageDto, CaptureLandingPageLeadDto } from './dto/landing-page.dto';

@Controller('marketing/landing-pages')
export class LandingPageController {
  constructor(private landingPageService: LandingPageService) {}

  /**
   * Create a new landing page
   */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:write')
  async createLandingPage(
    @Body() dto: CreateLandingPageDto,
    @CurrentUser() user: any,
  ) {
    return this.landingPageService.createLandingPage(dto, user.userId);
  }

  /**
   * Get all landing pages
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:view')
  async getAllLandingPages() {
    return this.landingPageService.getAllLandingPages();
  }

  /**
   * Get landing page by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:view')
  async getLandingPageById(@Param('id') id: string) {
    return this.landingPageService.getLandingPageById(id);
  }

  /**
   * Update landing page
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:write')
  async updateLandingPage(
    @Param('id') id: string,
    @Body() dto: UpdateLandingPageDto,
    @CurrentUser() user: any,
  ) {
    return this.landingPageService.updateLandingPage(id, dto, user.userId);
  }

  /**
   * Delete landing page
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:write')
  async deleteLandingPage(@Param('id') id: string) {
    return this.landingPageService.deleteLandingPage(id);
  }

  /**
   * Clone landing page
   */
  @Post(':id/clone')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:write')
  async cloneLandingPage(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.landingPageService.cloneLandingPage(id, user.userId);
  }

  /**
   * Get landing page statistics
   */
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('marketing:view')
  async getLandingPageStats(@Param('id') id: string) {
    return this.landingPageService.getLandingPageStats(id);
  }
}

/**
 * Public controller for landing page access (no auth required)
 */
@Controller('public/landing-pages')
export class PublicLandingPageController {
  constructor(private landingPageService: LandingPageService) {}

  /**
   * Get landing page by slug (public access)
   */
  @Get('slug/:slug')
  async getLandingPageBySlug(@Param('slug') slug: string) {
    return this.landingPageService.getLandingPageBySlug(slug);
  }

  /**
   * Capture lead from landing page (public access)
   */
  @Post('leads')
  async captureLead(@Body() dto: CaptureLandingPageLeadDto) {
    return this.landingPageService.captureLead(dto);
  }

  /**
   * Update visit duration (public access)
   */
  @Put('visits/:visitId/duration')
  async updateVisitDuration(
    @Param('visitId') visitId: string,
    @Body() body: { duration: number },
  ) {
    return this.landingPageService.updateVisitDuration(visitId, body.duration);
  }
}
