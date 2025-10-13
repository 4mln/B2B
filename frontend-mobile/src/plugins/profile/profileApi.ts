import apiClient from '@/services/api';
import { 
  UserProfile, 
  ProfileUpdate, 
  ApiResponse 
} from './types';

/**
 * Profile API Service
 * Centralized API calls to backend /auth endpoints
 * Aligns with backend plugin structure
 */
export const profileApi = {
  /**
   * Get current user profile
   * Backend endpoint: GET /auth/me
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.get('/auth/me');
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
   * Update user profile
   * Backend endpoint: PUT /auth/me
   */
  async updateProfile(data: ProfileUpdate): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put('/auth/me', data);
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
   * Upload profile photo
   * Backend endpoint: POST /auth/me/photo
   */
  async uploadPhoto(photo: FormData): Promise<ApiResponse<{ photoUrl: string }>> {
    try {
      const response = await apiClient.post('/auth/me/photo', photo, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to upload photo',
        success: false,
      };
    }
  },

  /**
   * Delete profile photo
   * Backend endpoint: DELETE /auth/me/photo
   */
  async deletePhoto(): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete('/auth/me/photo');
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete photo',
        success: false,
      };
    }
  },

  /**
   * Get user profile by ID
   * Backend endpoint: GET /auth/users/{user_id}
   */
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.get(`/auth/users/${userId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch user profile',
        success: false,
      };
    }
  },

  /**
   * Update business profile
   * Backend endpoint: PUT /auth/me/business
   */
  async updateBusinessProfile(data: {
    businessName?: string;
    businessIndustry?: string;
    businessDescription?: string;
    businessWebsite?: string;
    businessAddress?: string;
    businessPhone?: string;
  }): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put('/auth/me/business', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update business profile',
        success: false,
      };
    }
  },

  /**
   * Request KYC verification
   * Backend endpoint: POST /auth/kyc/request
   */
  async requestKYCVerification(data: {
    documentType: string;
    documentNumber: string;
    documentImage: string;
    additionalDocuments?: string[];
  }): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/auth/kyc/request', data);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to request KYC verification',
        success: false,
      };
    }
  },

  /**
   * Get KYC status
   * Backend endpoint: GET /auth/kyc/status
   */
  async getKYCStatus(): Promise<ApiResponse<{
    status: string;
    submittedAt?: string;
    reviewedAt?: string;
    documents: Array<{
      type: string;
      status: string;
      submittedAt: string;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/auth/kyc/status');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch KYC status',
        success: false,
      };
    }
  },

  /**
   * Update privacy settings
   * Backend endpoint: PUT /auth/me/privacy
   */
  async updatePrivacySettings(data: {
    isPublic?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showBusinessInfo?: boolean;
  }): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put('/auth/me/privacy', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update privacy settings',
        success: false,
      };
    }
  },

  /**
   * Update notification preferences
   * Backend endpoint: PUT /auth/me/notifications
   */
  async updateNotificationPreferences(data: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    orderUpdates?: boolean;
    priceAlerts?: boolean;
    newMessages?: boolean;
  }): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put('/auth/me/notifications', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update notification preferences',
        success: false,
      };
    }
  },

  /**
   * Change password
   * Backend endpoint: POST /auth/change-password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/auth/change-password', data);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to change password',
        success: false,
      };
    }
  },

  /**
   * Enable 2FA
   * Backend endpoint: POST /auth/2fa/enable
   */
  async enable2FA(): Promise<ApiResponse<{
    qrCode: string;
    secret: string;
  }>> {
    try {
      const response = await apiClient.post('/auth/2fa/enable');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to enable 2FA',
        success: false,
      };
    }
  },

  /**
   * Disable 2FA
   * Backend endpoint: POST /auth/2fa/disable
   */
  async disable2FA(data: { code: string }): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/auth/2fa/disable', data);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to disable 2FA',
        success: false,
      };
    }
  },

  /**
   * Get account analytics
   * Backend endpoint: GET /auth/me/analytics
   */
  async getAccountAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    totalLogins: number;
    lastLogin: string;
    profileViews: number;
    accountAge: number;
    activityScore: number;
    monthlyTrends: Array<{
      month: string;
      logins: number;
      profileViews: number;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/auth/me/analytics', {
        params: { period },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch account analytics',
        success: false,
      };
    }
  },

  /**
   * Delete account
   * Backend endpoint: DELETE /auth/me
   */
  async deleteAccount(data: { password: string }): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete('/auth/me', { data });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete account',
        success: false,
      };
    }
  },

  /**
   * Export user data
   * Backend endpoint: GET /auth/me/export
   */
  async exportUserData(): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    try {
      const response = await apiClient.get('/auth/me/export');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to export user data',
        success: false,
      };
    }
  },
};

export default profileApi;
