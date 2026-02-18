import { Controller, Post, Get, Body, Param, UseGuards, Request, Query, Put } from '@nestjs/common'
import { ClaimsService } from './claims.service'
import { AdjudicationService } from './adjudication.service'
import { FraudDetectionService } from './fraud-detection.service'
import { PreAuthService } from './preauth.service'
import { AppealsService } from './appeals.service'
import { PaymentService } from './payment.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { SubmitClaimDto } from './dto'

@Controller('api/v1/claims')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly adjudicationService: AdjudicationService,
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly preauthService: PreAuthService,
    private readonly appealsService: AppealsService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Submit a new claim
   */
  @Post()
  @RequirePermissions('claims:write')
  async submitClaim(@Body() dto: SubmitClaimDto, @Request() req: any) {
    return this.claimsService.submitClaim(dto, req.user.userId)
  }

  /**
   * Get claim by ID
   */
  @Get(':claimId')
  @RequirePermissions('claims:read')
  async getClaimById(@Param('claimId') claimId: string) {
    return this.claimsService.getClaimById(claimId)
  }

  /**
   * Get claims for a member
   */
  @Get('member/:memberId')
  @RequirePermissions('claims:read')
  async getClaimsByMember(@Param('memberId') memberId: string) {
    return this.claimsService.getClaimsByMember(memberId)
  }

  /**
   * Get claims for a provider
   */
  @Get('provider/:providerId')
  @RequirePermissions('claims:read')
  async getClaimsByProvider(@Param('providerId') providerId: string) {
    return this.claimsService.getClaimsByProvider(providerId)
  }

  /**
   * Get claims by status
   */
  @Get('status/:status')
  @RequirePermissions('claims:read')
  async getClaimsByStatus(@Param('status') status: string) {
    return this.claimsService.getClaimsByStatus(status)
  }

  /**
   * Get claim status history
   */
  @Get(':claimId/status-history')
  @RequirePermissions('claims:read')
  async getClaimStatusHistory(@Param('claimId') claimId: string) {
    return this.claimsService.getClaimStatusHistory(claimId)
  }

  /**
   * Adjudicate a claim
   */
  @Post(':claimId/adjudicate')
  @RequirePermissions('claims:adjudicate')
  async adjudicateClaim(@Param('claimId') claimId: string, @Request() req: any) {
    return this.adjudicationService.adjudicateClaim(claimId, req.user.userId)
  }

  /**
   * Update claim status
   */
  @Put(':claimId/status')
  @RequirePermissions('claims:adjudicate')
  async updateClaimStatus(
    @Param('claimId') claimId: string,
    @Body() body: { status: 'approved' | 'pended' | 'rejected'; reason: string },
    @Request() req: any,
  ) {
    return this.adjudicationService.updateClaimStatus(
      claimId,
      body.status,
      body.reason,
      req.user.userId,
    )
  }

  /**
   * Calculate fraud score for a claim
   */
  @Post(':claimId/fraud-score')
  @RequirePermissions('claims:fraud_review')
  async calculateFraudScore(@Param('claimId') claimId: string, @Request() req: any) {
    return this.fraudDetectionService.calculateFraudScore(claimId, req.user.userId)
  }

  /**
   * Create fraud investigation case
   */
  @Post('fraud/investigations')
  @RequirePermissions('claims:fraud_review')
  async createInvestigationCase(
    @Body()
    body: {
      entity_type: 'claim' | 'member' | 'provider'
      entity_id: string
      fraud_type: string
      description: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    },
    @Request() req: any,
  ) {
    return this.fraudDetectionService.createInvestigationCase(
      body.entity_type,
      body.entity_id,
      body.fraud_type,
      body.description,
      body.severity,
      req.user.userId,
    )
  }

  /**
   * Get fraud investigation cases
   */
  @Get('fraud/investigations')
  @RequirePermissions('claims:fraud_review')
  async getInvestigationCases(@Query('status') status?: string) {
    return this.fraudDetectionService.getInvestigationCases(status)
  }

  /**
   * Close fraud investigation case
   */
  @Put('fraud/investigations/:caseId/close')
  @RequirePermissions('claims:fraud_review')
  async closeInvestigationCase(
    @Param('caseId') caseId: string,
    @Body() body: { resolution: string },
    @Request() req: any,
  ) {
    return this.fraudDetectionService.closeInvestigationCase(
      caseId,
      body.resolution,
      req.user.userId,
    )
  }

  /**
   * Submit pre-authorisation request
   */
  @Post('preauth')
  @RequirePermissions('claims:write')
  async submitPreAuth(
    @Body()
    body: {
      policy_id: string
      member_id: string
      provider_id: string
      service_type: string
      diagnosis_code: string
      procedure_codes: string[]
      estimated_cost: number
    },
    @Request() req: any,
  ) {
    return this.preauthService.submitPreAuthRequest(
      body.policy_id,
      body.member_id,
      body.provider_id,
      body.service_type,
      body.diagnosis_code,
      body.procedure_codes,
      body.estimated_cost,
      req.user.userId,
    )
  }

  /**
   * Get pre-auth by ID
   */
  @Get('preauth/:preauthId')
  @RequirePermissions('claims:read')
  async getPreAuthById(@Param('preauthId') preauthId: string) {
    return this.preauthService.getPreAuthById(preauthId)
  }

  /**
   * Get pre-auths by status
   */
  @Get('preauth/status/:status')
  @RequirePermissions('claims:read')
  async getPreAuthsByStatus(@Param('status') status: string) {
    return this.preauthService.getPreAuthsByStatus(status)
  }

  /**
   * Get pre-auths for member
   */
  @Get('preauth/member/:memberId')
  @RequirePermissions('claims:read')
  async getPreAuthsByMember(@Param('memberId') memberId: string) {
    return this.preauthService.getPreAuthsByMember(memberId)
  }

  /**
   * Get clinical review queue
   */
  @Get('preauth/queue/clinical-review')
  @RequirePermissions('claims:adjudicate')
  async getClinicalReviewQueue() {
    return this.preauthService.getClinicalReviewQueue()
  }

  /**
   * Approve pre-auth
   */
  @Post('preauth/:preauthId/approve')
  @RequirePermissions('claims:adjudicate')
  async approvePreAuth(
    @Param('preauthId') preauthId: string,
    @Body()
    body: {
      approved_amount: number
      conditions: any
      expiry_date: string
    },
    @Request() req: any,
  ) {
    return this.preauthService.approvePreAuth(
      preauthId,
      body.approved_amount,
      body.conditions,
      new Date(body.expiry_date),
      req.user.userId,
    )
  }

  /**
   * Reject pre-auth
   */
  @Post('preauth/:preauthId/reject')
  @RequirePermissions('claims:adjudicate')
  async rejectPreAuth(
    @Param('preauthId') preauthId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    return this.preauthService.rejectPreAuth(preauthId, body.reason, req.user.userId)
  }

  /**
   * Request more info for pre-auth
   */
  @Post('preauth/:preauthId/request-info')
  @RequirePermissions('claims:adjudicate')
  async requestMoreInfo(
    @Param('preauthId') preauthId: string,
    @Body() body: { required_info: string[] },
    @Request() req: any,
  ) {
    return this.preauthService.requestMoreInfo(preauthId, body.required_info, req.user.userId)
  }

  /**
   * Get pre-auth utilisation
   */
  @Get('preauth/:preauthId/utilisation')
  @RequirePermissions('claims:read')
  async getPreAuthUtilisation(@Param('preauthId') preauthId: string) {
    return this.preauthService.getPreAuthUtilisation(preauthId)
  }

  /**
   * Validate claim against pre-auth
   */
  @Post('preauth/:preauthId/validate-claim/:claimId')
  @RequirePermissions('claims:read')
  async validateClaimPreAuth(
    @Param('preauthId') preauthId: string,
    @Param('claimId') claimId: string,
  ) {
    const isValid = await this.preauthService.validateClaimPreAuth(claimId, preauthId)
    return { valid: isValid }
  }

  /**
   * Submit an appeal for a rejected claim
   */
  @Post('appeals')
  @RequirePermissions('claims:write')
  async submitAppeal(
    @Body()
    body: {
      claim_id: string
      appeal_reason: string
      supporting_docs?: any
    },
    @Request() req: any,
  ) {
    return this.appealsService.submitAppeal(
      body.claim_id,
      body.appeal_reason,
      body.supporting_docs,
      req.user.userId,
    )
  }

  /**
   * Get appeal by ID
   */
  @Get('appeals/:appealId')
  @RequirePermissions('claims:read')
  async getAppealById(@Param('appealId') appealId: string) {
    return this.appealsService.getAppealById(appealId)
  }

  /**
   * Get appeals by status
   */
  @Get('appeals/status/:status')
  @RequirePermissions('claims:read')
  async getAppealsByStatus(@Param('status') status: string) {
    return this.appealsService.getAppealsByStatus(status)
  }

  /**
   * Get appeals for a claim
   */
  @Get('appeals/claim/:claimId')
  @RequirePermissions('claims:read')
  async getAppealsByClaim(@Param('claimId') claimId: string) {
    return this.appealsService.getAppealsByClaim(claimId)
  }

  /**
   * Get pending appeals (review queue)
   */
  @Get('appeals/queue/pending')
  @RequirePermissions('claims:adjudicate')
  async getPendingAppeals() {
    return this.appealsService.getPendingAppeals()
  }

  /**
   * Get appeal statistics
   */
  @Get('appeals/statistics')
  @RequirePermissions('claims:read')
  async getAppealStatistics() {
    return this.appealsService.getAppealStatistics()
  }

  /**
   * Approve an appeal
   */
  @Post('appeals/:appealId/approve')
  @RequirePermissions('claims:adjudicate')
  async approveAppeal(
    @Param('appealId') appealId: string,
    @Body()
    body: {
      resolution: string
      revised_amount?: number
    },
    @Request() req: any,
  ) {
    return this.appealsService.approveAppeal(
      appealId,
      body.resolution,
      body.revised_amount,
      req.user.userId,
    )
  }

  /**
   * Reject an appeal
   */
  @Post('appeals/:appealId/reject')
  @RequirePermissions('claims:adjudicate')
  async rejectAppeal(
    @Param('appealId') appealId: string,
    @Body() body: { resolution: string },
    @Request() req: any,
  ) {
    return this.appealsService.rejectAppeal(appealId, body.resolution, req.user.userId)
  }

  /**
   * Schedule payment for approved claim
   */
  @Post(':claimId/schedule-payment')
  @RequirePermissions('payments:write')
  async scheduleClaimPayment(
    @Param('claimId') claimId: string,
    @Body() body: { payment_type: 'provider' | 'member_reimbursement' },
    @Request() req: any,
  ) {
    return this.paymentService.scheduleClaimPayment(claimId, body.payment_type, req.user.userId)
  }

  /**
   * Generate payment batch
   */
  @Post('payments/batches')
  @RequirePermissions('payments:write')
  async generatePaymentBatch(
    @Body() body: { payment_type: 'provider' | 'member_reimbursement' },
    @Request() req: any,
  ) {
    return this.paymentService.generatePaymentBatch(body.payment_type, req.user.userId)
  }

  /**
   * Mark claim as paid
   */
  @Put(':claimId/mark-paid')
  @RequirePermissions('payments:write')
  async markClaimAsPaid(
    @Param('claimId') claimId: string,
    @Body() body: { payment_date: string },
    @Request() req: any,
  ) {
    await this.paymentService.markClaimAsPaid(claimId, new Date(body.payment_date), req.user.userId)
    return { success: true }
  }

  /**
   * Generate member statement
   */
  @Post('statements/member/:memberId')
  @RequirePermissions('claims:read')
  async generateMemberStatement(
    @Param('memberId') memberId: string,
    @Body() body: { period_start: string; period_end: string },
    @Request() req: any,
  ) {
    return this.paymentService.generateMemberStatement(
      memberId,
      new Date(body.period_start),
      new Date(body.period_end),
      req.user.userId,
    )
  }

  /**
   * Generate provider remittance advice
   */
  @Post('statements/provider/:providerId')
  @RequirePermissions('claims:read')
  async generateProviderRemittance(
    @Param('providerId') providerId: string,
    @Body() body: { period_start: string; period_end: string },
    @Request() req: any,
  ) {
    return this.paymentService.generateProviderRemittance(
      providerId,
      new Date(body.period_start),
      new Date(body.period_end),
      req.user.userId,
    )
  }
}
