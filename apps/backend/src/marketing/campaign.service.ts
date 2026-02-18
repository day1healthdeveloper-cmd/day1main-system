import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CampaignService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async createCampaign(data: {
    campaignName: string;
    campaignType: string;
    targetAudience?: any;
    startDate: Date;
    endDate?: Date;
    userId: string;
  }) {
    const { data: campaign, error } = await this.supabase
      .from('campaigns')
      .insert({
        campaign_name: data.campaignName,
        campaign_type: data.campaignType,
        target_audience: data.targetAudience || {},
        status: 'draft',
        start_date: data.startDate.toISOString(),
        end_date: data.endDate?.toISOString(),
        created_by: data.userId,
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to create campaign');

    await this.auditService.logEvent({
      event_type: 'campaign_created',
      action: 'campaign.create',
      user_id: data.userId,
      entity_type: 'campaign',
      entity_id: campaign.id,
      metadata: { campaignName: data.campaignName },
    });

    return campaign;
  }

  async sendCampaignMessage(data: {
    campaignId: string;
    recipientId: string;
    recipientType: string;
    messageType: string;
    subject?: string;
    body: string;
    userId: string;
  }) {
    if (data.recipientType === 'member') {
      const hasConsent = await this.checkMarketingConsent(data.recipientId);
      if (!hasConsent) {
        throw new BadRequestException('Member has not consented to marketing communications');
      }
    }

    const { data: message, error } = await this.supabase
      .from('message_sends')
      .insert({
        campaign_id: data.campaignId,
        recipient_id: data.recipientId,
        recipient_type: data.recipientType,
        message_type: data.messageType,
        subject: data.subject,
        body: data.body,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to send message');

    await this.auditService.logEvent({
      event_type: 'message_sent',
      action: 'campaign.send_message',
      user_id: data.userId,
      entity_type: 'message',
      entity_id: message.id,
      metadata: { campaignId: data.campaignId, consentVerified: data.recipientType === 'member' },
    });

    return message;
  }

  async checkMarketingConsent(memberId: string): Promise<boolean> {
    const { data: consent } = await this.supabase
      .from('member_consents')
      .select('*')
      .eq('member_id', memberId)
      .eq('consent_type', 'marketing')
      .eq('is_granted', true)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })
      .limit(1)
      .single();

    return consent !== null;
  }

  async processOptOut(memberId: string, reason?: string, userId?: string) {
    const { data: consent, error } = await this.supabase
      .from('member_consents')
      .select('*')
      .eq('member_id', memberId)
      .eq('consent_type', 'marketing')
      .eq('is_granted', true)
      .is('revoked_at', null)
      .limit(1)
      .single();

    if (error || !consent) {
      throw new NotFoundException('No active marketing consent found');
    }

    await this.supabase
      .from('member_consents')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', consent.id);

    await this.auditService.logEvent({
      event_type: 'marketing_opt_out',
      action: 'campaign.opt_out',
      user_id: userId || memberId,
      entity_type: 'consent',
      entity_id: consent.id,
      metadata: { memberId, reason },
    });

    return { success: true };
  }

  async getCampaignById(campaignId: string) {
    const { data: campaign, error } = await this.supabase
      .from('campaigns')
      .select('*, messages:message_sends(*)')
      .eq('id', campaignId)
      .single();

    if (error) return null;
    return campaign;
  }

  async getCampaignsByStatus(status: string) {
    const { data } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async updateCampaignStatus(campaignId: string, status: string, userId: string) {
    const { data: campaign, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const { data: updated, error: updateError } = await this.supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) throw new BadRequestException('Failed to update campaign');

    await this.auditService.logEvent({
      event_type: 'campaign_status_updated',
      action: 'campaign.update_status',
      user_id: userId,
      entity_type: 'campaign',
      entity_id: campaignId,
      metadata: { previousStatus: campaign.status, newStatus: status },
    });

    return updated;
  }

  async getCampaignStatistics(campaignId: string) {
    const { data: campaign, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const { count: totalMessages } = await this.supabase
      .from('message_sends')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    const { count: sentMessages } = await this.supabase
      .from('message_sends')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .eq('status', 'sent');

    const { count: failedMessages } = await this.supabase
      .from('message_sends')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .eq('status', 'failed');

    return {
      campaignId,
      campaignName: campaign.campaign_name,
      totalMessages: totalMessages || 0,
      sentMessages: sentMessages || 0,
      failedMessages: failedMessages || 0,
      deliveryRate: (totalMessages || 0) > 0 ? ((sentMessages || 0) / (totalMessages || 1)) * 100 : 0,
    };
  }

  async getCampaignMessages(campaignId: string) {
    const { data } = await this.supabase
      .from('message_sends')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false });

    return data || [];
  }

  async getRecipientMessages(recipientId: string) {
    const { data } = await this.supabase
      .from('message_sends')
      .select('*, campaign:campaigns(id, campaign_name, campaign_type)')
      .eq('recipient_id', recipientId)
      .order('sent_at', { ascending: false });

    return data || [];
  }
}
