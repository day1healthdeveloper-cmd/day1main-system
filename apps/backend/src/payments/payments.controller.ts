import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MandateService, CreateMandateDto } from './mandate.service';
import {
  PaymentProcessingService,
  ProcessPaymentDto,
  PaymentCallbackDto,
  ProcessRefundDto,
} from './payment-processing.service';
import {
  CollectionsService,
  ScheduleDebitOrderDto,
  ProcessArrearsDto,
  ReinstatePolicyDto,
} from './collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(
    private mandateService: MandateService,
    private paymentProcessingService: PaymentProcessingService,
    private collectionsService: CollectionsService,
  ) {}

  // Mandate endpoints
  @Post('mandates')
  @RequirePermissions('payments:write')
  async createMandate(@Body() dto: CreateMandateDto, @Request() req: AuthRequest) {
    return this.mandateService.createMandate(dto, req.user.userId);
  }

  @Get('mandates/:mandateId')
  @RequirePermissions('payments:read')
  async getMandateById(@Param('mandateId') mandateId: string) {
    return this.mandateService.getMandateById(mandateId);
  }

  @Get('mandates/member/:memberId')
  @RequirePermissions('payments:read')
  async getMandatesByMember(@Param('memberId') memberId: string) {
    return this.mandateService.getMandatesByMember(memberId);
  }

  @Get('mandates/member/:memberId/active')
  @RequirePermissions('payments:read')
  async getActiveMandateForMember(@Param('memberId') memberId: string) {
    return this.mandateService.getActiveMandateForMember(memberId);
  }

  @Put('mandates/:mandateId/activate')
  @RequirePermissions('payments:write')
  async activateMandate(
    @Param('mandateId') mandateId: string,
    @Body() body: { debicheckRef?: string },
    @Request() req: AuthRequest,
  ) {
    return this.mandateService.activateMandate(
      mandateId,
      req.user.userId,
      body.debicheckRef,
    );
  }

  @Put('mandates/:mandateId/cancel')
  @RequirePermissions('payments:write')
  async cancelMandate(
    @Param('mandateId') mandateId: string,
    @Body() body: { reason?: string },
    @Request() req: AuthRequest,
  ) {
    return this.mandateService.cancelMandate(
      mandateId,
      req.user.userId,
      body.reason,
    );
  }

  @Get('mandates/:mandateId/validate')
  @RequirePermissions('payments:read')
  async isMandateValid(@Param('mandateId') mandateId: string) {
    const isValid = await this.mandateService.isMandateValid(mandateId);
    return { mandateId, isValid };
  }

  @Get('mandates/expiring/soon')
  @RequirePermissions('payments:read')
  async getMandatesExpiringSoon() {
    return this.mandateService.getMandatesExpiringSoon();
  }

  // Payment processing endpoints
  @Post('process')
  @RequirePermissions('payments:write')
  async processPayment(@Body() dto: ProcessPaymentDto, @Request() req: AuthRequest) {
    return this.paymentProcessingService.processPayment(dto, req.user.userId);
  }

  @Post('callback')
  @RequirePermissions('payments:write')
  async handlePaymentCallback(@Body() dto: PaymentCallbackDto, @Request() req: AuthRequest) {
    return this.paymentProcessingService.handlePaymentCallback(dto, req.user.userId);
  }

  @Get(':paymentId')
  @RequirePermissions('payments:read')
  async getPaymentById(@Param('paymentId') paymentId: string) {
    return this.paymentProcessingService.getPaymentById(paymentId);
  }

  @Get('reference/:paymentReference')
  @RequirePermissions('payments:read')
  async getPaymentByReference(@Param('paymentReference') paymentReference: string) {
    return this.paymentProcessingService.getPaymentByReference(paymentReference);
  }

  @Get('invoice/:invoiceId/payments')
  @RequirePermissions('payments:read')
  async getPaymentsByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentProcessingService.getPaymentsByInvoice(invoiceId);
  }

  @Get('retries/pending')
  @RequirePermissions('payments:read')
  async getPendingRetries() {
    return this.paymentProcessingService.getPendingRetries();
  }

  // Refund endpoints
  @Post('refunds')
  @RequirePermissions('payments:refund')
  async processRefund(@Body() dto: ProcessRefundDto, @Request() req: AuthRequest) {
    return this.paymentProcessingService.processRefund(dto, req.user.userId);
  }

  @Put('refunds/:refundId/approve')
  @RequirePermissions('payments:refund')
  async approveRefund(@Param('refundId') refundId: string, @Request() req: AuthRequest) {
    return this.paymentProcessingService.approveRefund(refundId, req.user.userId);
  }

  @Put('refunds/:refundId/process')
  @RequirePermissions('payments:refund')
  async processApprovedRefund(@Param('refundId') refundId: string, @Request() req: AuthRequest) {
    return this.paymentProcessingService.processApprovedRefund(refundId, req.user.userId);
  }

  @Get('refunds/:refundId')
  @RequirePermissions('payments:read')
  async getRefundById(@Param('refundId') refundId: string) {
    return this.paymentProcessingService.getRefundById(refundId);
  }

  @Get('refunds/status/:status')
  @RequirePermissions('payments:read')
  async getRefundsByStatus(@Param('status') status: string) {
    return this.paymentProcessingService.getRefundsByStatus(status);
  }

  // Collections endpoints
  @Post('collections/debit-orders')
  @RequirePermissions('payments:write')
  async scheduleDebitOrder(@Body() dto: ScheduleDebitOrderDto, @Request() req: AuthRequest) {
    return this.collectionsService.scheduleDebitOrder(dto, req.user.userId);
  }

  @Post('collections/arrears/process')
  @RequirePermissions('payments:write')
  async processArrears(@Body() dto: ProcessArrearsDto, @Request() req: AuthRequest) {
    return this.collectionsService.processArrears(dto, req.user.userId);
  }

  @Get('collections/arrears')
  @RequirePermissions('payments:read')
  async getPoliciesInArrears() {
    return this.collectionsService.getPoliciesInArrears();
  }

  @Get('collections/approaching-lapse')
  @RequirePermissions('payments:read')
  async getPoliciesApproachingLapse() {
    return this.collectionsService.getPoliciesApproachingLapse();
  }

  @Post('collections/lapse')
  @RequirePermissions('policies:write')
  async lapsePolicy(
    @Body() body: { policyId: string; reason: string },
    @Request() req: AuthRequest,
  ) {
    return this.collectionsService.lapsePolicy(
      body.policyId,
      req.user.userId,
      body.reason,
    );
  }

  @Post('collections/reinstate')
  @RequirePermissions('policies:write')
  async reinstatePolicy(@Body() dto: ReinstatePolicyDto, @Request() req: AuthRequest) {
    return this.collectionsService.reinstatePolicy(dto, req.user.userId);
  }

  @Get('collections/lapsed')
  @RequirePermissions('payments:read')
  async getLapsedPolicies() {
    return this.collectionsService.getLapsedPolicies();
  }
}
