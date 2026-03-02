import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if provider already has a user account
    if (provider.user_id) {
      return NextResponse.json(
        { error: 'Provider already has a user account' },
        { status: 400 }
      );
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: firstName || provider.name.split(' ')[0],
        lastName: lastName || provider.name.split(' ').slice(1).join(' '),
        role: 'provider',
      },
    });

    if (authError) {
      throw authError;
    }

    // Insert into users table
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName || provider.name.split(' ')[0],
        last_name: lastName || provider.name.split(' ').slice(1).join(' '),
        roles: ['provider'],
      });

    if (userInsertError) {
      console.error('Error inserting user:', userInsertError);
      // Continue anyway, the auth user was created
    }

    // Link provider to user
    const { error: updateError } = await supabase
      .from('providers')
      .update({ user_id: authData.user.id })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    console.error('Error creating provider account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create provider account' },
      { status: 500 }
    );
  }
}
