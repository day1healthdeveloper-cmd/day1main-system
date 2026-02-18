import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface CreateComplaintDto {
  complaint_type: 'claim_rejection' | 'service_quality' | 'billing' | 'access_to_care' | 'communication' | 'other';
  description: string;
  member_id?: string;
  policy_id?: string;
  claim_id?: string;
  provider_id?: string;
}

export interface ResolveComplaintDto {
  complaint_id: string;
  resolution: string;
  outcome: 'resolved' | 'partially_resolved' | 'not_resolved' | 'withdrawn';
  root_cause_tags: string[];
}

export interface OmbudExportPack {
  complaint_id: string;
  complaint_number: string;
  export_date: Date;
  complaint_details: any;
  timeline: any[];
  resolution: any;
  supporting_documents: string[];
}

@Injectable()
export class ComplaintsService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  // SLA timers by complaint type (in days)
  private readonly SLA_TIMERS = {
    claim_rejection: 20,
    service_quality: 30,
    billing: 15,
    access_to_care: 10,
    communication: 30,
    other: 30,
  };

  async createComplaint(dto: CreateComplaintDto, lodgedBy: string): Promise<any> {
    // Generate complaint number
    const complaintNumber = await this.generateComplaintNumber();

    // Calculate SLA due date
    const slaTimer = this.SLA_TIMERS[dto.complaint_type];
    const slaDueDate = new Date();
    slaDueDate.setDate(slaDueDate.getDate() + slaTimer);

    const complaint = await this.supabase.getClient().complaint.create({
      data: {
        complaint_number: complaintNumber,
        complaint_type: dto.complaint_type,
        description: dto.description,
        member_id: dto.member_id,
        status: 'open',
        sla_due_date: slaDueDate,
      },
    });

    await this.auditService.logEvent({
      event_type: 'complaint_created',
      user_id: lodgedBy,
      entity_type: 'complaint',
      entity_id: complaint.id,
      action: 'create',
      metadata: {
        complaint_number: complaintNumber,
        complaint_type: dto.complaint_type,
        sla_timer_days: slaTimer,
        sla_due_date: slaDueDate.toISOString(),
        policy_id: dto.policy_id,
        claim_id: dto.claim_id,
        provider_id: dto.provider_id,
      },
    });

    return complaint;
  }

  private async generateComplaintNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.supabase.getClient().complaint.count({
      where: {
        submitted_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `CMP-${dateStr}-${sequence}`;
  }

  async getComplaintById(complaintId: string): Promise<any> {
    const complaint = await this.supabase.getClient().complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async getComplaintByNumber(complaintNumber: string): Promise<any> {
    const complaint = await this.supabase.getClient().complaint.findUnique({
      where: { complaint_number: complaintNumber },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async getAllComplaints(status?: string): Promise<any[]> {
    return this.supabase.getClient().complaint.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        submitted_at: 'desc',
      },
    });
  }

  async getOverdueSLAComplaints(): Promise<any[]> {
    const now = new Date();

    const complaints = await this.supabase.getClient().complaint.findMany({
      where: {
        status: {
          in: ['open', 'investigating'],
        },
        sla_due_date: {
          lt: now,
        },
      },
      orderBy: {
        sla_due_date: 'asc',
      },
    });

    return complaints;
  }

  async getApproachingSLAComplaints(daysThreshold: number = 3): Promise<any[]> {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const complaints = await this.supabase.getClient().complaint.findMany({
      where: {
        status: {
          in: ['open', 'investigating'],
        },
        sla_due_date: {
          gte: now,
          lte: thresholdDate,
        },
      },
      orderBy: {
        sla_due_date: 'asc',
      },
    });

    return complaints;
  }

  async escalateComplaint(complaintId: string, escalatedBy: string, reason: string): Promise<any> {
    const complaint = await this.getComplaintById(complaintId);

    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      throw new BadRequestException('Cannot escalate a resolved or closed complaint');
    }

    // Store escalation in audit log since schema doesn't have escalated field
    await this.auditService.logEvent({
      event_type: 'complaint_escalated',
      user_id: escalatedBy,
      entity_type: 'complaint',
      entity_id: complaintId,
      action: 'update',
      metadata: {
        complaint_number: complaint.complaint_number,
        reason: reason,
        sla_overdue: new Date() > complaint.sla_due_date,
        days_overdue: Math.floor(
          (new Date().getTime() - complaint.sla_due_date.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    });

    return complaint;
  }

  async autoEscalateOverdueComplaints(userId: string = 'system'): Promise<number> {
    const overdueComplaints = await this.getOverdueSLAComplaints();
    
    // Check audit log to see which ones are already escalated
    for (const complaint of overdueComplaints) {
      const escalationEvents = await this.supabase.getClient().auditEvent.findMany({
        where: {
          entity_type: 'complaint',
          entity_id: complaint.id,
          event_type: 'complaint_escalated',
        },
      });

      if (escalationEvents.length === 0) {
        await this.escalateComplaint(
          complaint.id,
          userId,
          'Automatic escalation - SLA timer expired',
        );
      }
    }

    return overdueComplaints.length;
  }

  async assignComplaint(
    complaintId: string,
    assignedTo: string,
    assignedBy: string,
  ): Promise<any> {
    const complaint = await this.getComplaintById(complaintId);

    const updated = await this.supabase.getClient().complaint.update({
      where: { id: complaintId },
      data: {
        assigned_to: assignedTo,
        status: 'investigating',
      },
    });

    await this.auditService.logEvent({
      event_type: 'complaint_assigned',
      user_id: assignedBy,
      entity_type: 'complaint',
      entity_id: complaintId,
      action: 'update',
      metadata: {
        complaint_number: complaint.complaint_number,
        assigned_to: assignedTo,
        previous_status: complaint.status,
        new_status: 'investigating',
      },
    });

    return updated;
  }

  async resolveComplaint(dto: ResolveComplaintDto, resolvedBy: string): Promise<any> {
    const complaint = await this.getComplaintById(dto.complaint_id);

    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      throw new BadRequestException('Complaint is already resolved or closed');
    }

    const resolutionTime = Math.floor(
      (new Date().getTime() - complaint.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
    );

    const updated = await this.supabase.getClient().complaint.update({
      where: { id: dto.complaint_id },
      data: {
        status: 'resolved',
        resolution: dto.resolution,
        root_cause_tags: dto.root_cause_tags,
        resolved_at: new Date(),
      },
    });

    await this.auditService.logEvent({
      event_type: 'complaint_resolved',
      user_id: resolvedBy,
      entity_type: 'complaint',
      entity_id: dto.complaint_id,
      action: 'update',
      metadata: {
        complaint_number: complaint.complaint_number,
        outcome: dto.outcome,
        root_cause_tags: dto.root_cause_tags,
        resolution_time_days: resolutionTime,
        within_sla: new Date() <= complaint.sla_due_date,
      },
    });

    return updated;
  }

  async closeComplaint(complaintId: string, closedBy: string): Promise<any> {
    const complaint = await this.getComplaintById(complaintId);

    if (complaint.status !== 'resolved') {
      throw new BadRequestException('Complaint must be resolved before closing');
    }

    const updated = await this.supabase.getClient().complaint.update({
      where: { id: complaintId },
      data: {
        status: 'closed',
      },
    });

    await this.auditService.logEvent({
      event_type: 'complaint_closed',
      user_id: closedBy,
      entity_type: 'complaint',
      entity_id: complaintId,
      action: 'update',
      metadata: {
        complaint_number: complaint.complaint_number,
      },
    });

    return updated;
  }

  async generateOmbudExportPack(complaintId: string, userId: string): Promise<OmbudExportPack> {
    const complaint = await this.getComplaintById(complaintId);

    // Get audit trail for timeline
    const auditEvents = await this.supabase.getClient().auditEvent.findMany({
      where: {
        entity_type: 'complaint',
        entity_id: complaintId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const timeline = auditEvents.map((event) => ({
      date: event.timestamp,
      event_type: event.event_type,
      user_id: event.user_id,
      action: event.action,
      details: event.metadata,
    }));

    const exportPack: OmbudExportPack = {
      complaint_id: complaintId,
      complaint_number: complaint.complaint_number,
      export_date: new Date(),
      complaint_details: {
        type: complaint.complaint_type,
        description: complaint.description,
        submitted_at: complaint.submitted_at,
        member_id: complaint.member_id,
      },
      timeline,
      resolution: {
        status: complaint.status,
        resolution: complaint.resolution,
        resolved_at: complaint.resolved_at,
        root_cause_tags: complaint.root_cause_tags,
      },
      supporting_documents: [],
    };

    await this.auditService.logEvent({
      event_type: 'complaint_ombud_export_generated',
      user_id: userId,
      entity_type: 'complaint',
      entity_id: complaintId,
      action: 'export',
      metadata: {
        complaint_number: complaint.complaint_number,
        timeline_events: timeline.length,
      },
    });

    return exportPack;
  }

  async getComplaintStatistics(): Promise<{
    total: number;
    open: number;
    investigating: number;
    resolved: number;
    closed: number;
    escalated: number;
    overdue_sla: number;
    avg_resolution_days: number;
    by_type: Record<string, number>;
    sla_compliance_rate: number;
  }> {
    const total = await this.supabase.getClient().complaint.count();
    const open = await this.supabase.getClient().complaint.count({ where: { status: 'open' } });
    const investigating = await this.supabase.getClient().complaint.count({ where: { status: 'investigating' } });
    const resolved = await this.supabase.getClient().complaint.count({ where: { status: 'resolved' } });
    const closed = await this.supabase.getClient().complaint.count({ where: { status: 'closed' } });

    // Count escalated complaints from audit log
    const escalationEvents = await this.supabase.getClient().auditEvent.findMany({
      where: {
        entity_type: 'complaint',
        event_type: 'complaint_escalated',
      },
      select: {
        entity_id: true,
      },
      distinct: ['entity_id'],
    });
    const escalated = escalationEvents.length;

    const now = new Date();
    const overdueSla = await this.supabase.getClient().complaint.count({
      where: {
        status: {
          in: ['open', 'investigating'],
        },
        sla_due_date: {
          lt: now,
        },
      },
    });

    const resolvedComplaints = await this.supabase.getClient().complaint.findMany({
      where: {
        status: {
          in: ['resolved', 'closed'],
        },
      },
      select: {
        submitted_at: true,
        resolved_at: true,
        sla_due_date: true,
      },
    });

    const avgResolutionDays =
      resolvedComplaints.length > 0
        ? resolvedComplaints.reduce((sum, c) => {
            if (c.resolved_at) {
              const days = Math.floor(
                (c.resolved_at.getTime() - c.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }
            return sum;
          }, 0) / resolvedComplaints.length
        : 0;

    const withinSla = resolvedComplaints.filter(
      (c) => c.resolved_at && c.resolved_at <= c.sla_due_date,
    ).length;
    const slaComplianceRate =
      resolvedComplaints.length > 0 ? (withinSla / resolvedComplaints.length) * 100 : 0;

    const byType = await this.supabase.getClient().complaint.groupBy({
      by: ['complaint_type'],
      _count: true,
    });

    return {
      total,
      open,
      investigating,
      resolved,
      closed,
      escalated,
      overdue_sla: overdueSla,
      avg_resolution_days: Math.round(avgResolutionDays * 10) / 10,
      by_type: Object.fromEntries(byType.map((item) => [item.complaint_type, item._count])),
      sla_compliance_rate: Math.round(slaComplianceRate * 10) / 10,
    };
  }

  async getComplaintsByRootCause(rootCauseTag: string): Promise<any[]> {
    // Since root_cause_tags is JSON, we need to filter in application code
    const allComplaints = await this.supabase.getClient().complaint.findMany({
      where: {
        status: {
          in: ['resolved', 'closed'],
        },
      },
      orderBy: {
        resolved_at: 'desc',
      },
    });

    // Filter by root cause tag
    return allComplaints.filter((c) => {
      const tags = c.root_cause_tags as any;
      return Array.isArray(tags) && tags.includes(rootCauseTag);
    });
  }
}
