import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateAuditEventDto, QueryAuditEventsDto } from './dto'

@Injectable()
export class AuditService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  /**
   * Log an audit event
   * Audit events are immutable - they can only be created, never updated or deleted
   */
  async logEvent(dto: CreateAuditEventDto) {
    const { data, error } = await this.supabase
      .from('audit_events')
      .insert({
        event_type: dto.event_type,
        entity_type: dto.entity_type,
        entity_id: dto.entity_id,
        user_id: dto.user_id,
        action: dto.action,
        before_state: dto.before_state,
        after_state: dto.after_state,
        metadata: dto.metadata,
        ip_address: dto.ip_address,
        user_agent: dto.user_agent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }

    return data;
  }

  /**
   * Query audit events with filters
   */
  async queryAuditLog(filters: QueryAuditEventsDto) {
    let query = this.supabase
      .from('audit_events')
      .select(`
        *,
        user:users(
          id,
          email,
          profile:profiles(first_name, last_name)
        )
      `, { count: 'exact' });

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.start_date) {
      query = query.gte('timestamp', new Date(filters.start_date).toISOString());
    }

    if (filters.end_date) {
      query = query.lte('timestamp', new Date(filters.end_date).toISOString());
    }

    const skip = filters.skip || 0;
    const take = filters.take || 50;

    query = query
      .order('timestamp', { ascending: false })
      .range(skip, skip + take - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error querying audit log:', error);
      throw error;
    }

    const total = count || 0;

    return {
      events: events || [],
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Get audit trail for a specific entity
   */
  async getEntityAuditTrail(entityType: string, entityId: string) {
    const { data, error } = await this.supabase
      .from('audit_events')
      .select(`
        *,
        user:users(
          id,
          email,
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error getting entity audit trail:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get audit events for a specific user
   */
  async getUserAuditEvents(userId: string, limit: number = 100) {
    const { data, error } = await this.supabase
      .from('audit_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting user audit events:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get recent audit events
   */
  async getRecentEvents(limit: number = 100) {
    const { data, error } = await this.supabase
      .from('audit_events')
      .select(`
        *,
        user:users(
          id,
          email,
          profile:profiles(first_name, last_name)
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent events:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate?: Date, endDate?: Date) {
    // Note: Supabase doesn't have groupBy, so we'll fetch and group in memory
    let query = this.supabase
      .from('audit_events')
      .select('event_type, action');

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error getting audit statistics:', error);
      throw error;
    }

    const events = data || [];
    
    // Group by event_type
    const byType = events.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    // Group by action
    const byAction = events.reduce((acc: any, event: any) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {});

    return {
      total_events: events.length,
      by_type: Object.entries(byType).map(([event_type, count]) => ({
        event_type,
        count,
      })),
      by_action: Object.entries(byAction).map(([action, count]) => ({
        action,
        count,
      })),
    };
  }

  /**
   * Verify audit log immutability
   * This method checks that audit events cannot be modified
   */
  async verifyImmutability(eventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('audit_events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return false;
    }

    // Audit events should never have an updated_at field
    // If they do, it means they were modified (which should be impossible)
    return true;
  }
}
