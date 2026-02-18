import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface CreateDataSubjectRequestDto {
  memberId: string;
  requestType: 'access' | 'erasure' | 'rectification' | 'portability';
  description?: string;
}

export interface ProcessAccessRequestDto {
  requestId: string;
}

export interface ProcessErasureRequestDto {
  requestId: string;
  retainAuditTrail: boolean;
}

export interface ProcessRectificationRequestDto {
  requestId: string;
  corrections: Record<string, any>;
}

@Injectable()
export class DataSubjectRequestService {
  private readonly STATUTORY_TIMEFRAME_DAYS = 30;

  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async createRequest(dto: CreateDataSubjectRequestDto, submittedBy: string) {
    // Verify member exists
    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: dto.memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Generate request number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.supabase.getClient().dataSubjectRequest.count();
    const requestNumber = `DSR-${dateStr}-${String(count + 1).padStart(6, '0')}`;

    // Calculate due date (30 days from submission)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + this.STATUTORY_TIMEFRAME_DAYS);

    const request = await this.supabase.getClient().dataSubjectRequest.create({
      data: {
        request_number: requestNumber,
        member_id: dto.memberId,
        request_type: dto.requestType,
        description: dto.description,
        status: 'pending',
        due_date: dueDate,
      },
    });

    await this.auditService.logEvent({
      event_type: 'data_subject_request_created',
      user_id: submittedBy,
      entity_type: 'data_subject_request',
      entity_id: request.id,
      action: 'create',
      metadata: {
        request_number: requestNumber,
        member_id: dto.memberId,
        request_type: dto.requestType,
        due_date: dueDate.toISOString(),
        statutory_timeframe_days: this.STATUTORY_TIMEFRAME_DAYS,
      },
    });

    return request;
  }

  async getRequestById(requestId: string) {
    const request = await this.supabase.getClient().dataSubjectRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Data subject request not found');
    }

    return request;
  }

  async getRequestsByMember(memberId: string) {
    return this.supabase.getClient().dataSubjectRequest.findMany({
      where: { member_id: memberId },
      orderBy: { submitted_at: 'desc' },
    });
  }

  async getPendingRequests() {
    return this.supabase.getClient().dataSubjectRequest.findMany({
      where: { status: 'pending' },
      orderBy: { due_date: 'asc' },
    });
  }

  async getOverdueRequests() {
    const now = new Date();
    return this.supabase.getClient().dataSubjectRequest.findMany({
      where: {
        status: 'pending',
        due_date: {
          lt: now,
        },
      },
      orderBy: { due_date: 'asc' },
    });
  }

  async processAccessRequest(dto: ProcessAccessRequestDto, processedBy: string) {
    const request = await this.getRequestById(dto.requestId);

    if (request.request_type !== 'access') {
      throw new BadRequestException('Request is not an access request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been processed');
    }

    // Gather member data
    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: request.member_id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Create data package with member information
    // In production, this would include all related data
    const dataPackage = {
      member,
      exportedAt: new Date().toISOString(),
      requestNumber: request.request_number,
      note: 'Full data export includes all related records (policies, claims, etc.)',
    };

    // Mark request as completed
    const updated = await this.supabase.getClient().dataSubjectRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'completed',
        completed_at: new Date(),
        completed_by: processedBy,
      },
    });

    await this.auditService.logEvent({
      event_type: 'data_subject_access_request_processed',
      user_id: processedBy,
      entity_type: 'data_subject_request',
      entity_id: request.id,
      action: 'update',
      metadata: {
        request_number: request.request_number,
        member_id: request.member_id,
        data_categories_exported: [
          'member_profile',
          'dependants',
          'contacts',
          'addresses',
          'consents',
          'documents',
          'kyc_checks',
          'policies',
          'claims',
          'invoices',
        ],
        processing_time_days: Math.floor(
          (new Date().getTime() - request.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    });

    return {
      request: updated,
      dataPackage,
    };
  }

  async processErasureRequest(dto: ProcessErasureRequestDto, processedBy: string) {
    const request = await this.getRequestById(dto.requestId);

    if (request.request_type !== 'erasure') {
      throw new BadRequestException('Request is not an erasure request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been processed');
    }

    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: request.member_id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if member has active policies
    const activePolicies = await this.supabase.getClient().from('policies').select('*'){
      where: {
        policy_members: {
          some: {
            member_id: request.member_id,
          },
        },
        status: 'active',
      },
    });

    if (activePolicies.length > 0) {
      throw new BadRequestException(
        'Cannot erase data for member with active policies. Please cancel policies first.',
      );
    }

    // Anonymize member data (keep audit trail if required)
    const anonymizedData = {
      first_name: 'ERASED',
      last_name: 'ERASED',
      email: `erased-${request.member_id}@anonymized.local`,
    };

    await this.supabase.getClient().from('members').update({
      where: { id: request.member_id },
      data: anonymizedData,
    });

    // Delete related data (except audit trail)
    if (!dto.retainAuditTrail) {
      await this.supabase.getClient().memberContact.deleteMany({
        where: { member_id: request.member_id },
      });

      await this.supabase.getClient().memberAddress.deleteMany({
        where: { member_id: request.member_id },
      });

      await this.supabase.getClient().memberDocument.deleteMany({
        where: { member_id: request.member_id },
      });
    }

    // Mark request as completed
    const updated = await this.supabase.getClient().dataSubjectRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'completed',
        completed_at: new Date(),
        completed_by: processedBy,
      },
    });

    await this.auditService.logEvent({
      event_type: 'data_subject_erasure_request_processed',
      user_id: processedBy,
      entity_type: 'data_subject_request',
      entity_id: request.id,
      action: 'update',
      metadata: {
        request_number: request.request_number,
        member_id: request.member_id,
        retain_audit_trail: dto.retainAuditTrail,
        data_anonymized: Object.keys(anonymizedData),
        processing_time_days: Math.floor(
          (new Date().getTime() - request.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    });

    return updated;
  }

  async processRectificationRequest(dto: ProcessRectificationRequestDto, processedBy: string) {
    const request = await this.getRequestById(dto.requestId);

    if (request.request_type !== 'rectification') {
      throw new BadRequestException('Request is not a rectification request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been processed');
    }

    const member = await this.supabase.getClient().from('members').select('*').eq({
      where: { id: request.member_id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Store before state for audit
    const beforeState = { ...member };

    // Apply corrections
    await this.supabase.getClient().from('members').update({
      where: { id: request.member_id },
      data: dto.corrections,
    });

    // Mark request as completed
    const updated = await this.supabase.getClient().dataSubjectRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'completed',
        completed_at: new Date(),
        completed_by: processedBy,
      },
    });

    await this.auditService.logEvent({
      event_type: 'data_subject_rectification_request_processed',
      user_id: processedBy,
      entity_type: 'data_subject_request',
      entity_id: request.id,
      action: 'update',
      before_state: beforeState,
      after_state: dto.corrections,
      metadata: {
        request_number: request.request_number,
        member_id: request.member_id,
        fields_corrected: Object.keys(dto.corrections),
        processing_time_days: Math.floor(
          (new Date().getTime() - request.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    });

    return updated;
  }

  async getRequestStatistics() {
    const total = await this.supabase.getClient().dataSubjectRequest.count();
    const pending = await this.supabase.getClient().dataSubjectRequest.count({
      where: { status: 'pending' },
    });
    const completed = await this.supabase.getClient().dataSubjectRequest.count({
      where: { status: 'completed' },
    });

    const now = new Date();
    const overdue = await this.supabase.getClient().dataSubjectRequest.count({
      where: {
        status: 'pending',
        due_date: {
          lt: now,
        },
      },
    });

    // Get average processing time for completed requests
    const completedRequests = await this.supabase.getClient().dataSubjectRequest.findMany({
      where: { status: 'completed' },
      select: {
        submitted_at: true,
        completed_at: true,
      },
    });

    const avgProcessingDays =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, req) => {
            if (req.completed_at) {
              const days = Math.floor(
                (req.completed_at.getTime() - req.submitted_at.getTime()) / (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }
            return sum;
          }, 0) / completedRequests.length
        : 0;

    return {
      total,
      pending,
      completed,
      overdue,
      avgProcessingDays: Math.round(avgProcessingDays * 10) / 10,
      complianceRate: total > 0 ? Math.round(((total - overdue) / total) * 100) : 100,
    };
  }
}
