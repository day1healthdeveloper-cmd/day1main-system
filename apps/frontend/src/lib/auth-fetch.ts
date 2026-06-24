import { supabase } from '@/lib/supabase';

const ACCESS_TOKEN_KEY = 'auth_access_token';

export async function getAuthHeaders(extraHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extraHeaders);

  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
      return headers;
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return headers;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: await getAuthHeaders(init.headers),
  });
}