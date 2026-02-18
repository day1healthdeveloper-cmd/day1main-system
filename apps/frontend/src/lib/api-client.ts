/**
 * API Client for Day1Main Backend
 * 
 * Handles authentication, token refresh, and API requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    // Load tokens from localStorage on initialization (client-side only)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    // Reload from localStorage if not set (handles SSR/client hydration)
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        
        // Backend returns snake_case, convert to camelCase
        const tokens = {
          accessToken: data.access_token || data.accessToken,
          refreshToken: data.refresh_token || data.refreshToken,
        };
        
        this.setTokens(tokens);
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Reload tokens from localStorage if not set (handles SSR/client hydration)
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Add authorization header if authenticated
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();

        // Retry the request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        // Refresh failed, clear tokens and throw
        this.clearTokens();
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    // Handle non-OK responses
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
      }));

      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Login
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.post<any>('/auth/login', {
      email,
      password,
    });

    // Backend returns snake_case, convert to camelCase
    const tokens: AuthTokens = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };

    this.setTokens(tokens);
    return tokens;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout', {});
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthTokens> {
    const response = await this.post<AuthTokens>('/auth/register', data);
    this.setTokens(response);
    return response;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.get<any>('/auth/me');
    
    // Transform backend structure to frontend structure
    return {
      id: response.id,
      email: response.email,
      firstName: response.profile?.first_name || '',
      lastName: response.profile?.last_name || '',
      roles: response.roles || [],
      permissions: response.permissions || [],
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
