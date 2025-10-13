import apiClient from './api';

// Types
export interface LoginRequest {
  phone: string;
  is_signup?: boolean;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  guildId: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface UserSession {
  id: number;
  device_id?: string;
  user_agent: string;
  ip_address?: string;
  created_at: string;
  last_seen_at?: string;
  is_revoked: boolean;
}

// Auth service functions
export const authService = {
  /**
   * Send OTP to phone number
   */
  async sendOTP(data: LoginRequest): Promise<ApiResponse<{ detail: string }>> {
    // Temporary bypass for OTP during production phase
    // Set EXPO_PUBLIC_BYPASS_OTP=true to skip real OTP requests
    if (process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || process.env.EXPO_PUBLIC_BYPASS_OTP === '1') {
      return {
        data: { detail: 'OTP bypass enabled' },
        success: true,
      };
    }
    try {
      // Use correct backend endpoint with /auth prefix
      const response = await apiClient.post('/auth/otp/request', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to send OTP',
        success: false,
      };
    }
  },

  /**
   * Verify OTP and get tokens
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<AuthResponse>> {
    // Bypass only after OTP step: if enabled, accept any 6-digit OTP as valid
    if (process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || process.env.EXPO_PUBLIC_BYPASS_OTP === '1') {
      const code = String(data.otp || '').trim();
      if (code.length === 6) {
        const fakeNow = new Date().toISOString();
        return {
          data: {
            access_token: 'bypass-access-token',
            token_type: 'bearer',
            user: {
              id: 'bypass-user',
              phone: data.phone,
              name: 'Bypass User',
              email: undefined,
              avatar: undefined,
              isVerified: true,
              createdAt: fakeNow,
              updatedAt: fakeNow,
            },
          },
          success: true,
        };
      }
    }
    try {
      const response = await apiClient.post('/auth/otp/verify', {
        phone: data.phone,
        code: data.otp,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Invalid OTP',
        success: false,
      };
    }
  },

  /**
   * Check if a user exists by phone number
   * Note: Backend OTP flow automatically creates users, so this always returns true
   * This method is kept for compatibility but doesn't make actual API calls
   */
  async userExists(phone: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      const response = await apiClient.get(`/auth/exists`, { params: { phone } });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { data: { exists: false }, error: 'Failed to check user', success: false };
    }
  },

  async phoneOrNationalIdExists(phone: string, nationalId: string): Promise<ApiResponse<{ exists: boolean; phone_exists: boolean; national_id_exists: boolean }>> {
    try {
      const response = await apiClient.get(`/auth/exists`, { params: { phone, national_id: nationalId } });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { data: { exists: false, phone_exists: false, national_id_exists: false }, error: 'Failed to check identity', success: false };
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const response = await apiClient.post('/refresh', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to refresh token',
        success: false,
      };
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<AuthResponse['user']>> {
    try {
      const response = await apiClient.get('/users/profile');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch profile',
        success: false,
      };
    }
  },

  /**
   * Get current user (basic info)
   */
  async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    try {
      const response = await apiClient.get('/users/profile');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch user',
        success: false,
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<AuthResponse['user']>> {
    try {
      const response = await apiClient.patch('/users/profile', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update profile',
        success: false,
      };
    }
  },

  /**
   * Get user capabilities
   */
  async getCapabilities(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/users/capabilities');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch capabilities',
        success: false,
      };
    }
  },

  /**
   * Update user capabilities
   */
  async updateCapabilities(capabilities: string[]): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.patch('/users/capabilities', { capabilities });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update capabilities',
        success: false,
      };
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/auth/me/sessions/logout-all');
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to logout',
        success: false,
      };
    }
  },

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<ApiResponse<{ detail: string }>> {
    try {
      const response = await apiClient.post('/auth/signup', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to signup',
        success: false,
      };
    }
  },

  /**
   * Get user sessions
   */
  async getSessions(): Promise<ApiResponse<UserSession[]>> {
    try {
      const response = await apiClient.get('/me/sessions');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to get sessions',
        success: false,
      };
    }
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: number): Promise<ApiResponse<{ detail: string }>> {
    try {
      const response = await apiClient.post(`/me/sessions/${sessionId}/revoke`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to revoke session',
        success: false,
      };
    }
  },

  /**
   * Logout from all sessions
   */
  async logoutAllSessions(): Promise<ApiResponse<{ detail: string }>> {
    try {
      const response = await apiClient.post('/me/sessions/logout-all');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to logout from all sessions',
        success: false,
      };
    }
  },
};

