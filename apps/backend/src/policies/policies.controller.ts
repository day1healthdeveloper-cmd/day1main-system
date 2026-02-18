import { Controller, Post, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { PoliciesService } from './policies.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { CreatePolicyDto, UpdatePolicyStatusDto, CreateEndorsementDto } from './dto'

@Controller('api/v1/policies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  /**
   * Create a new policy
   * POST /api/v1/policies
   */
  @Post()
  @RequirePermissions('policy:create')
  async createPolicy(@Body() dto: CreatePolicyDto, @Request() req: any) {
    return this.policiesService.createPolicy(dto, req.user.userId)
  }

  /**
   * Get policy by ID
   * GET /api/v1/policies/:policyId
   */
  @Get(':policyId')
  @RequirePermissions('policy:read')
  async getPolicyById(@Param('policyId') policyId: string) {
    return this.policiesService.getPolicyById(policyId)
  }

  /**
   * Update policy status
   * PUT /api/v1/policies/:policyId/status
   */
  @Put(':policyId/status')
  @RequirePermissions('policy:update')
  async updatePolicyStatus(
    @Param('policyId') policyId: string,
    @Body() dto: UpdatePolicyStatusDto,
    @Request() req: any,
  ) {
    return this.policiesService.updatePolicyStatus(policyId, dto, req.user.userId)
  }

  /**
   * Create policy endorsement
   * POST /api/v1/policies/:policyId/endorsements
   */
  @Post(':policyId/endorsements')
  @RequirePermissions('policy:update')
  async createEndorsement(
    @Param('policyId') policyId: string,
    @Body() dto: CreateEndorsementDto,
    @Request() req: any,
  ) {
    return this.policiesService.createEndorsement(policyId, dto, req.user.userId)
  }

  /**
   * Get policy status history
   * GET /api/v1/policies/:policyId/status-history
   */
  @Get(':policyId/status-history')
  @RequirePermissions('policy:read')
  async getPolicyStatusHistory(@Param('policyId') policyId: string) {
    return this.policiesService.getPolicyStatusHistory(policyId)
  }

  /**
   * Get policies by member
   * GET /api/v1/policies/member/:memberId
   */
  @Get('member/:memberId')
  @RequirePermissions('policy:read')
  async getPoliciesByMember(@Param('memberId') memberId: string) {
    return this.policiesService.getPoliciesByMember(memberId)
  }

  /**
   * Check member coverage
   * GET /api/v1/policies/member/:memberId/coverage
   */
  @Get('member/:memberId/coverage')
  @RequirePermissions('policy:read')
  async checkMemberCoverage(@Param('memberId') memberId: string) {
    return this.policiesService.checkMemberCoverage(memberId)
  }

  /**
   * Get waiting period status
   * GET /api/v1/policies/:policyId/member/:memberId/waiting-period
   */
  @Get(':policyId/member/:memberId/waiting-period')
  @RequirePermissions('policy:read')
  async getWaitingPeriodStatus(
    @Param('policyId') policyId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.policiesService.getWaitingPeriodStatus(policyId, memberId)
  }
}
