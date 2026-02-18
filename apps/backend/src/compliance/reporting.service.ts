import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

/**
 * Regulatory Reporting Service
 * 
 * Generates regulatory reports for:
 * - CMS (Council for Medical Schemes) - medical scheme mode
 * - FSCA/PA (Financial Sector Conduct Authority / Prudential Authority) - insurance mode
 * 
 * Requirements: 23.1-23.6 (CMS), 24.1-24.4 (FSCA/PA)
 */
@Injectable()
export class ReportingService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Generate PMB reporting dashboard (CMS requirement 23.1)
   * Shows PMB claims processing statistics
   */
  async generatePMBReport(startDate: Date, endDate: Date) {
    // Get all claims in the period for medical schemes
    const claims = await this.supabase.getClient().from('claims').select('*'){
      where: {
        service_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        adjudications: true,
        policy: {
          include: {
            plan: true,
          },
        },
      },
    });

    // Filter for medical scheme claims with PMB eligibility
    const pmbClaims = claims.filter(claim => 
      claim.policy.regime === 'medical_scheme' &&
      claim.adjudications.some(adj => adj.pmb_applicable === true)
    );

    const totalPMBClaims = pmbClaims.length;
    const approvedPMBClaims = pmbClaims.filter(c => c.status === 'approved').length;
    const rejectedPMBClaims = pmbClaims.filter(c => c.status === 'rejected').length;
    const pendedPMBClaims = pmbClaims.filter(c => c.status === 'pended').length;

    const totalPMBAmount = pmbClaims.reduce((sum, c) => sum + Number(c.total_claimed), 0);
    const approvedPMBAmount = pmbClaims
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + Number(c.total_approved || 0), 0);

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

  /**
   * Generate claims turnaround time report (CMS requirement 23.2)
   */
  async generateClaimsTurnaroundReport(startDate: Date, endDate: Date) {
    const claims = await this.supabase.getClient().from('claims').select('*'){
      where: {
        submission_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        policy: true,
      },
    });

    // Filter for medical scheme claims that are paid
    const medicalSchemeClaims = claims.filter(c => c.policy.regime === 'medical_scheme');
    const paidClaims = medicalSchemeClaims.filter(c => c.status === 'paid');

    // Calculate turnaround times (submission to updated_at for paid claims)
    const turnaroundTimes = paidClaims.map(claim => {
      const turnaroundDays = Math.floor(
        (claim.updated_at.getTime() - claim.submission_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return turnaroundDays;
    });

    const avgTurnaround = turnaroundTimes.length > 0
      ? turnaroundTimes.reduce((sum, t) => sum + t, 0) / turnaroundTimes.length
      : 0;

    const within15Days = turnaroundTimes.filter(t => t <= 15).length;
    const within30Days = turnaroundTimes.filter(t => t <= 30).length;

    const report = {
      reportType: 'claims_turnaround',
      period: { startDate, endDate },
      statistics: {
        totalClaims: medicalSchemeClaims.length,
        paidClaims: paidClaims.length,
        averageTurnaroundDays: avgTurnaround,
        within15Days,
        within30Days,
        complianceRate15Days: turnaroundTimes.length > 0 ? (within15Days / turnaroundTimes.length) * 100 : 0,
        complianceRate30Days: turnaroundTimes.length > 0 ? (within30Days / turnaroundTimes.length) * 100 : 0,
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

  /**
   * Generate complaints and disputes statistics (CMS requirement 23.3)
   */
  async generateComplaintsReport(startDate: Date, endDate: Date) {
    const complaints = await this.supabase.getClient().complaint.findMany({
      where: {
        submitted_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const byType = complaints.reduce((acc, c) => {
      acc[c.complaint_type] = (acc[c.complaint_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const escalated = complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length;
    const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

    const resolutionTimes = complaints
      .filter(c => c.resolved_at)
      .map(c => Math.floor((c.resolved_at!.getTime() - c.submitted_at.getTime()) / (1000 * 60 * 60 * 24)));

    const avgResolutionDays = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0;

    const report = {
      reportType: 'complaints_statistics',
      period: { startDate, endDate },
      statistics: {
        totalComplaints: complaints.length,
        byType,
        byStatus,
        escalated,
        resolved,
        resolutionRate: complaints.length > 0 ? (resolved / complaints.length) * 100 : 0,
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

  /**
   * Generate provider network statistics (CMS requirement 23.4)
   */
  async generateProviderNetworkReport() {
    const providers = await this.supabase.getClient().provider.findMany({
      include: {
        networks: true,
        contracts: true,
      },
    });

    const byType = providers.reduce((acc, p) => {
      acc[p.provider_type] = (acc[p.provider_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const active = providers.filter(p => p.name !== null).length;
    const withContracts = providers.filter(p => p.contracts.length > 0).length;
    const inNetworks = providers.filter(p => p.networks.length > 0).length;

    const report = {
      reportType: 'provider_network',
      statistics: {
        totalProviders: providers.length,
        byType,
        active,
        withContracts,
        inNetworks,
        contractRate: providers.length > 0 ? (withContracts / providers.length) * 100 : 0,
        networkRate: providers.length > 0 ? (inNetworks / providers.length) * 100 : 0,
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

  /**
   * Generate member movement report (CMS requirement 23.5)
   */
  async generateMemberMovementReport(startDate: Date, endDate: Date) {
    const newMembers = await this.supabase.getClient().member.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const terminatedPolicies = await this.supabase.getClient().policy.count({
      where: {
        status: 'cancelled',
        updated_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const lapsedPolicies = await this.supabase.getClient().policy.count({
      where: {
        status: 'lapsed',
        updated_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const activePolicies = await this.supabase.getClient().policy.count({
      where: {
        status: 'active',
      },
    });

    const totalMembers = await this.supabase.getClient().member.count();

    const report = {
      reportType: 'member_movement',
      period: { startDate, endDate },
      statistics: {
        newMembers,
        terminatedPolicies,
        lapsedPolicies,
        netGrowth: newMembers - terminatedPolicies - lapsedPolicies,
        activePolicies,
        totalMembers,
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

  /**
   * Generate solvency and financial extracts (CMS requirement 23.6)
   */
  async generateSolvencyReport(asAtDate: Date) {
    // Get all GL accounts
    const accounts = await this.supabase.getClient().glAccount.findMany();

    // Get all journal entries up to the date
    const journals = await this.supabase.getClient().glJournal.findMany({
      where: {
        journal_date: {
          lte: asAtDate,
        },
      },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    // Calculate balances by account type
    const balances: Record<string, number> = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0,
    };

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const amount = Number(entry.amount);
        const accountType = entry.account.account_type as string;
        
        if (entry.entry_type === 'debit') {
          if (accountType === 'asset' || accountType === 'expense') {
            balances[accountType] += amount;
          } else if (accountType === 'liability' || accountType === 'equity' || accountType === 'revenue') {
            balances[accountType] -= amount;
          }
        } else if (entry.entry_type === 'credit') {
          if (accountType === 'asset' || accountType === 'expense') {
            balances[accountType] -= amount;
          } else if (accountType === 'liability' || accountType === 'equity' || accountType === 'revenue') {
            balances[accountType] += amount;
          }
        }
      }
    }

    const netAssets = balances.asset - balances.liability;
    const solvencyRatio = balances.liability > 0 ? (balances.asset / balances.liability) * 100 : 0;

    const report = {
      reportType: 'solvency_financial',
      asAtDate,
      financials: {
        assets: balances.asset,
        liabilities: balances.liability,
        equity: balances.equity,
        revenue: balances.revenue,
        expenses: balances.expense,
        netAssets,
        solvencyRatio,
      },
      generatedAt: new Date(),
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
        financials: report.financials,
      },
    });

    return report;
  }

  /**
   * Generate policy register (FSCA/PA requirement 24.1)
   */
  async generatePolicyRegister(regime: 'insurance' = 'insurance') {
    const policies = await this.supabase.getClient().from('policies').select('*'){
      where: {
        regime,
      },
      include: {
        plan: true,
        policy_members: {
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        policy_number: 'asc',
      },
    });

    const register = policies.map(policy => {
      const principal = policy.policy_members.find(pm => pm.relationship === 'self');
      return {
        policyNumber: policy.policy_number,
        planName: policy.plan.name,
        principalMember: principal ? `${principal.member.first_name} ${principal.member.last_name}` : 'N/A',
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

  /**
   * Generate claims register (FSCA/PA requirement 24.2)
   */
  async generateClaimsRegister(startDate: Date, endDate: Date, regime: 'insurance' = 'insurance') {
    const claims = await this.supabase.getClient().from('claims').select('*'){
      where: {
        submission_date: {
          gte: startDate,
          lte: endDate,
        },
        policy: {
          regime,
        },
      },
      include: {
        policy: true,
        member: true,
        provider: true,
      },
      orderBy: {
        claim_number: 'asc',
      },
    });

    const register = claims.map(claim => ({
      claimNumber: claim.claim_number,
      policyNumber: claim.policy.policy_number,
      memberName: `${claim.member.first_name} ${claim.member.last_name}`,
      providerName: claim.provider.name,
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

  /**
   * Generate conduct metrics (FSCA/PA requirement 24.3)
   */
  async generateConductMetrics(startDate: Date, endDate: Date, regime: 'insurance' = 'insurance') {
    const complaints = await this.supabase.getClient().complaint.count({
      where: {
        submitted_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const complaintsResolved = await this.supabase.getClient().complaint.count({
      where: {
        submitted_at: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['resolved', 'closed'],
        },
      },
    });

    const lapsedPolicies = await this.supabase.getClient().policy.count({
      where: {
        status: 'lapsed',
        updated_at: {
          gte: startDate,
          lte: endDate,
        },
        regime,
      },
    });

    const totalPolicies = await this.supabase.getClient().policy.count({
      where: {
        regime,
      },
    });

    const claimsRejected = await this.supabase.getClient().claim.count({
      where: {
        submission_date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'rejected',
        policy: {
          regime,
        },
      },
    });

    const totalClaims = await this.supabase.getClient().claim.count({
      where: {
        submission_date: {
          gte: startDate,
          lte: endDate,
        },
        policy: {
          regime,
        },
      },
    });

    const report = {
      reportType: 'conduct_metrics',
      regime,
      period: { startDate, endDate },
      metrics: {
        complaints: {
          total: complaints,
          resolved: complaintsResolved,
          resolutionRate: complaints > 0 ? (complaintsResolved / complaints) * 100 : 0,
        },
        lapses: {
          total: lapsedPolicies,
          lapseRate: totalPolicies > 0 ? (lapsedPolicies / totalPolicies) * 100 : 0,
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

  /**
   * Generate product governance report (FSCA/PA requirement 24.4)
   */
  async generateProductGovernanceReport(regime: 'insurance' = 'insurance') {
    const products = await this.supabase.getClient().product.findMany({
      where: {
        regime,
      },
      include: {
        plans: true,
      },
    });

    const productGovernance = await Promise.all(
      products.map(async (product) => {
        const approvalEvents = await this.supabase.getClient().auditEvent.findMany({
          where: {
            entity_type: 'product',
            entity_id: product.id,
            action: {
              in: ['product.approve', 'product.reject', 'product.publish'],
            },
          },
          orderBy: {
            timestamp: 'asc',
          },
        });

        return {
          productId: product.id,
          productName: product.name,
          planName: product.plans[0]?.name || 'N/A',
          regime: product.regime,
          status: product.status,
          approvalHistory: approvalEvents.map(event => ({
            action: event.action,
            timestamp: event.timestamp,
            userId: event.user_id,
            metadata: event.metadata,
          })),
        };
      })
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
