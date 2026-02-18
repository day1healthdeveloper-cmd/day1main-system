import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ReportingService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async generatePMBReport(startDate: Date, endDate: Date) {
    const { data: claims } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        adjudications(*),
        policy:policies(regime, plan:plans(*))
      `)
      .gte('service_date', startDate.toISOString())
      .lte('service_date', endDate.toISOString());

    const pmbClaims = (claims || []).filter(
      (claim: any) =>
        claim.policy?.regime === 'medical_scheme' &&
        claim.adjudications?.some((adj: any) => adj.pmb_applicable === true),
    );

    const totalPMBClaims = pmbClaims.length;
    const approvedPMBClaims = pmbClaims.filter((c: any) => c.status === 'approved').length;
    const rejectedPMBClaims = pmbClaims.filter((c: any) => c.status === 'rejected').length;
    const pendedPMBClaims = pmbClaims.filter((c: any) => c.status === 'pended').length;

    const totalPMBAmount = pmbClaims.reduce((sum, c: any) => sum + Number(c.total_claimed), 0);
    const approvedPMBAmount = pmbClaims
      .filter((c: any) => c.status === 'approved')
      .reduce((sum, c: any) => sum + Number(c.total_approved || 0), 0);

    const report = {
      reportType: 'pmb_dashboard',
      period: { startDate, endDate },
      statistics: {
        totalPMBClaims,
        approvedPMBClaims,
        rejectedPMBClaims,
        pendedPMBClaims,
        approvalRate: totalPMBClaims > 0 ? (approvedPMBClaims / totalPMBClaims) * 100 : 0,
        totalPMBAmount,
        approvedPMBAmount,
        averageClaimAmount: totalPMBClaims > 0 ? totalPMBAmount / totalPMBClaims : 0,
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'pmb_dashboard',
      metadata: {
        reportType: 'pmb_dashboard',
        period: { startDate, endDate },
        statistics: report.statistics,
      },
    });

    return report;
  }

  async generateClaimsTurnaroundReport(startDate: Date, endDate: Date) {
    const { data: claims } = await this.supabase
      .getClient()
      .from('claims')
      .select('*, policy:policies(regime)')
      .gte('submission_date', startDate.toISOString())
      .lte('submission_date', endDate.toISOString());

    const medicalSchemeClaims = (claims || []).filter((c: any) => c.policy?.regime === 'medical_scheme');
    const paidClaims = medicalSchemeClaims.filter((c: any) => c.status === 'paid');

    const turnaroundTimes = paidClaims.map((claim: any) => {
      const turnaroundDays = Math.floor(
        (new Date(claim.updated_at).getTime() - new Date(claim.submission_date).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return turnaroundDays;
    });

    const avgTurnaround =
      turnaroundTimes.length > 0
        ? turnaroundTimes.reduce((sum, t) => sum + t, 0) / turnaroundTimes.length
        : 0;

    const within15Days = turnaroundTimes.filter((t) => t <= 15).length;
    const within30Days = turnaroundTimes.filter((t) => t <= 30).length;

    const report = {
      reportType: 'claims_turnaround',
      period: { startDate, endDate },
      statistics: {
        totalClaims: medicalSchemeClaims.length,
        paidClaims: paidClaims.length,
        averageTurnaroundDays: avgTurnaround,
        within15Days,
        within30Days,
        complianceRate15Days:
          turnaroundTimes.length > 0 ? (within15Days / turnaroundTimes.length) * 100 : 0,
        complianceRate30Days:
          turnaroundTimes.length > 0 ? (within30Days / turnaroundTimes.length) * 100 : 0,
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'claims_turnaround',
      metadata: {
        reportType: 'claims_turnaround',
        period: { startDate, endDate },
        statistics: report.statistics,
      },
    });

    return report;
  }

  async generateComplaintsReport(startDate: Date, endDate: Date) {
    const { data: complaints } = await this.supabase
      .getClient()
      .from('complaints')
      .select('*')
      .gte('submitted_at', startDate.toISOString())
      .lte('submitted_at', endDate.toISOString());

    const byType = (complaints || []).reduce((acc: any, c: any) => {
      acc[c.complaint_type] = (acc[c.complaint_type] || 0) + 1;
      return acc;
    }, {});

    const byStatus = (complaints || []).reduce((acc: any, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const escalated = (complaints || []).filter(
      (c: any) => c.priority === 'high' || c.priority === 'critical',
    ).length;
    const resolved = (complaints || []).filter(
      (c: any) => c.status === 'resolved' || c.status === 'closed',
    ).length;

    const resolutionTimes = (complaints || [])
      .filter((c: any) => c.resolved_at)
      .map((c: any) =>
        Math.floor(
          (new Date(c.resolved_at).getTime() - new Date(c.submitted_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

    const avgResolutionDays =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
        : 0;

    const report = {
      reportType: 'complaints_statistics',
      period: { startDate, endDate },
      statistics: {
        totalComplaints: complaints?.length || 0,
        byType,
        byStatus,
        escalated,
        resolved,
        resolutionRate: (complaints?.length || 0) > 0 ? (resolved / (complaints?.length || 1)) * 100 : 0,
        averageResolutionDays: avgResolutionDays,
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'complaints_statistics',
      metadata: {
        reportType: 'complaints_statistics',
        period: { startDate, endDate },
        statistics: report.statistics,
      },
    });

    return report;
  }

  async generateProviderNetworkReport() {
    const { data: providers } = await this.supabase
      .getClient()
      .from('providers')
      .select('*');

    const byType = (providers || []).reduce((acc: any, p: any) => {
      acc[p.provider_type] = (acc[p.provider_type] || 0) + 1;
      return acc;
    }, {});

    const active = (providers || []).filter((p: any) => p.name !== null).length;

    const report = {
      reportType: 'provider_network',
      statistics: {
        totalProviders: providers?.length || 0,
        byType,
        active,
        withContracts: 0, // TODO: Implement when contracts table exists
        inNetworks: 0, // TODO: Implement when networks table exists
        contractRate: 0,
        networkRate: 0,
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'provider_network',
      metadata: {
        reportType: 'provider_network',
        statistics: report.statistics,
      },
    });

    return report;
  }

  async generateMemberMovementReport(startDate: Date, endDate: Date) {
    const { count: newMembers } = await this.supabase
      .getClient()
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { count: terminatedPolicies } = await this.supabase
      .getClient()
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    const { count: lapsedPolicies } = await this.supabase
      .getClient()
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'lapsed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    const { count: activePolicies } = await this.supabase
      .getClient()
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: totalMembers } = await this.supabase
      .getClient()
      .from('members')
      .select('*', { count: 'exact', head: true });

    const report = {
      reportType: 'member_movement',
      period: { startDate, endDate },
      statistics: {
        newMembers: newMembers || 0,
        terminatedPolicies: terminatedPolicies || 0,
        lapsedPolicies: lapsedPolicies || 0,
        netGrowth: (newMembers || 0) - (terminatedPolicies || 0) - (lapsedPolicies || 0),
        activePolicies: activePolicies || 0,
        totalMembers: totalMembers || 0,
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'member_movement',
      metadata: {
        reportType: 'member_movement',
        period: { startDate, endDate },
        statistics: report.statistics,
      },
    });

    return report;
  }

  async generateSolvencyReport(asAtDate: Date) {
    // Simplified solvency report - full implementation would require GL entries
    const report = {
      reportType: 'solvency_financial',
      asAtDate,
      financials: {
        assets: 0,
        liabilities: 0,
        equity: 0,
        revenue: 0,
        expenses: 0,
        netAssets: 0,
        solvencyRatio: 0,
      },
      generatedAt: new Date(),
      note: 'Full GL implementation required for accurate solvency reporting',
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'solvency_financial',
      metadata: {
        reportType: 'solvency_financial',
        asAtDate,
      },
    });

    return report;
  }

  async generatePolicyRegister(regime: 'insurance' = 'insurance') {
    const { data: policies } = await this.supabase
      .getClient()
      .from('policies')
      .select(`
        *,
        plan:plans(*),
        policy_members!policy_members_policy_id_fkey(
          relationship,
          member:members(first_name, last_name)
        )
      `)
      .eq('regime', regime)
      .order('policy_number', { ascending: true });

    const register = (policies || []).map((policy: any) => {
      const principal = policy.policy_members?.find((pm: any) => pm.relationship === 'self');
      return {
        policyNumber: policy.policy_number,
        planName: policy.plan?.name || 'N/A',
        principalMember: principal
          ? `${principal.member.first_name} ${principal.member.last_name}`
          : 'N/A',
        startDate: policy.start_date,
        endDate: policy.end_date,
        status: policy.status,
        premium: policy.premium,
      };
    });

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'policy_register',
      metadata: {
        reportType: 'policy_register',
        regime,
        totalPolicies: register.length,
      },
    });

    return {
      reportType: 'policy_register',
      regime,
      policies: register,
      totalPolicies: register.length,
      generatedAt: new Date(),
    };
  }

  async generateClaimsRegister(startDate: Date, endDate: Date, regime: 'insurance' = 'insurance') {
    const { data: claims } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        policy:policies(policy_number, regime),
        member:members(first_name, last_name),
        provider:providers(name)
      `)
      .gte('submission_date', startDate.toISOString())
      .lte('submission_date', endDate.toISOString())
      .order('claim_number', { ascending: true });

    const filteredClaims = (claims || []).filter((c: any) => c.policy?.regime === regime);

    const register = filteredClaims.map((claim: any) => ({
      claimNumber: claim.claim_number,
      policyNumber: claim.policy?.policy_number || 'N/A',
      memberName: `${claim.member?.first_name || ''} ${claim.member?.last_name || ''}`,
      providerName: claim.provider?.name || 'N/A',
      serviceDate: claim.service_date,
      submittedAt: claim.submission_date,
      claimedAmount: claim.total_claimed,
      approvedAmount: claim.total_approved,
      status: claim.status,
    }));

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'claims_register',
      metadata: {
        reportType: 'claims_register',
        regime,
        period: { startDate, endDate },
        totalClaims: register.length,
      },
    });

    return {
      reportType: 'claims_register',
      regime,
      period: { startDate, endDate },
      claims: register,
      totalClaims: register.length,
      generatedAt: new Date(),
    };
  }

  async generateConductMetrics(startDate: Date, endDate: Date, regime: 'insurance' = 'insurance') {
    const { count: complaints } = await this.supabase
      .getClient()
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', startDate.toISOString())
      .lte('submitted_at', endDate.toISOString());

    const { count: complaintsResolved } = await this.supabase
      .getClient()
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', startDate.toISOString())
      .lte('submitted_at', endDate.toISOString())
      .in('status', ['resolved', 'closed']);

    const { count: totalPolicies } = await this.supabase
      .getClient()
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('regime', regime);

    const { count: lapsedPolicies } = await this.supabase
      .getClient()
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'lapsed')
      .eq('regime', regime)
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    const { data: allClaims } = await this.supabase
      .getClient()
      .from('claims')
      .select('status, policy:policies!claims_policy_id_fkey(regime)')
      .gte('submission_date', startDate.toISOString())
      .lte('submission_date', endDate.toISOString());

    const filteredClaims = (allClaims || []).filter((c: any) => c.policy?.regime === regime);
    const totalClaims = filteredClaims.length;
    const claimsRejected = filteredClaims.filter((c: any) => c.status === 'rejected').length;

    const report = {
      reportType: 'conduct_metrics',
      regime,
      period: { startDate, endDate },
      metrics: {
        complaints: {
          total: complaints || 0,
          resolved: complaintsResolved || 0,
          resolutionRate: (complaints || 0) > 0 ? ((complaintsResolved || 0) / (complaints || 1)) * 100 : 0,
        },
        lapses: {
          total: lapsedPolicies || 0,
          lapseRate: (totalPolicies || 0) > 0 ? ((lapsedPolicies || 0) / (totalPolicies || 1)) * 100 : 0,
        },
        tcf: {
          claimsRejected,
          totalClaims,
          rejectionRate: totalClaims > 0 ? (claimsRejected / totalClaims) * 100 : 0,
        },
      },
      generatedAt: new Date(),
    };

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'conduct_metrics',
      metadata: {
        reportType: 'conduct_metrics',
        regime,
        period: { startDate, endDate },
        metrics: report.metrics,
      },
    });

    return report;
  }

  async generateProductGovernanceReport(regime: 'insurance' = 'insurance') {
    const { data: products } = await this.supabase
      .getClient()
      .from('products')
      .select('*, plans(*)')
      .eq('regime', regime);

    const productGovernance = await Promise.all(
      (products || []).map(async (product: any) => {
        const { data: approvalEvents } = await this.supabase
          .getClient()
          .from('audit_events')
          .select('*')
          .eq('entity_type', 'product')
          .eq('entity_id', product.id)
          .in('action', ['product.approve', 'product.reject', 'product.publish'])
          .order('timestamp', { ascending: true });

        return {
          productId: product.id,
          productName: product.name,
          planName: product.plans?.[0]?.name || 'N/A',
          regime: product.regime,
          status: product.status,
          approvalHistory: (approvalEvents || []).map((event: any) => ({
            action: event.action,
            timestamp: event.timestamp,
            userId: event.user_id,
            metadata: event.metadata,
          })),
        };
      }),
    );

    await this.auditService.logEvent({
      event_type: 'report_generated',
      action: 'report.generate',
      user_id: 'system',
      entity_type: 'report',
      entity_id: 'product_governance',
      metadata: {
        reportType: 'product_governance',
        regime,
        totalProducts: productGovernance.length,
      },
    });

    return {
      reportType: 'product_governance',
      regime,
      products: productGovernance,
      totalProducts: productGovernance.length,
      generatedAt: new Date(),
    };
  }
}
