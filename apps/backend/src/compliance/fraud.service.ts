import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface DuplicateMemberResult {
  member_id: string;
  duplicate_type: 'bank_account' | 'phone' | 'id_number';
  matching_members: Array<{
    member_id: string;
    first_name: string;
    last_name: string;
    match_field: string;
  }>;
  risk_score: number;
}

export interface ProviderOutlierResult {
  provider_id: string;
  provider_number: string;
  outlier_type: 'high_tariff' | 'unusual_codes' | 'high_volume';
  details: {
    avg_tariff_deviation?: number;
    unusual_code_frequency?: number;
    claim_volume?: number;
    peer_avg?: number;
  };
  risk_score: number;
}

export interface SIUExportPack {
  case_id: string;
  case_number: string;
  export_date: Date;
  entity_type: string;
  entity_id: string;
  summary: string;
  evidence: Array<{
    type: string;
    description: string;
    data: any;
  }>;
  recommendations: string[];
}

@Injectable()
export class FraudService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async detectDuplicateMembers(memberId: string, userId: string): Promise<DuplicateMemberResult[]> {
    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const duplicates: DuplicateMemberResult[] = [];

    // Check for duplicate bank accounts via mandates
    const memberMandates = await this.supabase.getClient().mandate.findMany({
      where: { member_id: memberId },
      select: { account_number: true },
    });

    for (const mandate of memberMandates) {
      const bankDuplicates = await this.supabase.getClient().mandate.findMany({
        where: {
          account_number: mandate.account_number,
          member_id: { not: memberId },
        },
        select: {
          member_id: true,
          account_number: true,
        },
      });

      if (bankDuplicates.length > 0) {
        // Get member details for duplicates
        const duplicateMemberIds = bankDuplicates.map((m) => m.member_id);
        const duplicateMembers = await this.supabase.getClient().from('members').select('*'){
          where: { id: { in: duplicateMemberIds } },
          select: { id: true, first_name: true, last_name: true },
        });

        duplicates.push({
          member_id: memberId,
          duplicate_type: 'bank_account',
          matching_members: duplicateMembers.map((m) => ({
            member_id: m.id,
            first_name: m.first_name,
            last_name: m.last_name,
            match_field: mandate.account_number,
          })),
          risk_score: 90,
        });
      }
    }

    // Check for duplicate phone numbers
    const phoneDuplicates = await this.supabase.getClient().from('members').select('*'){
      where: {
        id: { not: memberId },
        phone: member.phone,
      },
      select: { id: true, first_name: true, last_name: true, phone: true },
    });

    if (phoneDuplicates.length > 0) {
      duplicates.push({
        member_id: memberId,
        duplicate_type: 'phone',
        matching_members: phoneDuplicates.map((m) => ({
          member_id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          match_field: m.phone,
        })),
        risk_score: 70,
      });
    }

    // Check for duplicate ID numbers
    const idDuplicates = await this.supabase.getClient().from('members').select('*'){
      where: {
        id: { not: memberId },
        id_number: member.id_number,
      },
      select: { id: true, first_name: true, last_name: true, id_number: true },
    });

    if (idDuplicates.length > 0) {
      duplicates.push({
        member_id: memberId,
        duplicate_type: 'id_number',
        matching_members: idDuplicates.map((m) => ({
          member_id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          match_field: m.id_number,
        })),
        risk_score: 95,
      });
    }

    if (duplicates.length > 0) {
      await this.auditService.logEvent({
        event_type: 'fraud_duplicate_member_detected',
        user_id: userId,
        entity_type: 'member',
        entity_id: memberId,
        action: 'detect',
        metadata: {
          duplicate_count: duplicates.length,
          duplicate_types: duplicates.map((d) => d.duplicate_type),
          highest_risk_score: Math.max(...duplicates.map((d) => d.risk_score)),
        },
      });
    }

    return duplicates;
  }

  async detectProviderOutliers(providerId: string, userId: string): Promise<ProviderOutlierResult[]> {
    const provider = await this.supabase.getClient().provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const outliers: ProviderOutlierResult[] = [];

    const tariffOutlier = await this.detectHighTariffOutlier(providerId, provider.provider_type);
    if (tariffOutlier) outliers.push(tariffOutlier);

    const codeOutlier = await this.detectUnusualCodePatterns(providerId);
    if (codeOutlier) outliers.push(codeOutlier);

    const volumeOutlier = await this.detectHighVolumeOutlier(providerId, provider.provider_type);
    if (volumeOutlier) outliers.push(volumeOutlier);

    if (outliers.length > 0) {
      await this.auditService.logEvent({
        event_type: 'fraud_provider_outlier_detected',
        user_id: userId,
        entity_type: 'provider',
        entity_id: providerId,
        action: 'detect',
        metadata: {
          provider_number: provider.provider_number,
          outlier_count: outliers.length,
          outlier_types: outliers.map((o) => o.outlier_type),
          highest_risk_score: Math.max(...outliers.map((o) => o.risk_score)),
        },
      });
    }

    return outliers;
  }

  private async detectHighTariffOutlier(
    providerId: string,
    providerType: string,
  ): Promise<ProviderOutlierResult | null> {
    const provider = await this.supabase.getClient().provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) return null;

    const providerClaims = await this.supabase.getClient().from('claims').select('*'){
      where: {
        provider_id: providerId,
        status: 'approved',
        submission_date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      include: { claim_lines: true },
    });

    if (providerClaims.length === 0) return null;

    const providerAvgTariff =
      providerClaims.reduce((sum, claim) => {
        const claimAvg =
          claim.claim_lines.reduce(
            (lineSum, line) => lineSum + parseFloat(line.amount_claimed.toString()),
            0,
          ) / claim.claim_lines.length;
        return sum + claimAvg;
      }, 0) / providerClaims.length;

    const peerClaims = await this.supabase.getClient().from('claims').select('*'){
      where: {
        provider: { provider_type: providerType, id: { not: providerId } },
        status: 'approved',
        submission_date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      include: { claim_lines: true },
      take: 1000,
    });

    if (peerClaims.length === 0) return null;

    const peerAvgTariff =
      peerClaims.reduce((sum, claim) => {
        const claimAvg =
          claim.claim_lines.reduce(
            (lineSum, line) => lineSum + parseFloat(line.amount_claimed.toString()),
            0,
          ) / claim.claim_lines.length;
        return sum + claimAvg;
      }, 0) / peerClaims.length;

    const deviation = ((providerAvgTariff - peerAvgTariff) / peerAvgTariff) * 100;

    if (deviation > 30) {
      return {
        provider_id: providerId,
        provider_number: provider.provider_number,
        outlier_type: 'high_tariff',
        details: {
          avg_tariff_deviation: Math.round(deviation * 10) / 10,
          peer_avg: Math.round(peerAvgTariff * 100) / 100,
        },
        risk_score: Math.round(Math.min(50 + deviation, 100)),
      };
    }

    return null;
  }

  private async detectUnusualCodePatterns(providerId: string): Promise<ProviderOutlierResult | null> {
    const provider = await this.supabase.getClient().provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) return null;

    const claimLines = await this.supabase.getClient().claimLine.findMany({
      where: {
        claim: {
          provider_id: providerId,
          submission_date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      },
      select: { procedure_code: true },
    });

    if (claimLines.length === 0) return null;

    const uniqueCodes = new Set(claimLines.map((c) => c.procedure_code));
    const codeFrequency = claimLines.length / uniqueCodes.size;

    if (codeFrequency > 20 && uniqueCodes.size < 10) {
      return {
        provider_id: providerId,
        provider_number: provider.provider_number,
        outlier_type: 'unusual_codes',
        details: { unusual_code_frequency: Math.round(codeFrequency * 10) / 10 },
        risk_score: Math.round(Math.min(40 + codeFrequency * 2, 100)),
      };
    }

    return null;
  }

  private async detectHighVolumeOutlier(
    providerId: string,
    providerType: string,
  ): Promise<ProviderOutlierResult | null> {
    const provider = await this.supabase.getClient().provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) return null;

    const providerVolume = await this.supabase.getClient().claim.count({
      where: {
        provider_id: providerId,
        submission_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const peers = await this.supabase.getClient().provider.findMany({
      where: { provider_type: providerType, id: { not: providerId } },
      select: { id: true },
      take: 100,
    });

    if (peers.length === 0) return null;

    const peerVolumes = await Promise.all(
      peers.map((peer) =>
        this.supabase.getClient().claim.count({
          where: {
            provider_id: peer.id,
            submission_date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
      ),
    );

    const peerAvgVolume = peerVolumes.reduce((sum, vol) => sum + vol, 0) / peerVolumes.length;

    if (providerVolume > peerAvgVolume * 3 && providerVolume > 100) {
      const multiplier = providerVolume / peerAvgVolume;
      return {
        provider_id: providerId,
        provider_number: provider.provider_number,
        outlier_type: 'high_volume',
        details: {
          claim_volume: providerVolume,
          peer_avg: Math.round(peerAvgVolume),
        },
        risk_score: Math.round(Math.min(40 + multiplier * 10, 100)),
      };
    }

    return null;
  }

  async generateSIUExportPack(caseId: string, userId: string): Promise<SIUExportPack> {
    const fraudCase = await this.supabase.getClient().fraudCase.findUnique({
      where: { id: caseId },
    });

    if (!fraudCase) {
      throw new NotFoundException('Fraud case not found');
    }

    const evidence: Array<{ type: string; description: string; data: any }> = [];
    const recommendations: string[] = [];

    if (fraudCase.entity_type === 'member') {
      const memberEvidence = await this.gatherMemberEvidence(fraudCase.entity_id);
      evidence.push(...memberEvidence.evidence);
      recommendations.push(...memberEvidence.recommendations);
    } else if (fraudCase.entity_type === 'provider') {
      const providerEvidence = await this.gatherProviderEvidence(fraudCase.entity_id);
      evidence.push(...providerEvidence.evidence);
      recommendations.push(...providerEvidence.recommendations);
    } else if (fraudCase.entity_type === 'claim') {
      const claimEvidence = await this.gatherClaimEvidence(fraudCase.entity_id);
      evidence.push(...claimEvidence.evidence);
      recommendations.push(...claimEvidence.recommendations);
    }

    const exportPack: SIUExportPack = {
      case_id: caseId,
      case_number: fraudCase.case_number,
      export_date: new Date(),
      entity_type: fraudCase.entity_type,
      entity_id: fraudCase.entity_id,
      summary: fraudCase.description,
      evidence,
      recommendations,
    };

    await this.auditService.logEvent({
      event_type: 'fraud_siu_export_generated',
      user_id: userId,
      entity_type: 'fraud_case',
      entity_id: caseId,
      action: 'export',
      metadata: {
        case_number: fraudCase.case_number,
        entity_type: fraudCase.entity_type,
        evidence_count: evidence.length,
        recommendation_count: recommendations.length,
      },
    });

    return exportPack;
  }

  private async gatherMemberEvidence(
    memberId: string,
  ): Promise<{ evidence: any[]; recommendations: string[] }> {
    const evidence: any[] = [];
    const recommendations: string[] = [];

    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: memberId },
    });

    if (member) {
      evidence.push({
        type: 'member_profile',
        description: 'Member profile information',
        data: {
          name: `${member.first_name} ${member.last_name}`,
          id_number: member.id_number,
          date_of_birth: member.date_of_birth,
          phone: member.phone,
          email: member.email,
        },
      });

      const duplicates = await this.detectDuplicateMembers(memberId, 'system');
      if (duplicates.length > 0) {
        evidence.push({
          type: 'duplicate_members',
          description: 'Duplicate member records detected',
          data: duplicates,
        });
        recommendations.push('Investigate duplicate member records for identity fraud');
      }

      const claims = await this.supabase.getClient().from('claims').select('*'){
        where: { member_id: memberId },
        orderBy: { submission_date: 'desc' },
        take: 50,
      });

      evidence.push({
        type: 'claim_history',
        description: 'Recent claim history',
        data: {
          total_claims: claims.length,
          total_claimed: claims.reduce(
            (sum, c) => sum + parseFloat(c.total_claimed.toString()),
            0,
          ),
          approved_claims: claims.filter((c) => c.status === 'approved').length,
          rejected_claims: claims.filter((c) => c.status === 'rejected').length,
        },
      });

      if (claims.length > 20) {
        recommendations.push('High claim frequency - review for potential abuse');
      }
    }

    return { evidence, recommendations };
  }

  private async gatherProviderEvidence(
    providerId: string,
  ): Promise<{ evidence: any[]; recommendations: string[] }> {
    const evidence: any[] = [];
    const recommendations: string[] = [];

    const provider = await this.supabase.getClient().provider.findUnique({
      where: { id: providerId },
    });

    if (provider) {
      evidence.push({
        type: 'provider_profile',
        description: 'Provider profile information',
        data: {
          provider_number: provider.provider_number,
          provider_type: provider.provider_type,
          name: provider.name,
        },
      });

      const outliers = await this.detectProviderOutliers(providerId, 'system');
      if (outliers.length > 0) {
        evidence.push({
          type: 'provider_outliers',
          description: 'Provider outlier patterns detected',
          data: outliers,
        });
        recommendations.push('Investigate provider billing patterns for potential fraud');
      }

      const claims = await this.supabase.getClient().from('claims').select('*'){
        where: { provider_id: providerId },
        orderBy: { submission_date: 'desc' },
        take: 100,
      });

      evidence.push({
        type: 'claim_statistics',
        description: 'Provider claim statistics',
        data: {
          total_claims: claims.length,
          total_billed: claims.reduce((sum, c) => sum + parseFloat(c.total_claimed.toString()), 0),
          avg_claim_amount:
            claims.reduce((sum, c) => sum + parseFloat(c.total_claimed.toString()), 0) /
            claims.length,
        },
      });
    }

    return { evidence, recommendations };
  }

  private async gatherClaimEvidence(
    claimId: string,
  ): Promise<{ evidence: any[]; recommendations: string[] }> {
    const evidence: any[] = [];
    const recommendations: string[] = [];

    const claim = await this.supabase.getClient().from('claims').select('*').eq({
      where: { id: claimId },
      include: {
        claim_lines: true,
        member: true,
        provider: true,
      },
    });

    if (claim) {
      evidence.push({
        type: 'claim_details',
        description: 'Claim information',
        data: {
          claim_number: claim.claim_number,
          member: `${claim.member.first_name} ${claim.member.last_name}`,
          provider: claim.provider.name,
          service_date: claim.service_date,
          submission_date: claim.submission_date,
          total_claimed: claim.total_claimed,
          status: claim.status,
          lines: claim.claim_lines.length,
        },
      });

      const relatedClaims = await this.supabase.getClient().from('claims').select('*'){
        where: {
          OR: [
            { member_id: claim.member_id, id: { not: claimId } },
            { provider_id: claim.provider_id, id: { not: claimId } },
          ],
          service_date: {
            gte: new Date(claim.service_date.getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: new Date(claim.service_date.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        take: 20,
      });

      if (relatedClaims.length > 0) {
        evidence.push({
          type: 'related_claims',
          description: 'Related claims within 7 days',
          data: {
            count: relatedClaims.length,
            claims: relatedClaims.map((c) => ({
              claim_number: c.claim_number,
              service_date: c.service_date,
              amount: c.total_claimed,
            })),
          },
        });
        recommendations.push('Review related claims for coordinated fraud patterns');
      }
    }

    return { evidence, recommendations };
  }

  async getFraudStatistics(): Promise<{
    total_cases: number;
    open_cases: number;
    closed_cases: number;
    by_entity_type: Record<string, number>;
    by_severity: Record<string, number>;
  }> {
    const totalCases = await this.supabase.getClient().fraudCase.count();
    const openCases = await this.supabase.getClient().fraudCase.count({ where: { status: 'open' } });
    const closedCases = await this.supabase.getClient().fraudCase.count({ where: { status: 'closed' } });

    const byEntityType = await this.supabase.getClient().fraudCase.groupBy({
      by: ['entity_type'],
      _count: true,
    });

    const bySeverity = await this.supabase.getClient().fraudCase.groupBy({
      by: ['severity'],
      _count: true,
    });

    return {
      total_cases: totalCases,
      open_cases: openCases,
      closed_cases: closedCases,
      by_entity_type: Object.fromEntries(
        byEntityType.map((item) => [item.entity_type, item._count]),
      ),
      by_severity: Object.fromEntries(bySeverity.map((item) => [item.severity, item._count])),
    };
  }
}
