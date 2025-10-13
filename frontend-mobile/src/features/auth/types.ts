export interface User {
  id: string;
  unique_id: string;
  email?: string;
  username?: string;
  name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  capabilities: string[];
  business_name?: string;
  business_description?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  company?: string;
  role?: 'buyer' | 'seller' | 'both';
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  phone: string;
  is_signup?: boolean;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Capability checking utility
export const hasCapability = (user: User | null, capability: string): boolean => {
  return user?.capabilities?.includes(capability) || false;
};

// Common capabilities
export const CAPABILITIES = {
  CAN_PURCHASE: 'can_purchase',
  CAN_SELL: 'can_sell',
  CAN_MANAGE_STORE: 'can_manage_store',
  CAN_MANAGE_PRODUCTS: 'can_manage_products',
  CAN_MANAGE_ORDERS: 'can_manage_orders',
  CAN_MANAGE_RFQ: 'can_manage_rfq',
  CAN_MANAGE_WALLET: 'can_manage_wallet',
  CAN_MANAGE_CHAT: 'can_manage_chat',
  CAN_MANAGE_NOTIFICATIONS: 'can_manage_notifications',
  CAN_MANAGE_ANALYTICS: 'can_manage_analytics',
  CAN_MANAGE_ADMIN: 'can_manage_admin',
} as const;

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];
