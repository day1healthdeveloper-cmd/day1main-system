'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount and listen for auth changes
  useEffect(() => {
    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      if (session) {
        await loadUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    console.log('🔄 Loading user...');
    try {
      // Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('❌ No active session');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, fetching user data...');

      // Check if user is a provider first
      const { data: providerData } = await supabase
        .from('providers')
        .select('id, name, login_email, user_id')
        .eq('user_id', session.user.id)
        .single();

      if (providerData) {
        // User is a provider
        console.log('✅ Provider user found');
        const nameParts = providerData.name.split(' ');
        const transformedUser: User = {
          id: session.user.id,
          email: providerData.login_email || session.user.email || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          roles: ['provider'],
          permissions: [],
        };
        console.log('✅ Provider data loaded:', transformedUser);
        setUser(transformedUser);
        setLoading(false);
        return;
      }

      // Get user data from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          is_active,
          profile:profiles(first_name, last_name),
          user_roles!user_roles_user_id_fkey(
            role:roles(
              name,
              role_permissions(
                permission:permissions(name)
              )
            )
          )
        `)
        .eq('email', session.user.email)
        .single();

      if (userError || !userData) {
        console.error('❌ Error loading user data:', userError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!userData.is_active) {
        console.error('❌ User is inactive');
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      // Extract roles and permissions
      const roles = userData.user_roles?.map((ur: any) => ur.role.name) || [];
      const permissions = userData.user_roles?.flatMap((ur: any) =>
        ur.role.role_permissions?.map((rp: any) => rp.permission.name) || []
      ) || [];

      // Handle profile - it comes as an array from Supabase join
      const profile = Array.isArray(userData.profile) ? userData.profile[0] : userData.profile;

      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        roles,
        permissions: [...new Set(permissions)],
      };

      console.log('✅ User data loaded:', transformedUser);
      setUser(transformedUser);
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await loadUser();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // User data will be created via database trigger or we can create it here
      await loadUser();
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
