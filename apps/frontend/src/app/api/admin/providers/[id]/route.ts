import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ provider });
  } catch (error: any) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { login_email, login_password, ...updateData } = body;

    // Get current provider data
    const { data: currentProvider } = await supabase
      .from('providers')
      .select('user_id, login_email')
      .eq('id', params.id)
      .single();

    let userId = currentProvider?.user_id;

    // Handle user account creation/update if login credentials provided
    if (login_email && login_password) {
      if (!userId) {
        // Create new user account
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: login_email,
          password: login_password,
          email_confirm: true,
          user_metadata: {
            firstName: updateData.name?.split(' ')[0] || 'Provider',
            lastName: updateData.name?.split(' ').slice(1).join(' ') || '',
            role: 'provider',
          },
        });

        if (authError) {
          console.error('Error creating user:', authError);
        } else {
          userId = authData.user.id;

          // Insert into users table
          await supabase.from('users').insert({
            id: userId,
            email: login_email,
            first_name: updateData.name?.split(' ')[0] || 'Provider',
            last_name: updateData.name?.split(' ').slice(1).join(' ') || '',
            roles: ['provider'],
            is_active: true,
          });

          // Insert into profiles table
          await supabase.from('profiles').insert({
            id: userId,
            first_name: updateData.name?.split(' ')[0] || 'Provider',
            last_name: updateData.name?.split(' ').slice(1).join(' ') || '',
          });

          // Get provider role and insert into user_roles
          const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'provider')
            .single();

          if (roleData) {
            await supabase.from('user_roles').insert({
              user_id: userId,
              role_id: roleData.id,
            });
          }
        }
      } else if (currentProvider?.login_email !== login_email) {
        // Update existing user email
        await supabase.auth.admin.updateUserById(userId, {
          email: login_email,
          password: login_password,
        });
      } else {
        // Just update password
        await supabase.auth.admin.updateUserById(userId, {
          password: login_password,
        });
      }
    }

    // Update provider record
    const { error } = await supabase
      .from('providers')
      .update({
        ...updateData,
        user_id: userId,
        login_email: login_email || null,
        login_password: login_password || null,
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update provider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete provider' },
      { status: 500 }
    );
  }
}
