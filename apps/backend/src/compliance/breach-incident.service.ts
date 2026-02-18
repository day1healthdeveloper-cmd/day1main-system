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
    const count = await this.supabase.getClient().breachIncident.count();
    const incidentNumber = `BRH-${dateStr}-${String(count + 1).padStart(6, '0')}`;

    const incident = await this.supabase.getClient().breachIncident.create({
      data: {
        incident_number: incidentNumber,
        incident_type: dto.incidentType,
        severity: dto.severity,
        description: dto.description,
        affected_records: dto.affectedRecords,
        discovered_at: dto.discoveredAt,
        discovered_by: discoveredBy,
        status: 'open',
      },
    });

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
    const incident = await this.supabase.getClient().breachIncident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException('Breach incident not found');
    }

    return incident;
  }

  async getIncidentByNumber(incidentNumber: string) {
    const incident = await this.supabase.getClient().breachIncident.findUnique({
      where: { incident_number: incidentNumber },
    });

    if (!incident) {
      throw new NotFoundException('Breach incident not found');
    }

    return incident;
  }

  async getAllIncidents(status?: string) {
    return this.supabase.getClient().breachIncident.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        discovered_at: 'desc',
      },
    });
  }

  async getOpenIncidents() {
    return this.supabase.getClient().breachIncident.findMany({
      where: {
        status: 'open',
      },
      orderBy: {
        severity: 'desc',
      },
    });
  }

  async getCriticalIncidents() {
    return this.supabase.getClient().breachIncident.findMany({
      where: {
        severity: 'critical',
        status: {
          in: ['open', 'investigating'],
        },
      },
      orderBy: {
        discovered_at: 'desc',
      },
    });
  }

  async investigateBreach(dto: InvestigateBreachDto, investigatedBy: string) {
    const incident = await this.getIncidentById(dto.incidentId);

    if (incident.status === 'closed') {
      throw new BadRequestException('Cannot investigate a closed incident');
    }

    const updated = await this.supabase.getClient().breachIncident.update({
      where: { id: dto.incidentId },
      data: {
        status: 'investigating',
      },
    });

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

    const updated = await this.supabase.getClient().breachIncident.update({
      where: { id: dto.incidentId },
      data: {
        reported_to_regulator: true,
        reported_at: new Date(),
      },
    });

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

    const updated = await this.supabase.getClient().breachIncident.update({
      where: { id: dto.incidentId },
      data: {
        status: 'closed',
        resolution: dto.resolution,
        closed_at: new Date(),
      },
    });

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
        closed_at: updated.closed_at?.toISOString(),
        time_to_resolution_days: Math.floor(
          ((updated.closed_at?.getTime() || 0) - incident.discovered_at.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      },
    });

    return updated;
  }

  async getIncidentStatistics() {
    const total = await this.supabase.getClient().breachIncident.count();
    const open = await this.supabase.getClient().breachIncident.count({
      where: { status: 'open' },
    });
    const investigating = await this.supabase.getClient().breachIncident.count({
      where: { status: 'investigating' },
    });
    const closed = await this.supabase.getClient().breachIncident.count({
      where: { status: 'closed' },
    });
    const critical = await this.supabase.getClient().breachIncident.count({
      where: { severity: 'critical' },
    });
    const reportedToRegulator = await this.supabase.getClient().breachIncident.count({
      where: { reported_to_regulator: true },
    });

    // Calculate average time to resolution for closed incidents
    const closedIncidents = await this.supabase.getClient().breachIncident.findMany({
      where: { status: 'closed' },
      select: {
        discovered_at: true,
        closed_at: true,
      },
    });

    const avgResolutionDays =
      closedIncidents.length > 0
        ? closedIncidents.reduce((sum, incident) => {
            if (incident.closed_at) {
              const days = Math.floor(
                (incident.closed_at.getTime() - incident.discovered_at.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }
            return sum;
          }, 0) / closedIncidents.length
        : 0;

    return {
      total,
      open,
      investigating,
      closed,
      critical,
      reportedToRegulator,
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    };
  }

  async getIncidentsBySeverity(severity: string) {
    return this.supabase.getClient().breachIncident.findMany({
      where: { severity },
      orderBy: {
        discovered_at: 'desc',
      },
    });
  }

  async getUnreportedCriticalIncidents() {
    return this.supabase.getClient().breachIncident.findMany({
      where: {
        severity: 'critical',
        reported_to_regulator: false,
      },
      orderBy: {
        discovered_at: 'asc',
      },
    });
  }
}
