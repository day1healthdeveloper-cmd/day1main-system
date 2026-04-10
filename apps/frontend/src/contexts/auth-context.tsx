'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
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

  // Load user on mount ONLY - no auth state listener
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    console.log('🔄 Loading user...');
    setLoading(true);
    try {
      // Check for provider session first (custom auth)
      if (typeof window !== 'undefined') {
        const providerSession = localStorage.getItem('provider_session');
        if (providerSession) {
          const { provider, timestamp } = JSON.parse(providerSession);
          // Check if session is less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            console.log('✅ Provider session found');
            setUser(provider);
            setLoading(false);
            return;
          } else {
            // Session expired
            localStorage.removeItem('provider_session');
          }
        }
      }

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
        .select('id, email, is_active')
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

      // Get user roles with role names in one query
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userData.id);

      if (rolesError) {
        console.error('❌ Error loading roles:', rolesError);
      }

      const roles: string[] = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: '',
        lastName: '',
        roles,
        permissions: [],
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
    setLoading(true);
    try {
      // First, try Supabase Auth (for department users)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        // Supabase Auth succeeded
        await loadUser();
        return;
      }

      // Supabase Auth failed, check if it's a provider login
      console.log('🔄 Checking provider credentials...');
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id, name, login_email, provider_number, practice_name')
        .eq('login_email', email)
        .eq('login_password', password)
        .eq('is_active', true)
        .single();

      if (providerError || !provider) {
        console.error('❌ Provider login failed:', providerError);
        throw new Error('Invalid email or password');
      }

      // Provider login successful - create custom session
      console.log('✅ Provider login successful:', provider);
      const nameParts = provider.name.split(' ');
      const providerUser: User = {
        id: provider.id, // Use provider ID directly
        email: provider.login_email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        roles: ['provider'],
        permissions: [],
      };

      // Store provider session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('provider_session', JSON.stringify({
          provider: providerUser,
          timestamp: Date.now()
        }));
      }

      setUser(providerUser);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Clear provider session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('provider_session');
      }
      
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
