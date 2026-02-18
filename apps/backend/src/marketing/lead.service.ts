import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

/**
 * Lead Management Service
 * 
 * Handles lead capture, assignment, and conversion tracking
 * Requirements: 21.5, 21.6
 */
@Injectable()
export class LeadService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  /**
   * Capture a new lead from various sources
   * Requirements: 21.5
   */
  async captureLead(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    sourceId?: string;
    userId?: string;
  }) {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        source_id: data.sourceId,
        status: 'new',
        assigned_to: null,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to capture lead');

    await this.auditService.logEvent({
      event_type: 'lead_captured',
      action: 'lead.capture',
      user_id: data.userId || 'system',
      entity_type: 'lead',
      entity_id: lead.id,
      metadata: {
        email: data.email,
        sourceId: data.sourceId,
      },
    });

    return lead;
  }

  /**
   * Assign lead to a user
   * Requirements: 21.5
   */
  async assignLead(leadId: string, assignedTo: string, assignedBy: string) {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      throw new NotFoundException('Lead not found');
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('leads')
      .update({
        assigned_to: assignedTo,
        status: 'assigned',
      })
      .eq('id', leadId)
      .select()
      .single();

    if (updateError) throw new Error('Failed to assign lead');

    await this.auditService.logEvent({
      event_type: 'lead_assigned',
      action: 'lead.assign',
      user_id: assignedBy,
      entity_type: 'lead',
      entity_id: leadId,
      metadata: {
        assignedTo,
        previousStatus: lead.status,
      },
    });

    return updated;
  }

  /**
   * Track lead conversion to policy
   * Requirements: 21.6
   */
  async convertLead(leadId: string, policyId: string, userId: string) {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      throw new NotFoundException('Lead not found');
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('leads')
      .update({
        status: 'converted',
        converted_policy_id: policyId,
      })
      .eq('id', leadId)
      .select()
      .single();

    if (updateError) throw new Error('Failed to convert lead');

    await this.auditService.logEvent({
      event_type: 'lead_converted',
      action: 'lead.convert',
      user_id: userId,
      entity_type: 'lead',
      entity_id: leadId,
      metadata: {
        policyId,
        source_id: lead.source_id,
        createdAt: lead.created_at,
      },
    });

    return updated;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId: string, status: string, userId?: string) {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      throw new NotFoundException('Lead not found');
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();

    if (updateError) throw new Error('Failed to update lead status');

    await this.auditService.logEvent({
      event_type: 'lead_status_updated',
      action: 'lead.update_status',
      user_id: userId || 'system',
      entity_type: 'lead',
      entity_id: leadId,
      metadata: {
        previousStatus: lead.status,
        newStatus: status,
      },
    });

    return updated;
  }

  /**
   * Get lead by ID
   */
  async getLeadById(leadId: string) {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get lead by email
   */
  async getLeadByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get leads by status
   */
  async getLeadsByStatus(status: string) {
    const { data } = await this.supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get leads assigned to a user
   */
  async getLeadsAssignedTo(userId: string) {
    const { data } = await this.supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get leads by source
   */
  async getLeadsBySource(sourceId: string) {
    const { data } = await this.supabase
      .from('leads')
      .select('*')
      .eq('source_id', sourceId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get lead conversion statistics
   * Requirements: 21.6
   */
  async getConversionStatistics(startDate?: Date, endDate?: Date) {
    let query = this.supabase.from('leads').select('*', { count: 'exact' });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { count: totalLeads } = await query;

    let convertedQuery = this.supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('status', 'converted');

    if (startDate) {
      convertedQuery = convertedQuery.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      convertedQuery = convertedQuery.lte('created_at', endDate.toISOString());
    }

    const { count: convertedLeads } = await convertedQuery;

    const conversionRate = (totalLeads || 0) > 0 
      ? ((convertedLeads || 0) / (totalLeads || 1)) * 100 
      : 0;

    return {
      totalLeads: totalLeads || 0,
      convertedLeads: convertedLeads || 0,
      conversionRate,
    };
  }
}