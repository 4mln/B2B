import { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  currency_type?: string;
  lastUpdated?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  currency_type: string;
  status: 'active' | 'frozen' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface CreateWalletRequest {
  user_id: string;
  currency: string;
  initial_balance?: number;
}

export interface DepositRequest {
  wallet_id: string;
  amount: number;
  currency: string;
  description?: string;
  payment_method?: string;
}

export interface WithdrawalRequest {
  wallet_id: string;
  amount: number;
  currency: string;
  description?: string;
  bank_account?: {
    account_number: string;
    bank_name: string;
    account_holder_name: string;
  };
}

export interface TransferRequest {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface TransactionFilters {
  type?: 'credit' | 'debit';
  status?: 'completed' | 'pending' | 'failed';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Response type helpers
export type WalletResponse = AxiosResponse<Wallet>;
export type WalletListResponse = AxiosResponse<Wallet[]>;
export type TransactionListResponse = AxiosResponse<Transaction[]>;
export type BalanceResponse = AxiosResponse<WalletBalance>;