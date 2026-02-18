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
    const { data: member, error } = await this.supabase
      .getClient()
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error || !member) {
      throw new NotFoundException('Member not found');
    }

    const duplicates: DuplicateMemberResult[] = [];

    // Check for duplicate bank accounts via mandates
    const { data: memberMandates } = await this.supabase
      .getClient()
      .from('mandates')
      .select('account_number')
      .eq('member_id', memberId);

    for (const mandate of memberMandates || []) {
      const { data: bankDuplicates } = await this.supabase
        .getClient()
        .from('mandates')
        .select('member_id, account_number')
        .eq('account_number', mandate.account_number)
        .neq('member_id', memberId);

      if (bankDuplicates && bankDuplicates.length > 0) {
        const duplicateMemberIds = bankDuplicates.map((m) => m.member_id);
        const { data: duplicateMembers } = await this.supabase
          .getClient()
          .from('members')
          .select('id, first_name, last_name')
          .in('id', duplicateMemberIds);

        if (duplicateMembers) {
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
    }

    // Check for duplicate phone numbers
    if (member.phone) {
      const { data: phoneDuplicates } = await this.supabase
        .getClient()
        .from('members')
        .select('id, first_name, last_name, phone')
        .eq('phone', member.phone)
        .neq('id', memberId);

      if (phoneDuplicates && phoneDuplicates.length > 0) {
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
    }

    // Check for duplicate ID numbers
    if (member.id_number) {
      const { data: idDuplicates } = await this.supabase
        .getClient()
        .from('members')
        .select('id, first_name, last_name, id_number')
        .eq('id_number', member.id_number)
        .neq('id', memberId);

      if (idDuplicates && idDuplicates.length > 0) {
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
    const { data: provider, error } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error || !provider) {
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
    const { data: provider } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (!provider) return null;

    const { data: providerClaims } = await this.supabase
      .getClient()
      .from('claims')
      .select('*, claim_lines(*)')
      .eq('provider_id', providerId)
      .eq('status', 'approved')
      .gte('submission_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (!providerClaims || providerClaims.length === 0) return null;

    const providerAvgTariff =
      providerClaims.reduce((sum, claim) => {
        const claimAvg =
          claim.claim_lines.reduce(
            (lineSum: number, line: any) => lineSum + parseFloat(line.amount_claimed.toString()),
            0,
          ) / claim.claim_lines.length;
        return sum + claimAvg;
      }, 0) / providerClaims.length;

    const { data: peerClaims } = await this.supabase
      .getClient()
      .from('claims')
      .select('*, claim_lines(*), provider:providers!claims_provider_id_fkey(*)')
      .eq('status', 'approved')
      .gte('submission_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    const filteredPeerClaims = (peerClaims || []).filter(
      (c: any) => c.provider?.provider_type === providerType && c.provider_id !== providerId
    );

    if (filteredPeerClaims.length === 0) return null;

    const peerAvgTariff =
      filteredPeerClaims.reduce((sum, claim: any) => {
        const claimAvg =
          claim.claim_lines.reduce(
            (lineSum: number, line: any) => lineSum + parseFloat(line.amount_claimed.toString()),
            0,
          ) / claim.claim_lines.length;
        return sum + claimAvg;
      }, 0) / filteredPeerClaims.length;

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
    const { data: provider } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (!provider) return null;

    const { data: claimLines } = await this.supabase
      .getClient()
      .from('claim_lines')
      .select('procedure_code, claim:claims!claim_lines_claim_id_fkey(provider_id, submission_date)')
      .gte('claim.submission_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    const filteredLines = (claimLines || []).filter((cl: any) => cl.claim?.provider_id === providerId);

    if (filteredLines.length === 0) return null;

    const uniqueCodes = new Set(filteredLines.map((c: any) => c.procedure_code));
    const codeFrequency = filteredLines.length / uniqueCodes.size;

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
    const { data: provider } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (!provider) return null;

    const { count: providerVolume } = await this.supabase
      .getClient()
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .gte('submission_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: peers } = await this.supabase
      .getClient()
      .from('providers')
      .select('id')
      .eq('provider_type', providerType)
      .neq('id', providerId)
      .limit(100);

    if (!peers || peers.length === 0) return null;

    const peerVolumes = await Promise.all(
      peers.map(async (peer) => {
        const { count } = await this.supabase
          .getClient()
          .from('claims')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', peer.id)
          .gte('submission_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        return count || 0;
      }),
    );

    const peerAvgVolume = peerVolumes.reduce((sum, vol) => sum + vol, 0) / peerVolumes.length;

    if ((providerVolume || 0) > peerAvgVolume * 3 && (providerVolume || 0) > 100) {
      const multiplier = (providerVolume || 0) / peerAvgVolume;
      return {
        provider_id: providerId,
        provider_number: provider.provider_number,
        outlier_type: 'high_volume',
        details: {
          claim_volume: providerVolume || 0,
          peer_avg: Math.round(peerAvgVolume),
        },
        risk_score: Math.round(Math.min(40 + multiplier * 10, 100)),
      };
    }

    return null;
  }

  async generateSIUExportPack(caseId: string, userId: string): Promise<SIUExportPack> {
    const { data: fraudCase, error } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !fraudCase) {
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

    const { data: member } = await this.supabase
      .getClient()
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

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

      const { data: claims } = await this.supabase
        .getClient()
        .from('claims')
        .select('*')
        .eq('member_id', memberId)
        .order('submission_date', { ascending: false })
        .limit(50);

      evidence.push({
        type: 'claim_history',
        description: 'Recent claim history',
        data: {
          total_claims: claims?.length || 0,
          total_claimed: (claims || []).reduce(
            (sum, c) => sum + parseFloat(c.total_claimed.toString()),
            0,
          ),
          approved_claims: (claims || []).filter((c) => c.status === 'approved').length,
          rejected_claims: (claims || []).filter((c) => c.status === 'rejected').length,
        },
      });

      if ((claims?.length || 0) > 20) {
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

    const { data: provider } = await this.supabase
      .getClient()
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

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

      const { data: claims } = await this.supabase
        .getClient()
        .from('claims')
        .select('*')
        .eq('provider_id', providerId)
        .order('submission_date', { ascending: false })
        .limit(100);

      evidence.push({
        type: 'claim_statistics',
        description: 'Provider claim statistics',
        data: {
          total_claims: claims?.length || 0,
          total_billed: (claims || []).reduce((sum, c) => sum + parseFloat(c.total_claimed.toString()), 0),
          avg_claim_amount:
            (claims?.length || 0) > 0
              ? (claims || []).reduce((sum, c) => sum + parseFloat(c.total_claimed.toString()), 0) /
                (claims?.length || 1)
              : 0,
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

    const { data: claim } = await this.supabase
      .getClient()
      .from('claims')
      .select(`
        *,
        claim_lines(*),
        member:members(*),
        provider:providers(*)
      `)
      .eq('id', claimId)
      .single();

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

      const serviceDateStart = new Date(claim.service_date);
      serviceDateStart.setDate(serviceDateStart.getDate() - 7);
      const serviceDateEnd = new Date(claim.service_date);
      serviceDateEnd.setDate(serviceDateEnd.getDate() + 7);

      const { data: relatedClaims } = await this.supabase
        .getClient()
        .from('claims')
        .select('*')
        .neq('id', claimId)
        .or(`member_id.eq.${claim.member_id},provider_id.eq.${claim.provider_id}`)
        .gte('service_date', serviceDateStart.toISOString())
        .lte('service_date', serviceDateEnd.toISOString())
        .limit(20);

      if (relatedClaims && relatedClaims.length > 0) {
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
    const { count: totalCases } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*', { count: 'exact', head: true });

    const { count: openCases } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: closedCases } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed');

    // For groupBy, we'll fetch all and group in memory
    const { data: allCases } = await this.supabase
      .getClient()
      .from('fraud_cases')
      .select('entity_type, severity');

    const byEntityType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    (allCases || []).forEach((c: any) => {
      byEntityType[c.entity_type] = (byEntityType[c.entity_type] || 0) + 1;
      bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
    });

    return {
      total_cases: totalCases || 0,
      open_cases: openCases || 0,
      closed_cases: closedCases || 0,
      by_entity_type: byEntityType,
      by_severity: bySeverity,
    };
  }
}
