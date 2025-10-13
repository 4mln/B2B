import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useProfileHooks } from './profileHooks';
import { profileStyles } from './profileStyles';
import { UserProfile, ProfileUpdate } from './types';

/**
 * Profile Screen Component
 * Main profile interface for viewing and editing user profile
 * Aligns with backend /auth endpoints
 */
interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileUpdate>({});
  
  const {
    profile,
    loading,
    error,
    updateProfile,
    uploadPhoto,
    refreshProfile,
    clearError,
  } = useProfileHooks();

  type ProfileFormValues = {
    fullName: string;
    phone: string;
    businessName?: string;
    businessIndustry?: string;
  };

  const profileSchema = yup.object({
    fullName: yup
      .string()
      .trim()
      .min(2, t('signup.errors.firstNameTooShort'))
      .optional(),
    phone: yup
      .string()
      .trim()
      .matches(/^\+?\d{7,15}$/,
        { message: t('signup.errors.invalidPhone'), excludeEmptyString: true }
      )
      .optional(),
    businessName: yup.string().optional(),
    businessIndustry: yup.string().optional(),
  });

  const { control, handleSubmit, formState: { errors }, getValues, reset } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      businessName: '',
      businessIndustry: '',
    },
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const values = getValues();
      await updateProfile({ ...editData, ...values });
      Alert.alert(t('common.done'), t('profile.updated', 'Profile updated successfully'));
      setIsEditing(false);
      setEditData({});
      reset();
      refreshProfile();
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('profile.updateFailed', 'Failed to update profile'));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    try {
      // In a real app, this would open image picker
      Alert.alert(t('profile.photoUpload', 'Photo Upload'), t('profile.photoUploadInfo', 'Photo upload functionality would be implemented here'));
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('profile.photoUploadFailed', 'Failed to upload photo'));
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof ProfileUpdate, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading && !profile) {
    return (
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={profileStyles.loadingText}>{t('profile.loading', 'Loading profile...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={profileStyles.errorContainer}>
        <Text style={profileStyles.errorText}>{error || t('errors.unknownError')}</Text>
        <TouchableOpacity style={profileStyles.retryButton} onPress={refreshProfile}>
          <Text style={profileStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={profileStyles.errorContainer}>
        <Text style={profileStyles.errorText}>{t('profile.notFound', 'Profile not found')}</Text>
        <TouchableOpacity style={profileStyles.retryButton} onPress={refreshProfile}>
          <Text style={profileStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
      {/* Header */}
      <View style={profileStyles.header}>
        <TouchableOpacity onPress={onBack} style={profileStyles.backButton}>
          <Text style={profileStyles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>{t('profile.title')}</Text>
        <TouchableOpacity 
          style={profileStyles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={profileStyles.editButtonText}>
            {isEditing ? t('common.cancel') : t('common.edit')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Photo Section */}
      <View style={profileStyles.photoSection}>
        <View style={profileStyles.photoContainer}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={profileStyles.photo} />
          ) : (
            <View style={profileStyles.photoPlaceholder}>
              <Text style={profileStyles.photoPlaceholderText}>
                {profile.fullName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity 
              style={profileStyles.photoEditButton}
              onPress={handlePhotoUpload}
            >
              <Text style={profileStyles.photoEditButtonText}>📷</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={profileStyles.userName}>
          {profile.fullName || t('profile.userName', 'User Name')}
        </Text>
        <Text style={profileStyles.userEmail}>
          {profile.email}
        </Text>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>{t('profile.personalInformation', 'Personal Information')}</Text>
        
        {/* Full Name */}
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.fullName', 'Full Name')}</Text>
          {isEditing ? (
            <>
              <Controller
                control={control}
                name="fullName"
                defaultValue={editData.fullName || profile.fullName || ''}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={profileStyles.fieldInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder={t('profile.enterFullName', 'Enter your full name')}
                  />
                )}
              />
              {!!errors.fullName?.message && (
                <Text style={{ color: '#FF3B30', marginTop: 4 }}>{String(errors.fullName.message)}</Text>
              )}
            </>
          ) : (
            <Text style={profileStyles.fieldValue}>
              {profile.fullName || t('profile.notProvided', 'Not provided')}
            </Text>
          )}
        </View>

        {/* Email */}
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.email', 'Email')}</Text>
          <Text style={profileStyles.fieldValue}>
            {profile.email}
          </Text>
        </View>

        {/* Phone */}
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.phone', 'Phone')}</Text>
          {isEditing ? (
            <>
              <Controller
                control={control}
                name="phone"
                defaultValue={editData.phone || profile.phone || ''}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={profileStyles.fieldInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder={t('profile.enterPhone', 'Enter your phone number')}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {!!errors.phone?.message && (
                <Text style={{ color: '#FF3B30', marginTop: 4 }}>{String(errors.phone.message)}</Text>
              )}
            </>
          ) : (
            <Text style={profileStyles.fieldValue}>
              {profile.phone || t('profile.notProvided', 'Not provided')}
            </Text>
          )}
        </View>

        {/* Role */}
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.role', 'Role')}</Text>
          <Text style={profileStyles.fieldValue}>
            {profile.role || t('profile.user', 'User')}
          </Text>
        </View>
      </View>

      {/* Business Information */}
      {profile.businessName && (
        <View style={profileStyles.infoSection}>
          <Text style={profileStyles.sectionTitle}>{t('profile.businessInformation', 'Business Information')}</Text>
          
          {/* Business Name */}
          <View style={profileStyles.fieldContainer}>
            <Text style={profileStyles.fieldLabel}>{t('profile.businessName', 'Business Name')}</Text>
            {isEditing ? (
              <Controller
                control={control}
                name="businessName"
                defaultValue={editData.businessName || profile.businessName || ''}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={profileStyles.fieldInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder={t('profile.enterBusinessName', 'Enter your business name')}
                  />
                )}
              />
            ) : (
              <Text style={profileStyles.fieldValue}>
                {profile.businessName}
              </Text>
            )}
          </View>

          {/* Business Industry */}
          {profile.businessIndustry && (
            <View style={profileStyles.fieldContainer}>
              <Text style={profileStyles.fieldLabel}>{t('profile.industry', 'Industry')}</Text>
              {isEditing ? (
                <Controller
                  control={control}
                  name="businessIndustry"
                  defaultValue={editData.businessIndustry || profile.businessIndustry || ''}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={profileStyles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      placeholder={t('profile.enterBusinessIndustry', 'Enter your business industry')}
                    />
                  )}
                />
              ) : (
                <Text style={profileStyles.fieldValue}>
                  {profile.businessIndustry}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* KYC Status */}
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>{t('profile.verificationStatus', 'Verification Status')}</Text>
        
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.kycStatus', 'KYC Status')}</Text>
          <View style={[
            profileStyles.statusBadge,
            profileStyles.statusBadgeVerified
          ]}>
            <Text style={profileStyles.statusText}>
              {profile.kycStatus || t('profile.notVerified', 'Not verified')}
            </Text>
          </View>
        </View>

        {profile.isVerified && (
          <View style={profileStyles.fieldContainer}>
            <Text style={profileStyles.fieldLabel}>{t('profile.verification', 'Verification')}</Text>
            <View style={[
              profileStyles.statusBadge,
              profileStyles.statusBadgeVerified
            ]}>
              <Text style={profileStyles.statusText}>{t('profile.verified', 'Verified ✓')}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Privacy Settings */}
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>{t('profile.privacy', 'Privacy Settings')}</Text>
        
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.visibility', 'Profile Visibility')}</Text>
          <Text style={profileStyles.fieldValue}>
            {profile.isPublic ? t('profile.public', 'Public') : t('profile.private', 'Private')}
          </Text>
        </View>

        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>{t('profile.emailNotifications', 'Email Notifications')}</Text>
          <Text style={profileStyles.fieldValue}>
            {profile.emailNotifications ? t('profile.enabled', 'Enabled') : t('profile.disabled', 'Disabled')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {isEditing && (
        <View style={profileStyles.actionButtons}>
          <TouchableOpacity
            style={[profileStyles.actionButton, profileStyles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              setEditData({});
            }}
          >
            <Text style={profileStyles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[profileStyles.actionButton, profileStyles.saveButton]}
            onPress={handleUpdateProfile}
          >
            <Text style={profileStyles.saveButtonText}>{t('profile.saveChanges', 'Save Changes')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Additional Actions */}
      <View style={profileStyles.additionalActions}>
        <TouchableOpacity style={profileStyles.additionalActionButton}>
          <Text style={profileStyles.additionalActionIcon}>🔒</Text>
          <Text style={profileStyles.additionalActionText}>{t('profile.changePassword', 'Change Password')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={profileStyles.additionalActionButton}>
          <Text style={profileStyles.additionalActionIcon}>🔔</Text>
          <Text style={profileStyles.additionalActionText}>{t('profile.notificationSettings', 'Notification Settings')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={profileStyles.additionalActionButton}>
          <Text style={profileStyles.additionalActionIcon}>📊</Text>
          <Text style={profileStyles.additionalActionText}>{t('profile.accountAnalytics', 'Account Analytics')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={profileStyles.additionalActionButton}>
          <Text style={profileStyles.additionalActionIcon}>❌</Text>
          <Text style={profileStyles.additionalActionText}>{t('profile.deleteAccount', 'Delete Account')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
