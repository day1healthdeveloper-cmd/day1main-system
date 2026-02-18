import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  BreachIncidentService,
  CreateBreachIncidentDto,
  InvestigateBreachDto,
  ReportToRegulatorDto,
  CloseBreachDto,
} from './breach-incident.service';
import { FraudService } from './fraud.service';
import { ComplaintsService, CreateComplaintDto, ResolveComplaintDto } from './complaints.service';
import { SARSReportingService, SARSSubmissionDto } from './sars-reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplianceController {
  constructor(
    private breachIncidentService: BreachIncidentService,
    private fraudService: FraudService,
    private complaintsService: ComplaintsService,
    private sarsReportingService: SARSReportingService,
  ) {}

  // Breach Incident endpoints
  @Post('breach-incidents')
  @RequirePermissions('compliance:write')
  async createBreachIncident(@Body() dto: CreateBreachIncidentDto, @Request() req: AuthRequest) {
    return this.breachIncidentService.createIncident(dto, req.user.userId);
  }

  @Get('breach-incidents')
  @RequirePermissions('compliance:read')
  async getAllBreachIncidents(@Query('status') status?: string) {
    return this.breachIncidentService.getAllIncidents(status);
  }

  @Get('breach-incidents/:incidentId')
  @RequirePermissions('compliance:read')
  async getBreachIncidentById(@Param('incidentId') incidentId: string) {
    return this.breachIncidentService.getIncidentById(incidentId);
  }

  @Get('breach-incidents/number/:incidentNumber')
  @RequirePermissions('compliance:read')
  async getBreachIncidentByNumber(@Param('incidentNumber') incidentNumber: string) {
    return this.breachIncidentService.getIncidentByNumber(incidentNumber);
  }

  @Get('breach-incidents/queue/open')
  @RequirePermissions('compliance:read')
  async getOpenBreachIncidents() {
    return this.breachIncidentService.getOpenIncidents();
  }

  @Get('breach-incidents/queue/critical')
  @RequirePermissions('compliance:read')
  async getCriticalBreachIncidents() {
    return this.breachIncidentService.getCriticalIncidents();
  }

  @Get('breach-incidents/queue/unreported-critical')
  @RequirePermissions('compliance:read')
  async getUnreportedCriticalIncidents() {
    return this.breachIncidentService.getUnreportedCriticalIncidents();
  }

  @Get('breach-incidents/severity/:severity')
  @RequirePermissions('compliance:read')
  async getBreachIncidentsBySeverity(@Param('severity') severity: string) {
    return this.breachIncidentService.getIncidentsBySeverity(severity);
  }

  @Put('breach-incidents/:incidentId/investigate')
  @RequirePermissions('compliance:write')
  async investigateBreachIncident(
    @Param('incidentId') incidentId: string,
    @Body() body: { findings: string },
    @Request() req: AuthRequest,
  ) {
    return this.breachIncidentService.investigateBreach(
      { incidentId, findings: body.findings },
      req.user.userId,
    );
  }

  @Put('breach-incidents/:incidentId/report-to-regulator')
  @RequirePermissions('compliance:write')
  async reportBreachToRegulator(
    @Param('incidentId') incidentId: string,
    @Body() body: { regulatorNotificationDetails: string },
    @Request() req: AuthRequest,
  ) {
    return this.breachIncidentService.reportToRegulator(
      { incidentId, regulatorNotificationDetails: body.regulatorNotificationDetails },
      req.user.userId,
    );
  }

  @Put('breach-incidents/:incidentId/close')
  @RequirePermissions('compliance:write')
  async closeBreachIncident(
    @Param('incidentId') incidentId: string,
    @Body() body: { resolution: string },
    @Request() req: AuthRequest,
  ) {
    return this.breachIncidentService.closeBreach(
      { incidentId, resolution: body.resolution },
      req.user.userId,
    );
  }

  @Get('breach-incidents/statistics/summary')
  @RequirePermissions('compliance:read')
  async getBreachIncidentStatistics() {
    return this.breachIncidentService.getIncidentStatistics();
  }

  // Fraud Detection endpoints
  @Post('fraud/members/:memberId/detect-duplicates')
  @RequirePermissions('compliance:write')
  async detectDuplicateMembers(
    @Param('memberId') memberId: string,
    @Request() req: AuthRequest,
  ) {
    return this.fraudService.detectDuplicateMembers(memberId, req.user.userId);
  }

  @Post('fraud/providers/:providerId/detect-outliers')
  @RequirePermissions('compliance:write')
  async detectProviderOutliers(
    @Param('providerId') providerId: string,
    @Request() req: AuthRequest,
  ) {
    return this.fraudService.detectProviderOutliers(providerId, req.user.userId);
  }

  @Post('fraud/cases/:caseId/export-siu')
  @RequirePermissions('compliance:write')
  async generateSIUExportPack(@Param('caseId') caseId: string, @Request() req: AuthRequest) {
    return this.fraudService.generateSIUExportPack(caseId, req.user.userId);
  }

  @Get('fraud/statistics')
  @RequirePermissions('compliance:read')
  async getFraudStatistics() {
    return this.fraudService.getFraudStatistics();
  }

  // Complaints endpoints
  @Post('complaints')
  @RequirePermissions('compliance:write')
  async createComplaint(@Body() dto: CreateComplaintDto, @Request() req: AuthRequest) {
    return this.complaintsService.createComplaint(dto, req.user.userId);
  }

  @Get('complaints')
  @RequirePermissions('compliance:read')
  async getAllComplaints(@Query('status') status?: string) {
    return this.complaintsService.getAllComplaints(status);
  }

  @Get('complaints/:complaintId')
  @RequirePermissions('compliance:read')
  async getComplaintById(@Param('complaintId') complaintId: string) {
    return this.complaintsService.getComplaintById(complaintId);
  }

  @Get('complaints/number/:complaintNumber')
  @RequirePermissions('compliance:read')
  async getComplaintByNumber(@Param('complaintNumber') complaintNumber: string) {
    return this.complaintsService.getComplaintByNumber(complaintNumber);
  }

  @Get('complaints/queue/overdue-sla')
  @RequirePermissions('compliance:read')
  async getOverdueSLAComplaints() {
    return this.complaintsService.getOverdueSLAComplaints();
  }

  @Get('complaints/queue/approaching-sla')
  @RequirePermissions('compliance:read')
  async getApproachingSLAComplaints(@Query('days') days?: string) {
    const daysThreshold = days ? parseInt(days, 10) : 3;
    return this.complaintsService.getApproachingSLAComplaints(daysThreshold);
  }

  @Put('complaints/:complaintId/escalate')
  @RequirePermissions('compliance:write')
  async escalateComplaint(
    @Param('complaintId') complaintId: string,
    @Body() body: { reason: string },
    @Request() req: AuthRequest,
  ) {
    return this.complaintsService.escalateComplaint(complaintId, req.user.userId, body.reason);
  }

  @Post('complaints/auto-escalate')
  @RequirePermissions('compliance:write')
  async autoEscalateOverdueComplaints(@Request() req: AuthRequest) {
    const count = await this.complaintsService.autoEscalateOverdueComplaints(req.user.userId);
    return { escalated_count: count };
  }

  @Put('complaints/:complaintId/assign')
  @RequirePermissions('compliance:write')
  async assignComplaint(
    @Param('complaintId') complaintId: string,
    @Body() body: { assigned_to: string },
    @Request() req: AuthRequest,
  ) {
    return this.complaintsService.assignComplaint(
      complaintId,
      body.assigned_to,
      req.user.userId,
    );
  }

  @Put('complaints/:complaintId/resolve')
  @RequirePermissions('compliance:write')
  async resolveComplaint(
    @Param('complaintId') complaintId: string,
    @Body() body: { resolution: string; outcome: string; root_cause_tags: string[] },
    @Request() req: AuthRequest,
  ) {
    return this.complaintsService.resolveComplaint(
      {
        complaint_id: complaintId,
        resolution: body.resolution,
        outcome: body.outcome as any,
        root_cause_tags: body.root_cause_tags,
      },
      req.user.userId,
    );
  }

  @Put('complaints/:complaintId/close')
  @RequirePermissions('compliance:write')
  async closeComplaint(@Param('complaintId') complaintId: string, @Request() req: AuthRequest) {
    return this.complaintsService.closeComplaint(complaintId, req.user.userId);
  }

  @Post('complaints/:complaintId/export-ombud')
  @RequirePermissions('compliance:write')
  async generateOmbudExportPack(
    @Param('complaintId') complaintId: string,
    @Request() req: AuthRequest,
  ) {
    return this.complaintsService.generateOmbudExportPack(complaintId, req.user.userId);
  }

  @Get('complaints/statistics/summary')
  @RequirePermissions('compliance:read')
  async getComplaintStatistics() {
    return this.complaintsService.getComplaintStatistics();
  }

  @Get('complaints/root-cause/:rootCauseTag')
  @RequirePermissions('compliance:read')
  async getComplaintsByRootCause(@Param('rootCauseTag') rootCauseTag: string) {
    return this.complaintsService.getComplaintsByRootCause(rootCauseTag);
  }

  // SARS Reporting endpoints
  @Post('sars/submissions')
  @RequirePermissions('compliance:write')
  async generateSARSSubmission(@Body() dto: SARSSubmissionDto, @Request() req: AuthRequest) {
    return this.sarsReportingService.generateThirdPartySubmission(dto, req.user.userId);
  }

  @Get('sars/submissions/:submissionNumber')
  @RequirePermissions('compliance:read')
  async getSARSSubmissionByNumber(@Param('submissionNumber') submissionNumber: string) {
    return this.sarsReportingService.getSubmissionByNumber(submissionNumber);
  }

  @Get('sars/submissions/tax-year/:taxYear')
  @RequirePermissions('compliance:read')
  async getSARSSubmissionsByTaxYear(@Param('taxYear') taxYear: string) {
    return this.sarsReportingService.getSubmissionsByTaxYear(parseInt(taxYear, 10));
  }

  @Get('sars/submissions/type/:submissionType')
  @RequirePermissions('compliance:read')
  async getSARSSubmissionsByType(@Param('submissionType') submissionType: string) {
    return this.sarsReportingService.getSubmissionsByType(submissionType);
  }

  @Put('sars/submissions/:submissionNumber/mark-submitted')
  @RequirePermissions('compliance:write')
  async markSARSSubmissionAsSubmitted(
    @Param('submissionNumber') submissionNumber: string,
    @Request() req: AuthRequest,
  ) {
    return this.sarsReportingService.markSubmissionAsSubmitted(submissionNumber, req.user.userId);
  }

  @Get('sars/statistics')
  @RequirePermissions('compliance:read')
  async getSARSStatistics() {
    return this.sarsReportingService.getSubmissionStatistics();
  }
}
