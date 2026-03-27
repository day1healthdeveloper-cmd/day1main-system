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

    const { action, ...updateData } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
      fraud_reviewer_id: 'claims-assessor', // TODO: Get from auth context
      ...updateData
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
    const auditEntry = {
      claim_id: id,
      action: `fraud-${action}`,
      performed_by: 'claims-assessor',
      performed_at: new Date().toISOString(),
      old_status: null,
      new_status: data.status,
      notes: `Fraud case ${action}: ${updateData.fraud_review_notes || 'No notes provided'}`
    };

    await supabase.from('claim_audit_trail').insert(auditEntry);

    return NextResponse.json({ 
      success: true, 
      case: data,
      message: `Fraud case ${action} successfully`
    });
  } catch (error) {
    console.error('Error updating fraud case:', error);
    return NextResponse.json(
      { error: 'Failed to update fraud case' },
      { status: 500 }
    );
  }
}
