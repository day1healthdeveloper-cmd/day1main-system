import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

/**
 * Referral Programme Service
 * 
 * Handles referral code generation, tracking, and rewards
 * Requirements: 21.7
 */
@Injectable()
export class ReferralService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  /**
   * Generate referral code for a member
   * Requirements: 21.7
   */
  async generateReferralCode(memberId: string, userId: string) {
    // Check if member already has a referral code
    const { data: existing } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referrer_member_id', memberId)
      .limit(1)
      .single();

    if (existing) {
      return existing;
    }

    // Generate unique referral code
    const referralCode = await this.createUniqueReferralCode(memberId);

    const { data: referral, error } = await this.supabase
      .from('referrals')
      .insert({
        referral_code: referralCode,
        referrer_member_id: memberId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to generate referral code');

    await this.auditService.logEvent({
      event_type: 'referral_code_generated',
      action: 'referral.generate_code',
      user_id: userId,
      entity_type: 'referral',
      entity_id: referral.id,
      metadata: {
        memberId,
        referralCode,
      },
    });

    return referral;
  }

  /**
   * Track referral conversion
   * Requirements: 21.7
   */
  async trackReferralConversion(data: {
    referralCode: string;
    referredMemberId: string;
    policyId?: string;
    userId: string;
  }) {
    // Find referral by code
    const { data: referral, error } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', data.referralCode)
      .single();

    if (error || !referral) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referral.status !== 'active') {
      throw new BadRequestException('Referral code is not active');
    }

    // Update referral with conversion
    const { data: updated, error: updateError } = await this.supabase
      .from('referrals')
      .update({
        referred_member_id: data.referredMemberId,
        converted_at: new Date().toISOString(),
        status: 'converted',
        reward_amount: 100, // R100 reward per referral
      })
      .eq('id', referral.id)
      .select()
      .single();

    if (updateError) throw new BadRequestException('Failed to convert referral');

    await this.auditService.logEvent({
      event_type: 'referral_converted',
      action: 'referral.convert',
      user_id: data.userId,
      entity_type: 'referral',
      entity_id: referral.id,
      metadata: {
        referralCode: data.referralCode,
        referrerMemberId: referral.referrer_member_id,
        referredMemberId: data.referredMemberId,
        policyId: data.policyId,
      },
    });

    return updated;
  }

  /**
   * Calculate referral rewards
   * Requirements: 21.7
   */
  async calculateReferralRewards(memberId: string) {
    const { data: referrals } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referrer_member_id', memberId)
      .eq('status', 'converted');

    const referralList = referrals || [];
    const rewardPerReferral = 100;
    const totalReward = referralList.length * rewardPerReferral;

    return {
      memberId,
      totalReferrals: referralList.length,
      rewardPerReferral,
      totalReward,
      referrals: referralList.map(r => ({
        referralCode: r.referral_code,
        referredMemberId: r.referred_member_id,
        convertedAt: r.converted_at,
        rewardAmount: r.reward_amount,
      })),
    };
  }

  /**
   * Get referral by code
   */
  async getReferralByCode(referralCode: string) {
    const { data, error } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get referrals by member (as referrer)
   */
  async getReferralsByMember(memberId: string) {
    const { data } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referrer_member_id', memberId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get referral statistics
   */
  async getReferralStatistics(memberId?: string) {
    let totalQuery = this.supabase.getClient().from('referrals').select('*', { count: 'exact' });
    let convertedQuery = this.supabase.getClient().from('referrals').select('*', { count: 'exact' }).eq('status', 'converted');

    if (memberId) {
      totalQuery = totalQuery.eq('referrer_member_id', memberId);
      convertedQuery = convertedQuery.eq('referrer_member_id', memberId);
    }

    const { count: totalReferrals } = await totalQuery;
    const { count: convertedReferrals } = await convertedQuery;

    const conversionRate = (totalReferrals || 0) > 0 
      ? ((convertedReferrals || 0) / (totalReferrals || 1)) * 100 
      : 0;

    return {
      totalReferrals: totalReferrals || 0,
      convertedReferrals: convertedReferrals || 0,
      conversionRate,
    };
  }

  /**
   * Create unique referral code
   */
  private async createUniqueReferralCode(memberId: string): Promise<string> {
    // Get member to use their name in the code
    const { data: member, error } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error || !member) {
      throw new NotFoundException('Member not found');
    }

    // Create code from first 3 letters of first name + last 3 letters of last name + random 4 digits
    const firstPart = member.first_name.substring(0, 3).toUpperCase();
    const lastPart = member.last_name.substring(0, 3).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();

    let referralCode = `${firstPart}${lastPart}${randomPart}`;

    // Check if code already exists
    let { data: exists } = await this.supabase
      .from('referrals')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    // If exists, keep generating until unique
    while (exists) {
      const newRandomPart = Math.floor(1000 + Math.random() * 9000).toString();
      referralCode = `${firstPart}${lastPart}${newRandomPart}`;
      const { data: check } = await this.supabase
        .from('referrals')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      exists = check;
    }

    return referralCode;
  }
}
