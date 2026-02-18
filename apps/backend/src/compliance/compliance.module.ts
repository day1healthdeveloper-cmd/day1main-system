import { Module } from '@nestjs/common';
import { BreachIncidentService } from './breach-incident.service';
import { FraudService } from './fraud.service';
import { ComplaintsService } from './complaints.service';
import { SARSReportingService } from './sars-reporting.service';
import { ReportingService } from './reporting.service';
import { ComplianceController } from './compliance.controller';
import { ReportingController } from './reporting.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [ComplianceController, ReportingController],
  providers: [BreachIncidentService, FraudService, ComplaintsService, SARSReportingService, ReportingService],
  exports: [BreachIncidentService, FraudService, ComplaintsService, SARSReportingService, ReportingService],
})
export class ComplianceModule {}
