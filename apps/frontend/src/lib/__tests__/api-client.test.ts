import { apiClient } from '../api-client';

describe('ApiClient', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const mockLocalStorage = global.localStorage as jest.Mocked<Storage>;

  beforeEach(() => {
    jest.clearAllMocks();
    apiClient.clearTokens();
  });

  describe('Token Management', () => {
    it('should set tokens in memory and localStorage', () => {
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      };

      apiClient.setTokens(tokens);

      expect(apiClient.getAccessToken()).toBe('access-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token-456');
    });

    it('should clear tokens from memory and localStorage', () => {
      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      apiClient.clearTokens();

      expect(apiClient.getAccessToken()).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should check if user is authenticated', () => {
      expect(apiClient.isAuthenticated()).toBe(false);

      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(apiClient.isAuthenticated()).toBe(true);
    });
  });

  describe('Authentication Flow', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.login('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(apiClient.getAccessToken()).toBe('new-access-token');
    });

    it('should logout successfully', async () => {
      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(apiClient.getAccessToken()).toBeNull();
    });

    it('should clear tokens even if logout request fails', async () => {
      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await apiClient.logout();

      expect(apiClient.getAccessToken()).toBeNull();
    });

    it('should register successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'new@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(apiClient.getAccessToken()).toBe('new-access-token');
    });

    it('should get current user', async () => {
      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await apiClient.getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
          }),
        })
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401 response', async () => {
      apiClient.setTokens({
        accessToken: 'old-access-token',
        refreshToken: 'refresh-token',
      });

      // First request returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      // Token refresh succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      } as Response);

      // Retry request succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' }),
      } as Response);

      const result = await apiClient.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(apiClient.getAccessToken()).toBe('new-access-token');
      expect(result).toEqual({ data: 'success' });
    });

    it('should clear tokens if refresh fails', async () => {
      apiClient.setTokens({
        accessToken: 'old-access-token',
        refreshToken: 'refresh-token',
      });

      // First request returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      // Token refresh fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid refresh token' }),
      } as Response);

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow(
        'Authentication failed. Please log in again.'
      );

      expect(apiClient.getAccessToken()).toBeNull();
    });

    it('should not attempt refresh if no refresh token available', async () => {
      // No tokens set

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();

      // Should only call fetch once (no refresh attempt)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      apiClient.setTokens({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should make GET request', async () => {
      const mockData = { id: 1, name: 'Test' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer access-token',
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should make POST request with data', async () => {
      const postData = { name: 'New Item' };
      const mockResponse = { id: 1, ...postData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should make PUT request with data', async () => {
      const putData = { name: 'Updated Item' };
      const mockResponse = { id: 1, ...putData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.put('/test/1', putData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putData),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE request', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Bad Request',
          statusCode: 400,
        }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('Bad Request');
    });

    it('should handle responses without JSON error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Request failed with status 500'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('Authorization Header', () => {
    it('should include Authorization header when authenticated', async () => {
      apiClient.setTokens({
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when not authenticated', async () => {
      // No tokens set

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Record<string, string>;

      expect(headers.Authorization).toBeUndefined();
    });
  });
});
