import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from './profileApi';
import { UserProfile, ProfileUpdate } from './types';

/**
 * Profile Hooks
 * React hooks to manage profile state and API interactions
 * Provides centralized state management for profile functionality
 */
export const useProfileHooks = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch profile');
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 300000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update profile');
    },
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photo: FormData) => {
      const response = await profileApi.uploadPhoto(photo);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to upload photo');
    },
    onSuccess: (data) => {
      if (profile) {
        setProfile({ ...profile, photo: data.photoUrl });
      }
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await profileApi.deletePhoto();
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Failed to delete photo');
    },
    onSuccess: () => {
      if (profile) {
        setProfile({ ...profile, photo: undefined });
      }
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await profileApi.changePassword(data);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Failed to change password');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await profileApi.enable2FA();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to enable 2FA');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (data: { code: string }) => {
      const response = await profileApi.disable2FA(data);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Failed to disable 2FA');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Update profile
  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    return updateProfileMutation.mutateAsync(data);
  }, [updateProfileMutation]);

  // Upload photo
  const uploadPhoto = useCallback(async (photo: FormData) => {
    return uploadPhotoMutation.mutateAsync(photo);
  }, [uploadPhotoMutation]);

  // Delete photo
  const deletePhoto = useCallback(async () => {
    return deletePhotoMutation.mutateAsync();
  }, [deletePhotoMutation]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  }, [changePasswordMutation]);

  // Enable 2FA
  const enable2FA = useCallback(async () => {
    return enable2FAMutation.mutateAsync();
  }, [enable2FAMutation]);

  // Disable 2FA
  const disable2FA = useCallback(async (code: string) => {
    return disable2FAMutation.mutateAsync({ code });
  }, [disable2FAMutation]);

  // Refresh profile
  const refreshProfile = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(
      profileLoading || 
      updateProfileMutation.isPending || 
      uploadPhotoMutation.isPending || 
      deletePhotoMutation.isPending ||
      changePasswordMutation.isPending ||
      enable2FAMutation.isPending ||
      disable2FAMutation.isPending
    );
  }, [
    profileLoading,
    updateProfileMutation.isPending,
    uploadPhotoMutation.isPending,
    deletePhotoMutation.isPending,
    changePasswordMutation.isPending,
    enable2FAMutation.isPending,
    disable2FAMutation.isPending,
  ]);

  // Update error state
  useEffect(() => {
    if (profileError) {
      setError(profileError.message);
    }
  }, [profileError]);

  return {
    // State
    profile,
    loading,
    error,
    
    // Actions
    updateProfile,
    uploadPhoto,
    deletePhoto,
    changePassword,
    enable2FA,
    disable2FA,
    refreshProfile,
    clearError,
    
    // Mutation states
    isUpdating: updateProfileMutation.isPending,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    isDeletingPhoto: deletePhotoMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isEnabling2FA: enable2FAMutation.isPending,
    isDisabling2FA: disable2FAMutation.isPending,
  };
};

/**
 * Hook for managing a specific user profile
 */
export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: profileData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['profile', 'user', userId],
    queryFn: async () => {
      const response = await profileApi.getUserProfile(userId);
      if (response.success && response.data) {
        setProfile(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user profile');
    },
    enabled: !!userId,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    profile,
    loading,
    error,
  };
};

/**
 * Hook for profile analytics
 */
export const useProfileAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analyticsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['profile', 'analytics', period],
    queryFn: async () => {
      const response = await profileApi.getAccountAnalytics(period);
      if (response.success && response.data) {
        setAnalytics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch analytics');
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    analytics,
    loading,
    error,
  };
};

/**
 * Hook for KYC status
 */
export const useKYCStatus = () => {
  const [kycStatus, setKYCStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: kycData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['profile', 'kyc'],
    queryFn: async () => {
      const response = await profileApi.getKYCStatus();
      if (response.success && response.data) {
        setKYCStatus(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch KYC status');
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    kycStatus,
    loading,
    error,
  };
};

export default useProfileHooks;
