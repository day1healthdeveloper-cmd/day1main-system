import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { PopiaService } from './popia.service'
import { DataSubjectRequestService, CreateDataSubjectRequestDto, ProcessAccessRequestDto, ProcessErasureRequestDto, ProcessRectificationRequestDto } from './data-subject-request.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { DataAccessRequestDto } from './dto'

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/popia')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PopiaController {
  constructor(
    private readonly popiaService: PopiaService,
    private readonly dataSubjectRequestService: DataSubjectRequestService,
  ) {}

  /**
   * Get data processing report for a member (POPIA access request)
   * GET /api/v1/popia/members/:memberId/data-report
   */
  @Get('members/:memberId/data-report')
  @RequirePermissions('member:read')
  async getDataProcessingReport(@Param('memberId') memberId: string) {
    return this.popiaService.getDataProcessingReport(memberId)
  }

  /**
   * Request data anonymization (POPIA erasure request)
   * POST /api/v1/popia/data-access-request
   */
  @Post('data-access-request')
  @RequirePermissions('popia:manage')
  async handleDataAccessRequest(@Body() dto: DataAccessRequestDto, @Request() req: any) {
    if (dto.request_type === 'erasure') {
      return this.popiaService.anonymizeMemberData(dto.member_id, req.user.userId, dto.reason)
    }

    if (dto.request_type === 'access') {
      return this.popiaService.getDataProcessingReport(dto.member_id)
    }

    return {
      status: 'received',
      message: 'Data access request received and will be processed',
    }
  }

  /**
   * Get field classification for an entity
   * GET /api/v1/popia/classification/:entityType/:fieldName
   */
  @Get('classification/:entityType/:fieldName')
  @RequirePermissions('popia:read')
  async getFieldClassification(
    @Param('entityType') entityType: string,
    @Param('fieldName') fieldName: string,
  ) {
    const classification = this.popiaService.getFieldClassification(entityType, fieldName)
    const isSpecialPersonalInfo = this.popiaService.isSpecialPersonalInfo(entityType, fieldName)

    return {
      entity_type: entityType,
      field_name: fieldName,
      classification,
      is_special_personal_info: isSpecialPersonalInfo,
      requires_encryption: isSpecialPersonalInfo,
    }
  }

  /**
   * Get fields requiring encryption for an entity type
   * GET /api/v1/popia/encryption-fields/:entityType
   */
  @Get('encryption-fields/:entityType')
  @RequirePermissions('popia:read')
  async getEncryptionFields(@Param('entityType') entityType: string) {
    const fields = this.popiaService.getFieldsRequiringEncryption(entityType)

    return {
      entity_type: entityType,
      fields_requiring_encryption: fields,
      count: fields.length,
    }
  }

  // Data Subject Request endpoints
  @Post('data-subject-requests')
  @RequirePermissions('popia:manage')
  async createDataSubjectRequest(@Body() dto: CreateDataSubjectRequestDto, @Request() req: AuthRequest) {
    return this.dataSubjectRequestService.createRequest(dto, req.user.userId);
  }

  @Get('data-subject-requests/:requestId')
  @RequirePermissions('popia:read')
  async getDataSubjectRequest(@Param('requestId') requestId: string) {
    return this.dataSubjectRequestService.getRequestById(requestId);
  }

  @Get('data-subject-requests/member/:memberId')
  @RequirePermissions('popia:read')
  async getDataSubjectRequestsByMember(@Param('memberId') memberId: string) {
    return this.dataSubjectRequestService.getRequestsByMember(memberId);
  }

  @Get('data-subject-requests/queue/pending')
  @RequirePermissions('popia:read')
  async getPendingDataSubjectRequests() {
    return this.dataSubjectRequestService.getPendingRequests();
  }

  @Get('data-subject-requests/queue/overdue')
  @RequirePermissions('popia:read')
  async getOverdueDataSubjectRequests() {
    return this.dataSubjectRequestService.getOverdueRequests();
  }

  @Put('data-subject-requests/:requestId/process-access')
  @RequirePermissions('popia:manage')
  async processAccessRequest(@Param('requestId') requestId: string, @Request() req: AuthRequest) {
    return this.dataSubjectRequestService.processAccessRequest({ requestId }, req.user.userId);
  }

  @Put('data-subject-requests/:requestId/process-erasure')
  @RequirePermissions('popia:manage')
  async processErasureRequest(
    @Param('requestId') requestId: string,
    @Body() body: { retainAuditTrail: boolean },
    @Request() req: AuthRequest,
  ) {
    return this.dataSubjectRequestService.processErasureRequest(
      { requestId, retainAuditTrail: body.retainAuditTrail },
      req.user.userId,
    );
  }

  @Put('data-subject-requests/:requestId/process-rectification')
  @RequirePermissions('popia:manage')
  async processRectificationRequest(
    @Param('requestId') requestId: string,
    @Body() body: { corrections: Record<string, any> },
    @Request() req: AuthRequest,
  ) {
    return this.dataSubjectRequestService.processRectificationRequest(
      { requestId, corrections: body.corrections },
      req.user.userId,
    );
  }

  @Get('data-subject-requests/statistics/summary')
  @RequirePermissions('popia:read')
  async getDataSubjectRequestStatistics() {
    return this.dataSubjectRequestService.getRequestStatistics();
  }
}
