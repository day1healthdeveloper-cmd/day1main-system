import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch ALL providers using pagination
    let allProviders: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allProviders = [...allProviders, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    const stats = {
      total: allProviders.length,
      active: allProviders.filter(p => p.status === 'active').length,
      pending: allProviders.filter(p => p.status === 'pending').length,
      inactive: allProviders.filter(p => p.status === 'inactive').length,
    };

    console.log(`✅ API: Fetched ${allProviders.length} providers`);

    return NextResponse.json({ providers: allProviders, stats });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { login_email, login_password, first_name, last_name, ...providerData } = body;

    let userId = null;

    // Create user account if login credentials provided
    if (login_email && login_password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: login_email,
        password: login_password,
        email_confirm: true,
        user_metadata: {
          firstName: first_name || providerData.name.split(' ')[0],
          lastName: last_name || providerData.name.split(' ').slice(1).join(' '),
          role: 'provider',
        },
      });

      if (authError) {
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      userId = authData.user.id;

      // Insert into users table
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: login_email,
          first_name: first_name || providerData.name.split(' ')[0],
          last_name: last_name || providerData.name.split(' ').slice(1).join(' '),
          roles: ['provider'],
          is_active: true,
        });

      if (userInsertError) {
        console.error('Error inserting user:', userInsertError);
      }

      // Insert into profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: first_name || providerData.name.split(' ')[0],
          last_name: last_name || providerData.name.split(' ').slice(1).join(' '),
        });

      if (profileError) {
        console.error('Error inserting profile:', profileError);
      }

      // Get or create provider role
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'provider')
        .single();

      if (roleData) {
        // Insert into user_roles table
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleData.id,
          });

        if (userRoleError) {
          console.error('Error inserting user role:', userRoleError);
        }
      }
    }

    // Create provider with user_id link and login credentials
    const { error } = await supabase
      .from('providers')
      .insert([{ 
        ...providerData, 
        user_id: userId,
        login_email: login_email || null,
        login_password: login_password || null,
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create provider' },
      { status: 500 }
    );
  }
}
