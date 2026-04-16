import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, pin } = body;

    // Validation
    if (!mobile || !pin) {
      return NextResponse.json(
        { error: 'Mobile number and PIN are required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4-6 digits' },
        { status: 400 }
      );
    }

    // Find member by mobile number
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, member_number, first_name, last_name, email, mobile, status, broker_code, plan_name, monthly_premium, pin_code, failed_login_attempts, locked_until')
      .eq('mobile', mobile)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Invalid mobile number or PIN' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (member.locked_until) {
      const lockExpiry = new Date(member.locked_until);
      const now = new Date();
      
      if (now < lockExpiry) {
        const minutesRemaining = Math.ceil((lockExpiry.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { 
            error: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minute(s).`,
            locked: true,
            locked_until: member.locked_until
          },
          { status: 423 } // 423 Locked
        );
      } else {
        // Lock expired, reset failed attempts
        await supabaseAdmin
          .from('members')
          .update({
            failed_login_attempts: 0,
            locked_until: null
          })
          .eq('id', member.id);
      }
    }

    // Check if member is active
    if (member.status !== 'active') {
      return NextResponse.json(
        { error: `Account is ${member.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Check if PIN is set
    if (!member.pin_code) {
      return NextResponse.json(
        { 
          error: 'PIN not set. Please contact support to set up your PIN.',
          pin_not_set: true
        },
        { status: 403 }
      );
    }

    // Validate PIN (plain text comparison for now - TODO: implement hashing)
    if (member.pin_code !== pin) {
      // Increment failed login attempts
      const newFailedAttempts = (member.failed_login_attempts || 0) + 1;
      const maxAttempts = 5;
      
      if (newFailedAttempts >= maxAttempts) {
        // Lock account for 30 minutes
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        
        await supabaseAdmin
          .from('members')
          .update({
            failed_login_attempts: newFailedAttempts,
            locked_until: lockUntil.toISOString()
          })
          .eq('id', member.id);
        
        return NextResponse.json(
          { 
            error: 'Too many failed attempts. Account locked for 30 minutes.',
            locked: true,
            locked_until: lockUntil.toISOString()
          },
          { status: 423 }
        );
      } else {
        // Update failed attempts
        await supabaseAdmin
          .from('members')
          .update({
            failed_login_attempts: newFailedAttempts
          })
          .eq('id', member.id);
        
        const attemptsRemaining = maxAttempts - newFailedAttempts;
        return NextResponse.json(
          { 
            error: 'Invalid mobile number or PIN',
            attempts_remaining: attemptsRemaining
          },
          { status: 401 }
        );
      }
    }

    // Successful login - reset failed attempts
    await supabaseAdmin
      .from('members')
      .update({
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('id', member.id);

    // Create session token (simple JWT-like token for now)
    const sessionToken = Buffer.from(
      JSON.stringify({
        memberId: member.id,
        memberNumber: member.member_number,
        mobile: member.mobile,
        timestamp: Date.now()
      })
    ).toString('base64');

    // Return success with member data
    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        member_number: member.member_number,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        mobile: member.mobile,
        broker_code: member.broker_code,
        plan_name: member.plan_name,
        monthly_premium: member.monthly_premium,
        status: member.status
      },
      session_token: sessionToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
