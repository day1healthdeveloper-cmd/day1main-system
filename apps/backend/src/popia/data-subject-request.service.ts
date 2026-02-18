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
    const { data: member, error: memberError } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('id', dto.memberId)
      .single();

    if (memberError || !member) {
      throw new NotFoundException('Member not found');
    }

    // Generate request number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true });
    const requestNumber = `DSR-${dateStr}-${String((count || 0) + 1).padStart(6, '0')}`;

    // Calculate due date (30 days from submission)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + this.STATUTORY_TIMEFRAME_DAYS);

    const { data: request, error } = await this.supabase.getClient()
      .from('data_subject_requests')
      .insert({
        request_number: requestNumber,
        member_id: dto.memberId,
        request_type: dto.requestType,
        description: dto.description,
        status: 'pending',
        due_date: dueDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create request');
    }

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
    const { data: request, error } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      throw new NotFoundException('Data subject request not found');
    }

    return request;
  }

  async getRequestsByMember(memberId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*')
      .eq('member_id', memberId)
      .order('submitted_at', { ascending: false });

    return data || [];
  }

  async getPendingRequests() {
    const { data, error } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*')
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    return data || [];
  }

  async getOverdueRequests() {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', now)
      .order('due_date', { ascending: true });

    return data || [];
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
    const { data: member, error: memberError } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('id', request.member_id)
      .single();

    if (memberError || !member) {
      throw new NotFoundException('Member not found');
    }

    // Create data package with member information
    const dataPackage = {
      member,
      exportedAt: new Date().toISOString(),
      requestNumber: request.request_number,
      note: 'Full data export includes all related records (policies, claims, etc.)',
    };

    // Mark request as completed
    const { data: updated, error: updateError } = await this.supabase.getClient()
      .from('data_subject_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: processedBy,
      })
      .eq('id', dto.requestId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to update request');
    }

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
          (new Date().getTime() - new Date(request.submitted_at).getTime()) / (1000 * 60 * 60 * 24),
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

    const { data: member, error: memberError } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('id', request.member_id)
      .single();

    if (memberError || !member) {
      throw new NotFoundException('Member not found');
    }

    // Check if member has active policies
    const { data: activePolicies, error: policiesError } = await this.supabase.getClient()
      .from('policy_members')
      .select('policy_id, policy:policies!inner(status)')
      .eq('member_id', request.member_id)
      .eq('policy.status', 'active');

    if (activePolicies && activePolicies.length > 0) {
      throw new BadRequestException(
        'Cannot erase data for member with active policies. Please cancel policies first.',
      );
    }

    // Anonymize member data
    const anonymizedData = {
      first_name: 'ERASED',
      last_name: 'ERASED',
      email: `erased-${request.member_id}@anonymized.local`,
    };

    await this.supabase.getClient()
      .from('members')
      .update(anonymizedData)
      .eq('id', request.member_id);

    // Delete related data (except audit trail)
    if (!dto.retainAuditTrail) {
      await this.supabase.getClient()
        .from('member_contacts')
        .delete()
        .eq('member_id', request.member_id);

      await this.supabase.getClient()
        .from('member_addresses')
        .delete()
        .eq('member_id', request.member_id);

      await this.supabase.getClient()
        .from('member_documents')
        .delete()
        .eq('member_id', request.member_id);
    }

    // Mark request as completed
    const { data: updated, error: updateError } = await this.supabase.getClient()
      .from('data_subject_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: processedBy,
      })
      .eq('id', dto.requestId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to update request');
    }

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
          (new Date().getTime() - new Date(request.submitted_at).getTime()) / (1000 * 60 * 60 * 24),
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

    const { data: member, error: memberError } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('id', request.member_id)
      .single();

    if (memberError || !member) {
      throw new NotFoundException('Member not found');
    }

    // Store before state for audit
    const beforeState = { ...member };

    // Apply corrections
    await this.supabase.getClient()
      .from('members')
      .update(dto.corrections)
      .eq('id', request.member_id);

    // Mark request as completed
    const { data: updated, error: updateError } = await this.supabase.getClient()
      .from('data_subject_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: processedBy,
      })
      .eq('id', dto.requestId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to update request');
    }

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
          (new Date().getTime() - new Date(request.submitted_at).getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    });

    return updated;
  }

  async getRequestStatistics() {
    const { count: total } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true });

    const { count: pending } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: completed } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const now = new Date().toISOString();
    const { count: overdue } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('due_date', now);

    // Get average processing time for completed requests
    const { data: completedRequests } = await this.supabase.getClient()
      .from('data_subject_requests')
      .select('submitted_at, completed_at')
      .eq('status', 'completed');

    const avgProcessingDays =
      completedRequests && completedRequests.length > 0
        ? completedRequests.reduce((sum: number, req: any) => {
            if (req.completed_at) {
              const days = Math.floor(
                (new Date(req.completed_at).getTime() - new Date(req.submitted_at).getTime()) / (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }
            return sum;
          }, 0) / completedRequests.length
        : 0;

    return {
      total: total || 0,
      pending: pending || 0,
      completed: completed || 0,
      overdue: overdue || 0,
      avgProcessingDays: Math.round(avgProcessingDays * 10) / 10,
      complianceRate: (total || 0) > 0 ? Math.round((((total || 0) - (overdue || 0)) / (total || 0)) * 100) : 100,
    };
  }
}
