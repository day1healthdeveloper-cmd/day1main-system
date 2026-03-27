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

    const { action, status, pre_auth_number, ...updateData } = body;

    // Build update object based on action
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
      ...updateData
    };

    // Add pre-auth number if provided
    if (pre_auth_number) {
      updates.pre_auth_number = pre_auth_number;
    }

    // Add approval timestamp if approved
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    }

    // Update claim
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Insert audit trail
    const auditEntry = {
      claim_id: id,
      action: `pre-auth-${action}`,
      performed_by: 'claims-assessor',
      performed_at: new Date().toISOString(),
      old_status: null,
      new_status: status,
      notes: `Pre-authorization ${action}${pre_auth_number ? ` - Auth #: ${pre_auth_number}` : ''}`
    };

    await supabase.from('claim_audit_trail').insert(auditEntry);

    return NextResponse.json({ 
      success: true, 
      request: data,
      message: `Pre-authorization ${action} successfully`
    });
  } catch (error) {
    console.error('Error updating pre-auth request:', error);
    return NextResponse.json(
      { error: 'Failed to update pre-auth request' },
      { status: 500 }
    );
  }
}
