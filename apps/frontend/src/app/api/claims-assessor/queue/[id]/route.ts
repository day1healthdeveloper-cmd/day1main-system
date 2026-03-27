import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { id } = params;

    const { action, status, ...updateData } = body;

    // Build update object based on action
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
      ...updateData
    };

    // Add audit trail entry
    const auditEntry = {
      claim_id: id,
      action,
      performed_by: 'claims-assessor', // TODO: Get from auth context
      performed_at: new Date().toISOString(),
      old_status: null, // TODO: Fetch current status first
      new_status: status,
      notes: `Claim ${action} via queue`
    };

    // Update claim
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Insert audit trail
    await supabase.from('claim_audit_trail').insert(auditEntry);

    return NextResponse.json({ 
      success: true, 
      claim: data,
      message: `Claim ${action} successfully`
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}
