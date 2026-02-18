import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

export interface RegisterBrokerDto {
  userId: string;
  licenseNumber: string;
  companyName?: string;
  contactNumber: string;
  commissionRate: number; // percentage (e.g., 10 for 10%)
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
    // Verify user exists
    const user = await this.supabase.getClient().user.findUnique({
      where: { id: dto.userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has broker role
    const brokerRole = await this.supabase.getClient().role.findUnique({
      where: { name: 'broker' },
    });

    if (!brokerRole) {
      throw new BadRequestException('Broker role not found in system');
    }

    const existingBrokerRole = await this.supabase.getClient().userRole.findFirst({
      where: {
        user_id: dto.userId,
        role_id: brokerRole.id,
      },
    });

    if (existingBrokerRole) {
      throw new BadRequestException('User is already registered as a broker');
    }

    // Assign broker role
    await this.supabase.getClient().userRole.create({
      data: {
        user_id: dto.userId,
        role_id: brokerRole.id,
        assigned_by: registeredBy,
      },
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
    const user = await this.supabase.getClient().user.findUnique({
      where: { id: brokerId },
      include: {
        profile: true,
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Broker not found');
    }

    const isBroker = user.user_roles.some(ur => ur.role.name === 'broker');
    if (!isBroker) {
      throw new BadRequestException('User is not a broker');
    }

    return user;
  }

  async getPoliciesByBroker(brokerId: string) {
    await this.getBrokerById(brokerId); // Verify broker exists

    return this.supabase.getClient().policy.findMany({
      where: {
        broker_id: brokerId,
      },
      include: {
        plan: {
          include: {
            product: true,
          },
        },
        policy_members: {
          where: {
            relationship: 'principal',
          },
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async calculateCommissions(dto: CalculateCommissionDto, calculatedBy: string) {
    await this.getBrokerById(dto.brokerId); // Verify broker exists

    // Get all policies sold by broker in the period
    const policies = await this.supabase.getClient().policy.findMany({
      where: {
        broker_id: dto.brokerId,
        created_at: {
          gte: dto.periodStart,
          lte: dto.periodEnd,
        },
        status: {
          in: ['active', 'pending'],
        },
      },
      include: {
        plan: {
          include: {
            product: true,
          },
        },
      },
    });

    const commissions = [];

    for (const policy of policies) {
      // Calculate commission based on policy premium
      // Using a simple percentage model - in production this would be more complex
      const commissionRate = 0.10; // 10% - should come from broker profile or commission rules
      const commissionAmount = policy.premium.toNumber() * commissionRate;

      // Check if commission already exists for this policy and period
      const existing = await this.supabase.getClient().commission.findFirst({
        where: {
          broker_id: dto.brokerId,
          policy_id: policy.id,
          period_start: dto.periodStart,
          period_end: dto.periodEnd,
        },
      });

      if (existing) {
        continue; // Skip if already calculated
      }

      const commission = await this.supabase.getClient().commission.create({
        data: {
          broker_id: dto.brokerId,
          policy_id: policy.id,
          commission_type: 'new_business',
          amount: new Decimal(commissionAmount),
          period_start: dto.periodStart,
          period_end: dto.periodEnd,
          status: 'pending',
        },
      });

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
          premium: policy.premium.toNumber(),
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          formula: 'premium * commission_rate',
          inputs: {
            premium: policy.premium.toNumber(),
            commission_rate: commissionRate,
          },
          result: commissionAmount,
        },
      });

      commissions.push(commission);
    }

    return commissions;
  }

  async getCommissionsByBroker(brokerId: string, status?: string) {
    await this.getBrokerById(brokerId); // Verify broker exists

    return this.supabase.getClient().commission.findMany({
      where: {
        broker_id: brokerId,
        ...(status && { status }),
      },
      orderBy: {
        calculated_at: 'desc',
      },
    });
  }

  async markCommissionAsPaid(commissionId: string, paidBy: string) {
    const commission = await this.supabase.getClient().commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status === 'paid') {
      throw new BadRequestException('Commission already marked as paid');
    }

    const updated = await this.supabase.getClient().commission.update({
      where: { id: commissionId },
      data: {
        status: 'paid',
        paid_at: new Date(),
      },
    });

    await this.auditService.logEvent({
      event_type: 'commission_paid',
      user_id: paidBy,
      entity_type: 'commission',
      entity_id: commissionId,
      action: 'update',
      metadata: {
        broker_id: commission.broker_id,
        amount: commission.amount.toNumber(),
        paid_at: updated.paid_at?.toISOString(),
      },
    });

    return updated;
  }

  async generateCommissionStatement(dto: GenerateStatementDto, generatedBy: string) {
    await this.getBrokerById(dto.brokerId); // Verify broker exists

    // Get all commissions for the period
    const commissions = await this.supabase.getClient().commission.findMany({
      where: {
        broker_id: dto.brokerId,
        period_start: {
          gte: dto.periodStart,
        },
        period_end: {
          lte: dto.periodEnd,
        },
      },
    });

    if (commissions.length === 0) {
      throw new BadRequestException('No commissions found for this period');
    }

    // Fetch policy details for each commission
    const commissionsWithPolicies = await Promise.all(
      commissions.map(async (commission) => {
        if (!commission.policy_id) {
          return { ...commission, policy: null };
        }
        const policy = await this.supabase.getClient().policy.findUnique({
          where: { id: commission.policy_id },
          include: {
            plan: {
              include: {
                product: true,
              },
            },
            policy_members: {
              where: {
                relationship: 'principal',
              },
              include: {
                member: true,
              },
            },
          },
        });
        return { ...commission, policy };
      }),
    );

    // Calculate total commission
    const totalCommission = commissions.reduce(
      (sum, c) => sum + c.amount.toNumber(),
      0,
    );

    // Generate statement number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.supabase.getClient().commissionStatement.count();
    const statementNumber = `CS-${dateStr}-${String(count + 1).padStart(6, '0')}`;

    const statement = await this.supabase.getClient().commissionStatement.create({
      data: {
        broker_id: dto.brokerId,
        statement_number: statementNumber,
        period_start: dto.periodStart,
        period_end: dto.periodEnd,
        total_commission: new Decimal(totalCommission),
      },
    });

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
        policies: commissionsWithPolicies.map(c => ({
          policy_id: c.policy_id,
          policy_number: c.policy?.policy_number,
          commission_amount: c.amount.toNumber(),
          commission_type: c.commission_type,
        })),
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
    const statement = await this.supabase.getClient().commissionStatement.findUnique({
      where: { id: statementId },
    });

    if (!statement) {
      throw new NotFoundException('Commission statement not found');
    }

    return statement;
  }

  async getStatementsByBroker(brokerId: string) {
    await this.getBrokerById(brokerId); // Verify broker exists

    return this.supabase.getClient().commissionStatement.findMany({
      where: {
        broker_id: brokerId,
      },
      orderBy: {
        generated_at: 'desc',
      },
    });
  }

  async getAllBrokers() {
    const brokerRole = await this.supabase.getClient().role.findUnique({
      where: { name: 'broker' },
    });

    if (!brokerRole) {
      return [];
    }

    const userRoles = await this.supabase.getClient().userRole.findMany({
      where: {
        role_id: brokerRole.id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return userRoles.map(ur => ur.user);
  }

  async getBrokerStatistics(brokerId: string) {
    await this.getBrokerById(brokerId); // Verify broker exists

    const policies = await this.supabase.getClient().policy.findMany({
      where: { broker_id: brokerId },
    });

    const commissions = await this.supabase.getClient().commission.findMany({
      where: { broker_id: brokerId },
    });

    const totalCommissionEarned = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount.toNumber(), 0);

    const totalCommissionPending = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount.toNumber(), 0);

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalCommissions: commissions.length,
      totalCommissionEarned,
      totalCommissionPending,
    };
  }
}
