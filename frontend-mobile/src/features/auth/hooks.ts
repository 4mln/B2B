import '@/polyfills/web';
import { authService } from '@/services/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './store';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, setLoading, setError, clearError, approved } = useAuthStore();

  return {
    user,
    isAuthenticated,
    approved,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError,
    clearError,
  };
};

export const useSendOTP = () => {
  return useMutation({
    mutationFn: authService.sendOTP,
    onError: (error: any) => {
      console.error('Send OTP error:', error);
    },
  });
};

export const useVerifyOTP = () => {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: async (response) => {
      if (response.success && response.data) {
        // Backend returns { access_token, token_type, user }
        await login(response.data.user, response.data.access_token);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
    onError: (error: any) => {
      console.error('Verify OTP error:', error);
    },
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch profile');
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update profile');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
    },
  });
};
