import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface CreateBreachIncidentDto {
  incidentType: 'unauthorized_access' | 'data_loss' | 'data_theft' | 'accidental_disclosure' | 'system_breach' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords?: number;
  discoveredAt: Date;
}

export interface InvestigateBreachDto {
  incidentId: string;
  findings: string;
}

export interface ReportToRegulatorDto {
  incidentId: string;
  regulatorNotificationDetails: string;
}

export interface CloseBreachDto {
  incidentId: string;
  resolution: string;
}

@Injectable()
export class BreachIncidentService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async createIncident(dto: CreateBreachIncidentDto, discoveredBy: string) {
    // Generate incident number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true });
    const incidentNumber = `BRH-${dateStr}-${String((count || 0) + 1).padStart(6, '0')}`;

    const { data: incident, error } = await this.supabase.getClient().from('breach_incidents').insert({
      incident_number: incidentNumber,
      incident_type: dto.incidentType,
      severity: dto.severity,
      description: dto.description,
      affected_records: dto.affectedRecords,
      discovered_at: dto.discoveredAt,
      discovered_by: discoveredBy,
      status: 'open',
    }).select().single();

    await this.auditService.logEvent({
      event_type: 'breach_incident_created',
      user_id: discoveredBy,
      entity_type: 'breach_incident',
      entity_id: incident.id,
      action: 'create',
      metadata: {
        incident_number: incidentNumber,
        incident_type: dto.incidentType,
        severity: dto.severity,
        affected_records: dto.affectedRecords,
        discovered_at: dto.discoveredAt.toISOString(),
      },
    });

    // Auto-escalate critical breaches
    if (dto.severity === 'critical') {
      await this.auditService.logEvent({
        event_type: 'breach_incident_escalated',
        user_id: 'system',
        entity_type: 'breach_incident',
        entity_id: incident.id,
        action: 'update',
        metadata: {
          incident_number: incidentNumber,
          reason: 'Critical severity - automatic escalation',
        },
      });
    }

    return incident;
  }

  async getIncidentById(incidentId: string) {
    const { data: incident, error } = await this.supabase.getClient().from('breach_incidents').select('*').eq('id', incidentId).single();

    if (!incident) {
      throw new NotFoundException('Breach incident not found');
    }

    return incident;
  }

  async getIncidentByNumber(incidentNumber: string) {
    const { data: incident, error } = await this.supabase.getClient().from('breach_incidents').select('*').eq('incident_number', incidentNumber).single();

    if (!incident) {
      throw new NotFoundException('Breach incident not found');
    }

    return incident;
  }

  async getAllIncidents(status?: string) {
    let query = this.supabase.getClient().from('breach_incidents').select('*').order('discovered_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data } = await query;
    return data || [];
  }

  async getOpenIncidents() {
    const { data } = await this.supabase.getClient().from('breach_incidents').select('*').eq('status', 'open').order('severity', { ascending: false });
    return data || [];
  }

  async getCriticalIncidents() {
    const { data } = await this.supabase.getClient().from('breach_incidents').select('*').eq('severity', 'critical').in('status', ['open', 'investigating']).order('discovered_at', { ascending: false });
    return data || [];
  }

  async investigateBreach(dto: InvestigateBreachDto, investigatedBy: string) {
    const incident = await this.getIncidentById(dto.incidentId);

    if (incident.status === 'closed') {
      throw new BadRequestException('Cannot investigate a closed incident');
    }

    const { data: updated, error: updateError } = await this.supabase.getClient().from('breach_incidents').update({
      status: 'investigating',
    }).eq('id', dto.incidentId).select().single();

    await this.auditService.logEvent({
      event_type: 'breach_incident_investigation_started',
      user_id: investigatedBy,
      entity_type: 'breach_incident',
      entity_id: incident.id,
      action: 'update',
      metadata: {
        incident_number: incident.incident_number,
        findings: dto.findings,
        previous_status: incident.status,
        new_status: 'investigating',
      },
    });

    return updated;
  }

  async reportToRegulator(dto: ReportToRegulatorDto, reportedBy: string) {
    const incident = await this.getIncidentById(dto.incidentId);

    if (incident.reported_to_regulator) {
      throw new BadRequestException('Incident already reported to regulator');
    }

    const { data: updated, error: updateError } = await this.supabase.getClient().from('breach_incidents').update({
      reported_to_regulator: true,
      reported_at: new Date().toISOString(),
    }).eq('id', dto.incidentId).select().single();

    await this.auditService.logEvent({
      event_type: 'breach_incident_reported_to_regulator',
      user_id: reportedBy,
      entity_type: 'breach_incident',
      entity_id: incident.id,
      action: 'update',
      metadata: {
        incident_number: incident.incident_number,
        incident_type: incident.incident_type,
        severity: incident.severity,
        affected_records: incident.affected_records,
        notification_details: dto.regulatorNotificationDetails,
        reported_at: updated.reported_at?.toISOString(),
      },
    });

    return updated;
  }

  async closeBreach(dto: CloseBreachDto, closedBy: string) {
    const incident = await this.getIncidentById(dto.incidentId);

    if (incident.status === 'closed') {
      throw new BadRequestException('Incident is already closed');
    }

    const { data: updated, error } = await this.supabase.getClient()
      .from('breach_incidents')
      .update({
        status: 'closed',
        resolution: dto.resolution,
        closed_at: new Date().toISOString(),
      })
      .eq('id', dto.incidentId)
      .select()
      .single();

    await this.auditService.logEvent({
      event_type: 'breach_incident_closed',
      user_id: closedBy,
      entity_type: 'breach_incident',
      entity_id: incident.id,
      action: 'update',
      metadata: {
        incident_number: incident.incident_number,
        resolution: dto.resolution,
        previous_status: incident.status,
        closed_at: updated.closed_at,
        time_to_resolution_days: Math.floor(
          (new Date(updated.closed_at).getTime() - new Date(incident.discovered_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      },
    });

    return updated;
  }

  async getIncidentStatistics() {
    const { count: total } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true });
    const { count: open } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true }).eq('status', 'open');
    const { count: investigating } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true }).eq('status', 'investigating');
    const { count: closed } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true }).eq('status', 'closed');
    const { count: critical } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true }).eq('severity', 'critical');
    const { count: reportedToRegulator } = await this.supabase.getClient().from('breach_incidents').select('*', { count: 'exact', head: true }).eq('reported_to_regulator', true);

    // Calculate average time to resolution for closed incidents
    const { data: closedIncidents } = await this.supabase.getClient().from('breach_incidents').select('discovered_at, closed_at').eq('status', 'closed');

    const avgResolutionDays =
      (closedIncidents || []).length > 0
        ? (closedIncidents || []).reduce((sum: number, incident: any) => {
            if (incident.closed_at) {
              const days = Math.floor(
                (new Date(incident.closed_at).getTime() - new Date(incident.discovered_at).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }
            return sum;
          }, 0) / (closedIncidents || []).length
        : 0;

    return {
      total: total || 0,
      open: open || 0,
      investigating: investigating || 0,
      closed: closed || 0,
      critical: critical || 0,
      reportedToRegulator: reportedToRegulator || 0,
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    };
  }

  async getIncidentsBySeverity(severity: string) {
    const { data } = await this.supabase.getClient().from('breach_incidents').select('*').eq('severity', severity).order('discovered_at', { ascending: false });
    return data || [];
  }

  async getUnreportedCriticalIncidents() {
    const { data } = await this.supabase.getClient().from('breach_incidents').select('*').eq('severity', 'critical').eq('reported_to_regulator', false).order('discovered_at', { ascending: false });
    return data || [];
  }
}
