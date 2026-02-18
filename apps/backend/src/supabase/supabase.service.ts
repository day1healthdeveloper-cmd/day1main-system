import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔧 SupabaseService constructor');
    console.log('URL:', supabaseUrl);
    console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');
    console.log('Key length:', supabaseKey?.length);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    console.log('✅ Supabase client created');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper method to test connection
  async testConnection(): Promise<{ success: boolean; message: string; userCount?: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('users')
        .select('id', { count: 'exact' })
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Error: ${error.message}`,
        };
      }

      return {
        success: true,
        message: 'Connected to Supabase successfully',
        userCount: count || 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Exception: ${err.message}`,
      };
    }
  }
}
