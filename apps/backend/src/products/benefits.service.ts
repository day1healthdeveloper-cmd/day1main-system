import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BenefitsService {
  private readonly logger = new Logger(BenefitsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Get all benefit types
   */
  async getBenefitTypes(category?: string) {
    let query = this.supabase.getClient()
      .from('benefit_types')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching benefit types:', error);
      throw new Error(`Failed to fetch benefit types: ${error.message}`);
    }

    return data;
  }

  /**
   * Get benefits for a specific product
   */
  async getProductBenefits(productId: string) {
    const { data, error} = await this.supabase.getClient()
      .from('product_benefits')
      .select(`
        *,
        benefit_type:benefit_types(*)
      `)
      .eq('product_id', productId)
      .eq('is_active', true);

    if (error) {
      this.logger.error('Error fetching product benefits:', error);
      throw new Error(`Failed to fetch product benefits: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or update product benefit
   */
  async upsertProductBenefit(productId: string, benefitData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('product_benefits')
      .upsert({
        product_id: productId,
        ...benefitData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error upserting product benefit:', error);
      throw new Error(`Failed to upsert product benefit: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete product benefit
   */
  async deleteProductBenefit(id: string) {
    const { error } = await this.supabase.getClient()
      .from('product_benefits')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting product benefit:', error);
      throw new Error(`Failed to delete product benefit: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Get benefit usage for a member
   */
  async getMemberBenefitUsage(memberId: string, year: number) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_usage')
      .select(`
        *,
        product_benefit:product_benefits(
          *,
          benefit_type:benefit_types(*)
        )
      `)
      .eq('member_id', memberId)
      .eq('benefit_year', year);

    if (error) {
      this.logger.error('Error fetching benefit usage:', error);
      throw new Error(`Failed to fetch benefit usage: ${error.message}`);
    }

    return data;
  }
}
