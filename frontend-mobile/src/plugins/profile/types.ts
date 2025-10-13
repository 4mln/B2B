/**
 * Profile Plugin Types
 * TypeScript interfaces for profile functionality
 * Aligns with backend auth plugin schemas
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  photo?: string;
  businessName?: string;
  businessIndustry?: string;
  businessDescription?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessPhone?: string;
  kycStatus?: string;
  isPublic: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newMessages: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  fullName?: string;
  phone?: string;
  businessName?: string;
  businessIndustry?: string;
  businessDescription?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessPhone?: string;
  isPublic?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  orderUpdates?: boolean;
  priceAlerts?: boolean;
  newMessages?: boolean;
}

export interface BusinessProfileUpdate {
  businessName?: string;
  businessIndustry?: string;
  businessDescription?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export interface KYCVerificationRequest {
  documentType: string;
  documentNumber: string;
  documentImage: string;
  additionalDocuments?: string[];
  country: string;
  address: string;
  dateOfBirth: string;
}

export interface KYCVerificationResponse {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents: Array<{
    type: string;
    status: string;
    submittedAt: string;
  }>;
}

export interface PrivacySettings {
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showBusinessInfo: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newMessages: boolean;
  rfqUpdates: boolean;
  quoteUpdates: boolean;
  walletUpdates: boolean;
  securityAlerts: boolean;
}

export interface TwoFASetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFAVerification {
  code: string;
  backupCode?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountAnalytics {
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
  deviceInfo: Array<{
    device: string;
    lastUsed: string;
    location: string;
  }>;
  securityEvents: Array<{
    type: string;
    timestamp: string;
    description: string;
  }>;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

export interface ProfileChange {
  id: string;
  userId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  reason?: string;
  createdAt: string;
}

export interface UserExport {
  downloadUrl: string;
  expiresAt: string;
  includes: string[];
  size: number;
  format: 'json' | 'csv' | 'pdf';
}

export interface AccountDeletion {
  password: string;
  reason: string;
  feedback?: string;
  confirmDeletion: boolean;
}

export interface ProfileSettings {
  defaultCurrency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    allowedIPs: string[];
    requireApprovalForSensitiveActions: boolean;
  };
}

export interface ProfileStats {
  totalProfileViews: number;
  monthlyProfileViews: number;
  responseRate: number;
  averageResponseTime: number;
  profileCompleteness: number;
  verificationLevel: number;
  trustScore: number;
  lastUpdated: string;
}

export interface ProfileActivity {
  id: string;
  type: 'login' | 'profile_update' | 'photo_upload' | 'verification' | 'password_change';
  description: string;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
}

export interface ProfileNotification {
  id: string;
  type: 'profile_view' | 'verification_update' | 'security_alert' | 'privacy_change';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Profile state types
export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  analytics: AccountAnalytics | null;
  settings: ProfileSettings | null;
  stats: ProfileStats | null;
  activities: ProfileActivity[];
  notifications: ProfileNotification[];
  unreadNotifications: number;
  sessions: UserSession[];
  kycStatus: KYCVerificationResponse | null;
}

export interface ProfileActions {
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: ProfileUpdate) => void;
  uploadPhoto: (photo: FormData) => void;
  deletePhoto: () => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
  enable2FA: () => void;
  disable2FA: (code: string) => void;
  updateBusinessProfile: (updates: BusinessProfileUpdate) => void;
  updatePrivacySettings: (settings: PrivacySettings) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  requestKYCVerification: (data: KYCVerificationRequest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalytics: (analytics: AccountAnalytics | null) => void;
  setSettings: (settings: ProfileSettings) => void;
  setStats: (stats: ProfileStats | null) => void;
  addActivity: (activity: ProfileActivity) => void;
  addNotification: (notification: ProfileNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  setSessions: (sessions: UserSession[]) => void;
  setKYCStatus: (status: KYCVerificationResponse | null) => void;
  clearError: () => void;
  resetState: () => void;
}

export default {};
