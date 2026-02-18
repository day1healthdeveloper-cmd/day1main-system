import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface RegisterBrokerDto {
  userId: string;
  licenseNumber: string;
  companyName?: string;
  contactNumber: string;
  commissionRate: number;
}

export interface CalculateCommissionDto {
  brokerId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface GenerateStatementDto {
  brokerId: string;
  periodStart: Date;
  periodEnd: Date;
}

@Injectable()
export class BrokerService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async registerBroker(dto: RegisterBrokerDto, registeredBy: string) {
    const { data: user, error: userError } = await this.supabase
      .getClient()
      .from('users')
      .select('*, profile:profiles(*)')
      .eq('id', dto.userId)
      .single();

    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    const { data: brokerRole, error: roleError } = await this.supabase
      .getClient()
      .from('roles')
      .select('*')
      .eq('name', 'broker')
      .single();

    if (roleError || !brokerRole) {
      throw new BadRequestException('Broker role not found in system');
    }

    const { data: existingBrokerRole } = await this.supabase
      .getClient()
      .from('user_roles')
      .select('*')
      .eq('user_id', dto.userId)
      .eq('role_id', brokerRole.id)
      .single();

    if (existingBrokerRole) {
      throw new BadRequestException('User is already registered as a broker');
    }

    await this.supabase
      .getClient()
      .from('user_roles')
      .insert({
        user_id: dto.userId,
        role_id: brokerRole.id,
        assigned_by: registeredBy,
      });

    await this.auditService.logEvent({
      event_type: 'broker_registered',
      user_id: registeredBy,
      entity_type: 'user',
      entity_id: dto.userId,
      action: 'create',
      metadata: {
        license_number: dto.licenseNumber,
        company_name: dto.companyName,
        contact_number: dto.contactNumber,
        commission_rate: dto.commissionRate,
      },
    });

    return {
      brokerId: dto.userId,
      email: user.email,
      name: user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : null,
      licenseNumber: dto.licenseNumber,
      companyName: dto.companyName,
      contactNumber: dto.contactNumber,
      commissionRate: dto.commissionRate,
    };
  }

  async getBrokerById(brokerId: string) {
    const { data: user, error } = await this.supabase
      .getClient()
      .from('users')
      .select(`
        *,
        profile:profiles(*),
        user_roles!user_roles_user_id_fkey(
          role:roles(*)
        )
      `)
      .eq('id', brokerId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Broker not found');
    }

    const isBroker = user.user_roles?.some((ur: any) => ur.role.name === 'broker');
    if (!isBroker) {
      throw new BadRequestException('User is not a broker');
    }

    return user;
  }

  async getPoliciesByBroker(brokerId: string) {
    await this.getBrokerById(brokerId);

    const { data, error } = await this.supabase
      .getClient()
      .from('policies')
      .select(`
        *,
        plan:plans(*,
          product:products(*)
        ),
        policy_members!policy_members_policy_id_fkey(
          member:members(*)
        )
      `)
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async calculateCommissions(dto: CalculateCommissionDto, calculatedBy: string) {
    await this.getBrokerById(dto.brokerId);

    const { data: policies, error } = await this.supabase
      .getClient()
      .from('policies')
      .select(`
        *,
        plan:plans(*,
          product:products(*)
        )
      `)
      .eq('broker_id', dto.brokerId)
      .gte('created_at', dto.periodStart.toISOString())
      .lte('created_at', dto.periodEnd.toISOString())
      .in('status', ['active', 'pending']);

    if (error) throw error;

    const commissions = [];

    for (const policy of policies || []) {
      const commissionRate = 0.10;
      const commissionAmount = parseFloat(policy.premium) * commissionRate;

      const { data: existing } = await this.supabase
        .getClient()
        .from('commissions')
        .select('*')
        .eq('broker_id', dto.brokerId)
        .eq('policy_id', policy.id)
        .eq('period_start', dto.periodStart.toISOString())
        .eq('period_end', dto.periodEnd.toISOString())
        .single();

      if (existing) continue;

      const { data: commission, error: commError } = await this.supabase
        .getClient()
        .from('commissions')
        .insert({
          broker_id: dto.brokerId,
          policy_id: policy.id,
          commission_type: 'new_business',
          amount: commissionAmount,
          period_start: dto.periodStart.toISOString(),
          period_end: dto.periodEnd.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (commError) throw commError;

      await this.auditService.logEvent({
        event_type: 'commission_calculated',
        user_id: calculatedBy,
        entity_type: 'commission',
        entity_id: commission.id,
        action: 'create',
        metadata: {
          broker_id: dto.brokerId,
          policy_id: policy.id,
          policy_number: policy.policy_number,
          premium: parseFloat(policy.premium),
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
        },
      });

      commissions.push(commission);
    }

    return commissions;
  }

  async getCommissionsByBroker(brokerId: string, status?: string) {
    await this.getBrokerById(brokerId);

    let query = this.supabase
      .getClient()
      .from('commissions')
      .select('*')
      .eq('broker_id', brokerId)
      .order('calculated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async markCommissionAsPaid(commissionId: string, paidBy: string) {
    const { data: commission, error } = await this.supabase
      .getClient()
      .from('commissions')
      .select('*')
      .eq('id', commissionId)
      .single();

    if (error || !commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status === 'paid') {
      throw new BadRequestException('Commission already marked as paid');
    }

    const { data: updated, error: updateError } = await this.supabase
      .getClient()
      .from('commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', commissionId)
      .select()
      .single();

    if (updateError) throw updateError;

    await this.auditService.logEvent({
      event_type: 'commission_paid',
      user_id: paidBy,
      entity_type: 'commission',
      entity_id: commissionId,
      action: 'update',
      metadata: {
        broker_id: commission.broker_id,
        amount: parseFloat(commission.amount),
        paid_at: updated.paid_at,
      },
    });

    return updated;
  }

  async generateCommissionStatement(dto: GenerateStatementDto, generatedBy: string) {
    await this.getBrokerById(dto.brokerId);

    const { data: commissions, error } = await this.supabase
      .getClient()
      .from('commissions')
      .select('*')
      .eq('broker_id', dto.brokerId)
      .gte('period_start', dto.periodStart.toISOString())
      .lte('period_end', dto.periodEnd.toISOString());

    if (error) throw error;

    if (!commissions || commissions.length === 0) {
      throw new BadRequestException('No commissions found for this period');
    }

    const commissionsWithPolicies = await Promise.all(
      commissions.map(async (commission) => {
        if (!commission.policy_id) {
          return { ...commission, policy: null };
        }
        const { data: policy } = await this.supabase
          .getClient()
          .from('policies')
          .select(`
            *,
            plan:plans(*,
              product:products(*)
            ),
            policy_members!policy_members_policy_id_fkey(
              member:members(*)
            )
          `)
          .eq('id', commission.policy_id)
          .single();
        return { ...commission, policy };
      }),
    );

    const totalCommission = commissions.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0,
    );

    const { count } = await this.supabase
      .getClient()
      .from('commission_statements')
      .select('*', { count: 'exact', head: true });

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const statementNumber = `CS-${dateStr}-${String((count || 0) + 1).padStart(6, '0')}`;

    const { data: statement, error: stmtError } = await this.supabase
      .getClient()
      .from('commission_statements')
      .insert({
        broker_id: dto.brokerId,
        statement_number: statementNumber,
        period_start: dto.periodStart.toISOString(),
        period_end: dto.periodEnd.toISOString(),
        total_commission: totalCommission,
      })
      .select()
      .single();

    if (stmtError) throw stmtError;

    await this.auditService.logEvent({
      event_type: 'commission_statement_generated',
      user_id: generatedBy,
      entity_type: 'commission_statement',
      entity_id: statement.id,
      action: 'create',
      metadata: {
        broker_id: dto.brokerId,
        statement_number: statementNumber,
        period_start: dto.periodStart.toISOString(),
        period_end: dto.periodEnd.toISOString(),
        total_commission: totalCommission,
        commission_count: commissions.length,
      },
    });

    return {
      statement,
      commissions: commissionsWithPolicies,
      summary: {
        totalCommission,
        commissionCount: commissions.length,
        policyCount: new Set(commissions.map(c => c.policy_id).filter(Boolean)).size,
      },
    };
  }

  async getStatementById(statementId: string) {
    const { data: statement, error } = await this.supabase
      .getClient()
      .from('commission_statements')
      .select('*')
      .eq('id', statementId)
      .single();

    if (error || !statement) {
      throw new NotFoundException('Commission statement not found');
    }

    return statement;
  }

  async getStatementsByBroker(brokerId: string) {
    await this.getBrokerById(brokerId);

    const { data, error } = await this.supabase
      .getClient()
      .from('commission_statements')
      .select('*')
      .eq('broker_id', brokerId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAllBrokers() {
    const { data: brokerRole, error: roleError } = await this.supabase
      .getClient()
      .from('roles')
      .select('*')
      .eq('name', 'broker')
      .single();

    if (roleError || !brokerRole) {
      return [];
    }

    const { data: userRoles, error } = await this.supabase
      .getClient()
      .from('user_roles')
      .select(`
        user:users(*,
          profile:profiles(*)
        )
      `)
      .eq('role_id', brokerRole.id);

    if (error) throw error;
    return userRoles?.map((ur: any) => ur.user) || [];
  }

  async getBrokerStatistics(brokerId: string) {
    await this.getBrokerById(brokerId);

    const { data: policies, error: polError } = await this.supabase
      .getClient()
      .from('policies')
      .select('*')
      .eq('broker_id', brokerId);

    if (polError) throw polError;

    const { data: commissions, error: commError } = await this.supabase
      .getClient()
      .from('commissions')
      .select('*')
      .eq('broker_id', brokerId);

    if (commError) throw commError;

    const totalCommissionEarned = (commissions || [])
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    const totalCommissionPending = (commissions || [])
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return {
      totalPolicies: policies?.length || 0,
      activePolicies: policies?.filter(p => p.status === 'active').length || 0,
      totalCommissions: commissions?.length || 0,
      totalCommissionEarned,
      totalCommissionPending,
    };
  }
}
