import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateAuditEventDto, QueryAuditEventsDto } from './dto'

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Post('events')
  @RequirePermissions('system:admin')
  async createAuditEvent(@Body() dto: CreateAuditEventDto, @CurrentUser() user: any) {
    // Normally audit events are created automatically by the system
    // This endpoint is for manual audit event creation (admin only)
    return this.auditService.logEvent({
      ...dto,
      user_id: dto.user_id || user.id,
    })
  }

  @Get('events')
  @RequirePermissions('audit:read')
  async queryAuditEvents(@Query() query: QueryAuditEventsDto) {
    return this.auditService.queryAuditLog(query)
  }

  @Get('events/recent')
  @RequirePermissions('audit:read')
  async getRecentEvents(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100
    return this.auditService.getRecentEvents(limitNum)
  }

  @Get('events/entity/:entityType/:entityId')
  @RequirePermissions('audit:read')
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityAuditTrail(entityType, entityId)
  }

  @Get('events/user/:userId')
  @RequirePermissions('audit:read')
  async getUserAuditEvents(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100
    return this.auditService.getUserAuditEvents(userId, limitNum)
  }

  @Get('statistics')
  @RequirePermissions('audit:read')
  async getStatistics(@Query('start_date') startDate?: string, @Query('end_date') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.auditService.getAuditStatistics(start, end)
  }

  @Get('me')
  async getMyAuditEvents(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100
    return this.auditService.getUserAuditEvents(user.id, limitNum)
  }
}
