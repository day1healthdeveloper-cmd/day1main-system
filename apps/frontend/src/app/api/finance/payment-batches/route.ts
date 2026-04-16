import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const batch_type = searchParams.get('batch_type');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('payment_batches')
      .select(`
        *,
        payments:claim_payments (count)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (batch_type) {
      query = query.eq('batch_type', batch_type);
    }

    if (date_from) {
      query = query.gte('batch_date', date_from);
    }

    if (date_to) {
      query = query.lte('batch_date', date_to);
    }

    const { data: batches, error } = await query;

    if (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }

    // Calculate summary statistics
    const summary = {
      total_batches: batches?.length || 0,
      draft: batches?.filter(b => b.status === 'draft').length || 0,
      approved: batches?.filter(b => b.status === 'approved').length || 0,
      processing: batches?.filter(b => b.status === 'processing').length || 0,
      completed: batches?.filter(b => b.status === 'completed').length || 0,
      failed: batches?.filter(b => b.status === 'failed').length || 0,
      total_amount: batches?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0
    };

    return NextResponse.json({
      batches: batches || [],
      summary
    });

  } catch (error) {
    console.error('Error fetching payment batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment batches' },
      { status: 500 }
    );
  }
}
