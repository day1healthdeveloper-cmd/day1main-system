import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, pin } = body;

    if (!mobile || !pin) {
      return NextResponse.json(
        { error: 'Mobile number and PIN are required' },
        { status: 400 }
      );
    }

    // Find member by mobile number
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: 'Invalid mobile number or PIN' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (member.locked_until && new Date(member.locked_until) > new Date()) {
      const lockMinutes = Math.ceil((new Date(member.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${lockMinutes} minutes.` },
        { status: 423 }
      );
    }

    // Verify PIN
    let pinValid = false;
    if (member.pin_hash) {
      // Use bcrypt for hashed PINs
      pinValid = await bcrypt.compare(pin, member.pin_hash);
    }

    if (!pinValid) {
      // Increment failed login attempts
      const failedAttempts = (member.failed_login_attempts || 0) + 1;
      const updateData: any = {
        failed_login_attempts: failedAttempts
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
        updateData.locked_until = lockUntil.toISOString();
      }

      await supabaseAdmin
        .from('members')
        .update(updateData)
        .eq('id', member.id);

      return NextResponse.json(
        { error: 'Invalid mobile number or PIN' },
        { status: 401 }
      );
    }

    // Check if member is active
    if (member.status !== 'active') {
      return NextResponse.json(
        { error: `Account is ${member.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Reset failed login attempts on successful login
    await supabaseAdmin
      .from('members')
      .update({
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('id', member.id);

    // Return member data (excluding sensitive fields)
    const { pin_code, pin_hash, ...memberData } = member;

    return NextResponse.json({
      success: true,
      member: memberData,
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Error in member login:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
