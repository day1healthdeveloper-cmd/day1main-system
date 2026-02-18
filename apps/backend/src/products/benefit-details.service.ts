import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BenefitDetailsService {
  private readonly logger = new Logger(BenefitDetailsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getBenefitDetails(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_details')
      .select('*')
      .eq('product_benefit_id', productBenefitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error('Error fetching benefit details:', error);
      throw new Error(`Failed to fetch benefit details: ${error.message}`);
    }

    return data;
  }

  async upsertBenefitDetails(productBenefitId: string, details: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_details')
      .upsert({
        product_benefit_id: productBenefitId,
        ...details,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error upserting benefit details:', error);
      throw new Error(`Failed to upsert benefit details: ${error.message}`);
    }

    return data;
  }

  async getBenefitExclusions(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_exclusions')
      .select('*')
      .eq('product_benefit_id', productBenefitId);

    if (error) {
      this.logger.error('Error fetching exclusions:', error);
      throw new Error(`Failed to fetch exclusions: ${error.message}`);
    }

    return data;
  }

  async addBenefitExclusion(productBenefitId: string, exclusion: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_exclusions')
      .insert({
        product_benefit_id: productBenefitId,
        ...exclusion,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding exclusion:', error);
      throw new Error(`Failed to add exclusion: ${error.message}`);
    }

    return data;
  }

  async deleteBenefitExclusion(exclusionId: string) {
    const { error } = await this.supabase.getClient()
      .from('benefit_exclusions')
      .delete()
      .eq('id', exclusionId);

    if (error) {
      this.logger.error('Error deleting exclusion:', error);
      throw new Error(`Failed to delete exclusion: ${error.message}`);
    }

    return { success: true };
  }

  async getBenefitConditions(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_conditions')
      .select('*')
      .eq('product_benefit_id', productBenefitId);

    if (error) {
      this.logger.error('Error fetching conditions:', error);
      throw new Error(`Failed to fetch conditions: ${error.message}`);
    }

    return data;
  }

  async addBenefitCondition(productBenefitId: string, condition: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_conditions')
      .insert({
        product_benefit_id: productBenefitId,
        ...condition,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding condition:', error);
      throw new Error(`Failed to add condition: ${error.message}`);
    }

    return data;
  }

  async deleteBenefitCondition(conditionId: string) {
    const { error } = await this.supabase.getClient()
      .from('benefit_conditions')
      .delete()
      .eq('id', conditionId);

    if (error) {
      this.logger.error('Error deleting condition:', error);
      throw new Error(`Failed to delete condition: ${error.message}`);
    }

    return { success: true };
  }

  async getNetworkProviders(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_network_providers')
      .select('*')
      .eq('product_benefit_id', productBenefitId)
      .eq('is_active', true);

    if (error) {
      this.logger.error('Error fetching network providers:', error);
      throw new Error(`Failed to fetch network providers: ${error.message}`);
    }

    return data;
  }

  async addNetworkProvider(productBenefitId: string, provider: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_network_providers')
      .insert({
        product_benefit_id: productBenefitId,
        ...provider,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding network provider:', error);
      throw new Error(`Failed to add network provider: ${error.message}`);
    }

    return data;
  }

  async removeNetworkProvider(providerId: string) {
    const { error } = await this.supabase.getClient()
      .from('benefit_network_providers')
      .update({ is_active: false })
      .eq('id', providerId);

    if (error) {
      this.logger.error('Error removing network provider:', error);
      throw new Error(`Failed to remove network provider: ${error.message}`);
    }

    return { success: true };
  }

  async getProcedureCodes(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_procedure_codes')
      .select('*')
      .eq('product_benefit_id', productBenefitId);

    if (error) {
      this.logger.error('Error fetching procedure codes:', error);
      throw new Error(`Failed to fetch procedure codes: ${error.message}`);
    }

    return data;
  }

  async addProcedureCode(productBenefitId: string, code: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_procedure_codes')
      .insert({
        product_benefit_id: productBenefitId,
        ...code,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding procedure code:', error);
      throw new Error(`Failed to add procedure code: ${error.message}`);
    }

    return data;
  }

  async deleteProcedureCode(codeId: string) {
    const { error } = await this.supabase.getClient()
      .from('benefit_procedure_codes')
      .delete()
      .eq('id', codeId);

    if (error) {
      this.logger.error('Error deleting procedure code:', error);
      throw new Error(`Failed to delete procedure code: ${error.message}`);
    }

    return { success: true };
  }

  async getAuthorizationRules(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_authorization_rules')
      .select('*')
      .eq('product_benefit_id', productBenefitId);

    if (error) {
      this.logger.error('Error fetching authorization rules:', error);
      throw new Error(`Failed to fetch authorization rules: ${error.message}`);
    }

    return data;
  }

  async upsertAuthorizationRule(productBenefitId: string, rule: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_authorization_rules')
      .upsert({
        product_benefit_id: productBenefitId,
        ...rule,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error upserting authorization rule:', error);
      throw new Error(`Failed to upsert authorization rule: ${error.message}`);
    }

    return data;
  }

  async getChangeHistory(productBenefitId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_change_history')
      .select('*')
      .eq('product_benefit_id', productBenefitId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      this.logger.error('Error fetching change history:', error);
      throw new Error(`Failed to fetch change history: ${error.message}`);
    }

    return data;
  }

  async logChange(productBenefitId: string, change: any) {
    const { data, error } = await this.supabase.getClient()
      .from('benefit_change_history')
      .insert({
        product_benefit_id: productBenefitId,
        ...change,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error logging change:', error);
      throw new Error(`Failed to log change: ${error.message}`);
    }

    return data;
  }
}
