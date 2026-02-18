import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Get all products
   */
  async findAll() {
    const { data, error } = await this.supabase.getClient()
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data;
  }

  /**
   * Get product by ID
   */
  async findOne(id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching product:', error);
      throw new NotFoundException(`Product not found: ${error.message}`);
    }

    return data;
  }

  /**
   * Get product with all benefits
   */
  async findOneWithBenefits(id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('products')
      .select(`
        *,
        product_benefits (
          *,
          benefit_type:benefit_types(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching product with benefits:', error);
      throw new NotFoundException(`Product not found: ${error.message}`);
    }

    return data;
  }

  /**
   * Create product
   */
  async create(productData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  }

  /**
   * Update product
   */
  async update(id: string, productData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete product
   */
  async remove(id: string) {
    const { error } = await this.supabase.getClient()
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Get policy document sections for a product
   */
  async getPolicyDocument(productId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_document_sections')
      .select('*')
      .eq('product_id', productId)
      .order('section_order', { ascending: true });

    if (error) {
      this.logger.error('Error fetching policy document:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Save or update a policy document section
   */
  async savePolicyDocumentSection(productId: string, sectionData: { section_id: string; content: string }) {
    // Check if section exists
    const { data: existing } = await this.supabase.getClient()
      .from('policy_document_sections')
      .select('*')
      .eq('product_id', productId)
      .eq('section_id', sectionData.section_id)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await this.supabase.getClient()
        .from('policy_document_sections')
        .update({
          content: sectionData.content,
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId)
        .eq('section_id', sectionData.section_id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating policy section:', error);
        throw new Error(`Failed to update section: ${error.message}`);
      }

      return data;
    } else {
      // Create new
      const { data, error } = await this.supabase.getClient()
        .from('policy_document_sections')
        .insert({
          product_id: productId,
          section_id: sectionData.section_id,
          content: sectionData.content,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating policy section:', error);
        throw new Error(`Failed to create section: ${error.message}`);
      }

      return data;
    }
  }

  /**
   * Get all definitions for a product
   */
  async getDefinitions(productId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_definitions')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      this.logger.error('Error fetching definitions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add a new definition
   */
  async addDefinition(productId: string, definitionData: { term: string; definition: string; category?: string }) {
    // Get max display_order
    const { data: existing } = await this.supabase.getClient()
      .from('policy_definitions')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;

    const { data, error } = await this.supabase.getClient()
      .from('policy_definitions')
      .insert({
        product_id: productId,
        term: definitionData.term,
        definition: definitionData.definition,
        category: definitionData.category || 'general',
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding definition:', error);
      throw new Error(`Failed to add definition: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a definition
   */
  async updateDefinition(definitionId: string, definitionData: { term: string; definition: string; category?: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_definitions')
      .update({
        term: definitionData.term,
        definition: definitionData.definition,
        category: definitionData.category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', definitionId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating definition:', error);
      throw new Error(`Failed to update definition: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a definition
   */
  async deleteDefinition(definitionId: string) {
    const { error } = await this.supabase.getClient()
      .from('policy_definitions')
      .delete()
      .eq('id', definitionId);

    if (error) {
      this.logger.error('Error deleting definition:', error);
      throw new Error(`Failed to delete definition: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Get policy section content
   */
  async getPolicySection(productId: string, sectionType: string) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_sections')
      .select('*')
      .eq('product_id', productId)
      .eq('section_type', sectionType)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error('Error fetching policy section:', error);
      return null;
    }

    return data;
  }

  /**
   * Save or update policy section content
   */
  async savePolicySection(productId: string, sectionType: string, content: string) {
    // Check if section exists
    const existing = await this.getPolicySection(productId, sectionType);

    if (existing) {
      // Update
      const { data, error } = await this.supabase.getClient()
        .from('policy_sections')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId)
        .eq('section_type', sectionType)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating policy section:', error);
        throw new Error(`Failed to update section: ${error.message}`);
      }

      return data;
    } else {
      // Create
      const { data, error } = await this.supabase.getClient()
        .from('policy_sections')
        .insert({
          product_id: productId,
          section_type: sectionType,
          content,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating policy section:', error);
        throw new Error(`Failed to create section: ${error.message}`);
      }

      return data;
    }
  }

  /**
   * Get policy section items (for list-based sections)
   */
  async getPolicySectionItems(productId: string, sectionType: string) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_section_items')
      .select('*')
      .eq('product_id', productId)
      .eq('section_type', sectionType)
      .order('display_order', { ascending: true });

    if (error) {
      this.logger.error('Error fetching section items:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add policy section item
   */
  async addPolicySectionItem(productId: string, sectionType: string, itemData: { title?: string; content: string }) {
    // Get max display_order
    const { data: existing } = await this.supabase.getClient()
      .from('policy_section_items')
      .select('display_order')
      .eq('product_id', productId)
      .eq('section_type', sectionType)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;

    const { data, error } = await this.supabase.getClient()
      .from('policy_section_items')
      .insert({
        product_id: productId,
        section_type: sectionType,
        title: itemData.title || '',
        content: itemData.content,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding section item:', error);
      throw new Error(`Failed to add item: ${error.message}`);
    }

    return data;
  }

  /**
   * Update policy section item
   */
  async updatePolicySectionItem(itemId: string, itemData: { title?: string; content: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('policy_section_items')
      .update({
        title: itemData.title,
        content: itemData.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating section item:', error);
      throw new Error(`Failed to update item: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete policy section item
   */
  async deletePolicySectionItem(itemId: string) {
    const { error } = await this.supabase.getClient()
      .from('policy_section_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      this.logger.error('Error deleting section item:', error);
      throw new Error(`Failed to delete item: ${error.message}`);
    }

    return { success: true };
  }
}
