import apiClient from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

// Types
export interface LoginRequest {
  phone: string;
  device_id: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp_code: string;
  device_id: string;
  device_type?: string;
  device_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
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
  device: {
    id: string;
    type: string;
    name?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
  device_id: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
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

// Device management utilities
const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      deviceId = uuid.v4() as string;
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    // Fallback to generating a new device ID
    return uuid.v4() as string;
  }
};

const getDeviceType = (): string => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return 'mobile';
  }
  return 'web';
};

const getDeviceName = (): string => {
  return `${Platform.OS} ${Platform.Version}`;
};

// Token storage utilities
const storeTokens = async (tokens: { access_token: string; refresh_token: string }): Promise<void> => {
  try {
    // Standardize on auth_token/refresh_token; also mirror access_token for backward compatibility
    await SecureStore.setItemAsync('auth_token', tokens.access_token);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
    try { await SecureStore.setItemAsync('access_token', tokens.access_token); } catch {}
  } catch (error) {
    console.error('Failed to store tokens:', error);
  }
};

const getStoredTokens = async (): Promise<{ access_token: string | null; refresh_token: string | null }> => {
  try {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    return { access_token: accessToken, refresh_token: refreshToken };
  } catch (error) {
    console.error('Failed to get stored tokens:', error);
    return { access_token: null, refresh_token: null };
  }
};

const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

// Auth service functions
export const authService = {
  /**
   * Send OTP to phone number
   */
  async sendOTP(data: { phone: string }): Promise<ApiResponse<{ detail: string; bypass_code?: string }>> {
    const deviceId = await getDeviceId();
    
    // Debug logging
    console.log('🔍 DEBUG: EXPO_PUBLIC_BYPASS_OTP value:', process.env.EXPO_PUBLIC_BYPASS_OTP);
    console.log('🔍 DEBUG: typeof EXPO_PUBLIC_BYPASS_OTP:', typeof process.env.EXPO_PUBLIC_BYPASS_OTP);
    console.log('🔍 DEBUG: EXPO_PUBLIC_BYPASS_OTP === "true":', process.env.EXPO_PUBLIC_BYPASS_OTP === 'true');
    console.log('🔍 DEBUG: EXPO_PUBLIC_BYPASS_OTP === "1":', process.env.EXPO_PUBLIC_BYPASS_OTP === '1');
    
    // Temporary bypass for OTP during production phase
    // Set EXPO_PUBLIC_BYPASS_OTP=true to skip real OTP requests
    if (process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || process.env.EXPO_PUBLIC_BYPASS_OTP === '1') {
      console.log('✅ BYPASS: OTP bypass is enabled, returning bypass response');
      return {
        data: { 
          detail: 'OTP bypass enabled',
          bypass_code: '000000'
        },
        success: true,
      };
    }
    
    console.log('❌ BYPASS: OTP bypass is disabled, making real API call');
    
    try {
      // v2 endpoint with device binding
      const response = await apiClient.post('/auth/request-otp', {
        phone: data.phone,
        device_id: deviceId
      });
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
  async verifyOTP(data: { phone: string; otp: string }): Promise<ApiResponse<AuthResponse>> {
    const deviceId = await getDeviceId();
    const deviceType = getDeviceType();
    const deviceName = getDeviceName();
    
    // Debug logging
    console.log('🔍 DEBUG VERIFY: EXPO_PUBLIC_BYPASS_OTP value:', process.env.EXPO_PUBLIC_BYPASS_OTP);
    console.log('🔍 DEBUG VERIFY: OTP code received:', data.otp);
    console.log('🔍 DEBUG VERIFY: OTP code length:', data.otp?.length);
    
    // Bypass only after OTP step: if enabled, accept any 6-digit OTP as valid
    if (process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || process.env.EXPO_PUBLIC_BYPASS_OTP === '1') {
      console.log('✅ BYPASS VERIFY: OTP bypass is enabled, checking code length');
      const code = String(data.otp || '').trim();
      if (code.length === 6) {
        console.log('✅ BYPASS VERIFY: Code length is 6, making real API call with bypass OTP');
        
        try {
          // Make a real API call to v2 with the bypass OTP code "000000"
          const response = await apiClient.post('/auth/verify-otp', {
            phone: data.phone,
            otp_code: '000000',
            device_id: deviceId,
            device_type: deviceType,
            device_name: deviceName
          });
          
          // Store tokens securely
          await storeTokens({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
          });
          
          console.log('🔍 BYPASS VERIFY: Real API call successful:', response.data);
          return {
            data: response.data,
            success: true,
          };
        } catch (error: any) {
          console.log('⚠️ BYPASS VERIFY: Backend doesn\'t support bypass, falling back to fake tokens');
          console.error('Backend error:', error.response?.data || error.message);
          
          // Fallback to fake tokens if backend doesn't support bypass
          const fakeNow = new Date().toISOString();
          const fakeTokens = {
            access_token: 'bypass-access-token',
            refresh_token: 'bypass-refresh-token'
          };
          await storeTokens(fakeTokens);
          
          const bypassResponse = {
            data: {
              access_token: fakeTokens.access_token,
              refresh_token: fakeTokens.refresh_token,
              token_type: 'bearer',
              expires_in: 900, // 15 minutes
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
              device: {
                id: deviceId,
                type: deviceType,
                name: deviceName
              }
            },
            success: true,
          };
          
          console.log('🔍 BYPASS VERIFY: Returning fallback response:', bypassResponse);
          return bypassResponse;
        }
      } else {
        console.log('❌ BYPASS VERIFY: Code length is not 6, code:', code, 'length:', code.length);
        return {
          error: 'Please enter a 6-digit OTP code',
          success: false,
        };
      }
    }
    
    // Normal OTP verification flow (only runs if bypass is disabled)
    console.log('❌ BYPASS VERIFY: OTP bypass is disabled, making real API call');
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        phone: data.phone,
        otp_code: data.otp,
        device_id: deviceId,
        device_type: deviceType,
        device_name: deviceName
      });
      
      // Store tokens securely
      await storeTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token
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
   */
  async userExists(phone: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      const response = await apiClient.get(`/api/v1/auth/exists`, { params: { phone } });
      // Backend returns {exists: boolean, phone_exists: boolean, national_id_exists: boolean}
      // We need to map it to {exists: boolean} for frontend compatibility
      return { 
        data: { exists: response.data.exists || false }, 
        success: true 
      };
    } catch (error: any) {
      return { data: { exists: false }, error: 'Failed to check user', success: false };
    }
  },

  async phoneOrNationalIdExists(phone: string, nationalId: string): Promise<ApiResponse<{ exists: boolean; phone_exists: boolean; national_id_exists: boolean }>> {
    try {
      const response = await apiClient.get(`/api/v1/auth/exists`, { params: { phone, national_id: nationalId } });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { data: { exists: false, phone_exists: false, national_id_exists: false }, error: 'Failed to check identity', success: false };
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const { refresh_token } = await getStoredTokens();
      if (!refresh_token) {
        return {
          error: 'No refresh token available',
          success: false,
        };
      }
      
      const deviceId = await getDeviceId();
      const response = await apiClient.post('/auth/refresh', {
        refresh_token,
        device_id: deviceId
      });
      
      // Store new tokens
      await storeTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token
      });
      
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      // If refresh fails, clear tokens
      await clearTokens();
      return {
        error: error.response?.data?.detail || 'Failed to refresh token',
        success: false,
      };
    }
  },

  /**
   * Auto-refresh token if needed
   */
  async autoRefreshToken(): Promise<boolean> {
    try {
      const { access_token, refresh_token } = await getStoredTokens();
      if (!access_token || !refresh_token) {
        return false;
      }
      
      // Check if access token is expired (basic check)
      const tokenParts = access_token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }
      
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // If token expires in less than 5 minutes, refresh it
        if (payload.exp - now < 300) {
          const result = await this.refreshToken();
          return result.success;
        }
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('Auto refresh failed:', error);
      return false;
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<AuthResponse['user']>> {
    try {
      const response = await apiClient.get('/users/me/profile');
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
      const response = await apiClient.get('/users/me/profile');
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
      const response = await apiClient.patch('/users/me/profile', data);
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
   * Logout user from current device
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const { refresh_token } = await getStoredTokens();
      const deviceId = await getDeviceId();
      
      if (refresh_token) {
        await apiClient.post('/auth/logout', {
          refresh_token,
          device_id: deviceId
        });
      }
      
      // Clear stored tokens
      await clearTokens();
      
      return {
        success: true,
      };
    } catch (error: any) {
      // Clear tokens even if logout request fails
      await clearTokens();
      return {
        error: error.response?.data?.detail || 'Failed to logout',
        success: false,
      };
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/auth/logout-all?user_id=${userId}`);
      
      // Clear stored tokens
      await clearTokens();
      
      return {
        success: true,
      };
    } catch (error: any) {
      // Clear tokens even if logout request fails
      await clearTokens();
      return {
        error: error.response?.data?.detail || 'Failed to logout from all devices',
        success: false,
      };
    }
  },

  /**
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get(`/auth/devices?user_id=${userId}`);
      return {
        data: response.data.devices,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to get devices',
        success: false,
      };
    }
  },

  /**
   * Revoke specific device
   */
  async revokeDevice(userId: string, deviceId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/auth/revoke-device?user_id=${userId}&device_id=${deviceId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to revoke device',
        success: false,
      };
    }
  },

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<ApiResponse<{ detail: string }>> {
    try {
      const response = await apiClient.post('/api/v1/auth/signup', data);
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

