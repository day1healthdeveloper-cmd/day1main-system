/**
 * Server-side authentication utilities for API routes
 * Extracts authenticated user from request headers/cookies
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isProvider: boolean;
  providerId?: string;
  providerName?: string;
  doctorSurname?: string;
  providerNumber?: string;
  practiceName?: string;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: string | null;
}

export function createAuthenticatedSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: authHeader
      ? {
          headers: {
            Authorization: authHeader,
          },
        }
      : undefined,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServiceRoleSupabaseClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAuthenticatedUserFromToken(token: string): Promise<AuthResult> {
  try {
    if (!token) {
      return {
        user: null,
        error: 'No authorization token provided',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return {
        user: null,
        error: 'Invalid or expired token',
      };
    }

    const serviceRoleSupabase = createServiceRoleSupabaseClient();
    const { data: providerData } = await serviceRoleSupabase
      .from('providers')
      .select('id, name, doctor_surname, login_email, prno, practice_name, user_id')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (providerData) {
      return {
        user: {
          id: authUser.id,
          email: providerData.login_email || authUser.email || '',
          roles: ['provider'],
          permissions: [],
          isProvider: true,
          providerId: providerData.id,
          providerName: providerData.name || undefined,
          doctorSurname: providerData.doctor_surname || undefined,
          providerNumber: providerData.prno || undefined,
          practiceName: providerData.practice_name || undefined,
        },
        error: null,
      };
    }

    if (authUser.user_metadata?.role === 'provider') {
      return {
        user: {
          id: authUser.id,
          email: authUser.email || '',
          roles: ['provider'],
          permissions: [],
          isProvider: true,
          providerId: authUser.id,
        },
        error: null,
      };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('email', authUser.email)
      .maybeSingle();

    if (userError || !userData) {
      return {
        user: null,
        error: 'User not found in database',
      };
    }

    if (!userData.is_active) {
      return {
        user: null,
        error: 'User account is inactive',
      };
    }

    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userData.id);

    const roles: string[] = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

    const { data: permissionsData } = await supabase
      .from('role_permissions')
      .select('permissions(name)')
      .in('role_id', userRolesData?.map((ur: any) => ur.role_id) || []);

    const permissions: string[] = permissionsData?.map((p: any) => p.permissions?.name).filter(Boolean) || [];

    return {
      user: {
        id: userData.id,
        email: userData.email,
        roles,
        permissions,
        isProvider: false,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Error getting authenticated user:', error);
    return {
      user: null,
      error: error.message || 'Authentication failed',
    };
  }
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: 'No authorization token provided',
    };
  }

  return getAuthenticatedUserFromToken(authHeader.replace('Bearer ', ''));
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const { user, error } = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error(error || 'Authentication required');
  }

  return user;
}

export async function requireRole(request: NextRequest, requiredRole: string): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);

  if (!user.roles.includes(requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }

  return user;
}

export async function requireAnyRole(request: NextRequest, requiredRoles: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  const hasRole = requiredRoles.some((role) => user.roles.includes(role));

  if (!hasRole) {
    throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
  }

  return user;
}

export async function requirePermission(request: NextRequest, requiredPermission: string): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);

  if (!user.permissions.includes(requiredPermission)) {
    throw new Error(`Access denied. Required permission: ${requiredPermission}`);
  }

  return user;
}

export async function hasRole(request: NextRequest, role: string): Promise<boolean> {
  const { user } = await getAuthenticatedUser(request);
  return user?.roles.includes(role) || false;
}

export async function hasPermission(request: NextRequest, permission: string): Promise<boolean> {
  const { user } = await getAuthenticatedUser(request);
  return user?.permissions.includes(permission) || false;
}
