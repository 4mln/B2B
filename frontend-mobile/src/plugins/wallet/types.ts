/**
 * Wallet Plugin Types
 * TypeScript interfaces for wallet functionality
 * Aligns with backend wallet plugin schemas
 */

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  currencyType: 'fiat' | 'crypto';
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'cashback' | 'fee';
  reference?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  recipientId?: string;
  senderId?: string;
}

export interface CreateWalletRequest {
  userId: string;
  currency: string;
  currencyType: 'fiat' | 'crypto';
}

export interface UpdateWalletRequest {
  isActive?: boolean;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
}

export interface WithdrawalRequest {
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
}

export interface TransferRequest {
  amount: number;
  currency: string;
  recipientId: string;
  description?: string;
}

export interface WalletBalance {
  currency: string;
  balance: number;
  currencyType: 'fiat' | 'crypto';
}

export interface UserWallets {
  userId: string;
  wallets: WalletBalance[];
}

export interface WalletAnalytics {
  walletId: string;
  period: 'day' | 'week' | 'month' | 'year';
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  netBalance: number;
  transactionCount: number;
  averageTransactionAmount: number;
  startDate: string;
  endDate: string;
}

export interface TransactionFilters {
  transactionType?: 'deposit' | 'withdrawal' | 'transfer' | 'cashback' | 'fee';
  status?: 'pending' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

export interface SupportedCurrency {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
  symbol: string;
  decimals: number;
  isActive: boolean;
}

export interface WalletSummary {
  totalWallets: number;
  totalBalance: number;
  primaryCurrency: string;
  recentTransactions: Transaction[];
  pendingTransactions: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface WalletSettings {
  defaultCurrency: string;
  autoConvert: boolean;
  notifications: {
    deposits: boolean;
    withdrawals: boolean;
    transfers: boolean;
    lowBalance: boolean;
  };
  lowBalanceThreshold: number;
  preferredPaymentMethods: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'crypto_wallet' | 'paypal';
  name: string;
  isDefault: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodRequest {
  type: 'bank_account' | 'credit_card' | 'crypto_wallet' | 'paypal';
  name: string;
  isDefault?: boolean;
  metadata: Record<string, any>;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface WalletNotification {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'low_balance' | 'transaction_failed';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface WalletSecurity {
  twoFactorEnabled: boolean;
  withdrawalLimits: {
    daily: number;
    monthly: number;
  };
  allowedIPs: string[];
  sessionTimeout: number;
  requireApprovalForLargeTransactions: boolean;
  largeTransactionThreshold: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Wallet state types
export interface WalletState {
  wallets: Wallet[];
  transactions: Transaction[];
  currentWallet: Wallet | null;
  loading: boolean;
  error: string | null;
  analytics: WalletAnalytics | null;
  settings: WalletSettings | null;
  notifications: WalletNotification[];
  unreadNotifications: number;
}

export interface WalletActions {
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Wallet) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  removeWallet: (walletId: string) => void;
  setCurrentWallet: (wallet: Wallet | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalytics: (analytics: WalletAnalytics | null) => void;
  setSettings: (settings: WalletSettings) => void;
  addNotification: (notification: WalletNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  clearError: () => void;
  resetState: () => void;
}

export default {};
