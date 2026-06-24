'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  authUserId?: string;
  doctorSurname?: string;
  practiceName?: string;
  providerNumber?: string;
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

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function persistAuthSession(session: { access_token: string; refresh_token?: string | null }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }
}

function clearStoredAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function buildProviderUser(input: {
  id: string;
  email: string;
  name?: string | null;
  doctorSurname?: string | null;
  practiceName?: string | null;
  providerNumber?: string | null;
  authUserId?: string;
}): User {
  const displayName = (input.name || input.practiceName || input.email || '')
    .replace(/\s+/g, ' ')
    .trim();
  const nameParts = displayName.split(' ').filter(Boolean);

  return {
    id: input.id,
    email: input.email,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    roles: ['provider'],
    permissions: [],
    authUserId: input.authUserId,
    doctorSurname: input.doctorSurname || undefined,
    practiceName: input.practiceName || undefined,
    providerNumber: input.providerNumber || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    console.log('Loading user...');
    setLoading(true);
    let cachedProvider: User | null = null;

    try {
      if (typeof window !== 'undefined') {
        const providerSession = localStorage.getItem('provider_session');
        if (providerSession) {
          const { provider, timestamp } = JSON.parse(providerSession);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            console.log('Provider session found');
            cachedProvider = provider;
          } else {
            localStorage.removeItem('provider_session');
          }
        }
      }

      let accessToken = getStoredAccessToken();

      if (!accessToken) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!sessionError && session?.access_token) {
          accessToken = session.access_token;
          persistAuthSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      }

      if (!accessToken) {
        console.log('No active session');
        if (cachedProvider) {
          setUser(cachedProvider);
          setLoading(false);
          return;
        }
        setUser(null);
        setLoading(false);
        return;
      }

      const authResponse = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!authResponse.ok) {
        clearStoredAuthSession();
        if (cachedProvider) {
          setUser(cachedProvider);
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      const authData = await authResponse.json();
      const authenticatedUser = authData.user;

      if (authenticatedUser?.isProvider) {
        const transformedUser = buildProviderUser({
          id: authenticatedUser.providerId || authenticatedUser.id,
          email: authenticatedUser.email || '',
          name: authenticatedUser.providerName || '',
          doctorSurname: authenticatedUser.doctorSurname || '',
          practiceName: authenticatedUser.practiceName,
          providerNumber: authenticatedUser.providerNumber,
          authUserId: authenticatedUser.id,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'provider_session',
            JSON.stringify({
              provider: transformedUser,
              timestamp: Date.now(),
            })
          );
        }

        setUser(transformedUser);
        setLoading(false);
        return;
      }

      setUser({
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        firstName: '',
        lastName: '',
        roles: authenticatedUser.roles || [],
        permissions: authenticatedUser.permissions || [],
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(cachedProvider);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.session?.access_token) {
        throw new Error(data.error || 'Invalid email or password');
      }

      persistAuthSession(data.session);
      await loadUser();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('provider_session');
      }

      clearStoredAuthSession();
      setUser(null);

      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase browser sign-out skipped:', error);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('member_session');
        localStorage.removeItem('member_data');
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
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

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