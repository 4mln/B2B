export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

export interface LoginRequest {
  phone: string;
  is_signup?: boolean;
}

export interface ProfileResponse extends User {
  business_name?: string;
  business_type?: string;
  address?: string;
  kyc_status?: 'pending' | 'approved' | 'rejected';
  capabilities: string[];
}