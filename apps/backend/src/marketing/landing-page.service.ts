import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLandingPageDto, UpdateLandingPageDto, CaptureLandingPageLeadDto } from './dto/landing-page.dto';

@Injectable()
export class LandingPageService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new landing page
   */
  async createLandingPage(dto: CreateLandingPageDto, userId: string) {
    const client = this.supabase.getClient();

    // Check if slug already exists
    const { data: existing } = await client
      .from('landing_pages')
      .select('id')
      .eq('slug', dto.slug)
      .single();

    if (existing) {
      throw new ConflictException(`Landing page with slug '${dto.slug}' already exists`);
    }

    const { data, error } = await client
      .from('landing_pages')
      .insert({
        name: dto.name,
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        template: dto.template,
        content: dto.content,
        status: dto.status || 'draft',
        metadata: dto.metadata,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all landing pages
   */
  async getAllLandingPages() {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get landing page by ID
   */
  async getLandingPageById(id: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException('Landing page not found');
    return data;
  }

  /**
   * Get landing page by slug (for public access)
   */
  async getLandingPageBySlug(slug: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) throw new NotFoundException('Landing page not found');

    // Track visit
    await this.trackVisit(data.id);

    return data;
  }

  /**
   * Update landing page
   */
  async updateLandingPage(id: string, dto: UpdateLandingPageDto, userId: string) {
    const client = this.supabase.getClient();

    // Check if slug is being changed and if it conflicts
    if (dto.slug) {
      const { data: existing } = await client
        .from('landing_pages')
        .select('id')
        .eq('slug', dto.slug)
        .neq('id', id)
        .single();

      if (existing) {
        throw new ConflictException(`Landing page with slug '${dto.slug}' already exists`);
      }
    }

    const { data, error } = await client
      .from('landing_pages')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('Landing page not found');
    return data;
  }

  /**
   * Delete landing page
   */
  async deleteLandingPage(id: string) {
    const client = this.supabase.getClient();

    const { error } = await client
      .from('landing_pages')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Landing page not found');
    return { message: 'Landing page deleted successfully' };
  }

  /**
   * Clone landing page
   */
  async cloneLandingPage(id: string, userId: string) {
    const client = this.supabase.getClient();

    // Get original page
    const original = await this.getLandingPageById(id);

    // Create new slug
    const newSlug = `${original.slug}-copy-${Date.now()}`;

    const { data, error } = await client
      .from('landing_pages')
      .insert({
        name: `${original.name} (Copy)`,
        slug: newSlug,
        title: original.title,
        description: original.description,
        template: original.template,
        content: original.content,
        status: 'draft',
        metadata: original.metadata,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get landing page statistics
   */
  async getLandingPageStats(id: string) {
    const client = this.supabase.getClient();

    // Get visit count
    const { count: visits } = await client
      .from('landing_page_visits')
      .select('*', { count: 'exact', head: true })
      .eq('landing_page_id', id);

    // Get lead count
    const { count: leads } = await client
      .from('landing_page_leads')
      .select('*', { count: 'exact', head: true })
      .eq('landing_page_id', id);

    // Calculate conversion rate
    const conversionRate = visits > 0 ? ((leads / visits) * 100).toFixed(1) : '0.0';

    // Get bounce rate (visits with duration < 10 seconds)
    const { count: bounces } = await client
      .from('landing_page_visits')
      .select('*', { count: 'exact', head: true })
      .eq('landing_page_id', id)
      .lt('duration', 10);

    const bounceRate = visits > 0 ? ((bounces / visits) * 100).toFixed(1) : '0.0';

    // Get average time on page
    const { data: avgData } = await client
      .from('landing_page_visits')
      .select('duration')
      .eq('landing_page_id', id);

    let avgTimeOnPage = '0:00';
    if (avgData && avgData.length > 0) {
      const totalDuration = avgData.reduce((sum, v) => sum + (v.duration || 0), 0);
      const avgSeconds = Math.floor(totalDuration / avgData.length);
      const minutes = Math.floor(avgSeconds / 60);
      const seconds = avgSeconds % 60;
      avgTimeOnPage = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return {
      landingPageId: id,
      visits: visits || 0,
      leads: leads || 0,
      conversionRate: parseFloat(conversionRate),
      bounceRate: parseFloat(bounceRate),
      avgTimeOnPage,
    };
  }

  /**
   * Track a visit to a landing page
   */
  private async trackVisit(landingPageId: string) {
    const client = this.supabase.getClient();

    await client.from('landing_page_visits').insert({
      landing_page_id: landingPageId,
      visited_at: new Date().toISOString(),
    });
  }

  /**
   * Update visit duration when user leaves
   */
  async updateVisitDuration(visitId: string, duration: number) {
    const client = this.supabase.getClient();

    await client
      .from('landing_page_visits')
      .update({ duration })
      .eq('id', visitId);
  }

  /**
   * Capture a lead from a landing page
   */
  async captureLead(dto: CaptureLandingPageLeadDto) {
    const client = this.supabase.getClient();

    // Get landing page by slug
    const { data: landingPage } = await client
      .from('landing_pages')
      .select('id')
      .eq('slug', dto.landingPageSlug)
      .single();

    if (!landingPage) {
      throw new NotFoundException('Landing page not found');
    }

    // Create lead in landing_page_leads table
    const { data: leadData, error: leadError } = await client
      .from('landing_page_leads')
      .insert({
        landing_page_id: landingPage.id,
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        metadata: dto.metadata,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Also create in main leads table for marketing team
    const { data: mainLead, error: mainLeadError } = await client
      .from('leads')
      .insert({
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        source_id: `landing-page-${landingPage.id}`,
        status: 'new',
        metadata: {
          ...dto.metadata,
          landing_page_slug: dto.landingPageSlug,
        },
      })
      .select()
      .single();

    if (mainLeadError) throw mainLeadError;

    return {
      leadId: leadData.id,
      mainLeadId: mainLead.id,
      message: 'Lead captured successfully',
    };
  }
}
