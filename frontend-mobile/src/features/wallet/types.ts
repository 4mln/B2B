export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  category?: string;
}

export interface TopUpRequest {
  amount: number;
  method: 'bank_transfer' | 'credit_card' | 'wallet';
  paymentDetails?: any;
}

export interface WithdrawRequest {
  amount: number;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolderName: string;
  };
}

export interface TransactionFilters {
  type?: 'credit' | 'debit';
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface WalletStatistics {
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactionCount: number;
}

export interface WalletState {
  balance: WalletBalance | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  statistics: WalletStatistics | null;
  isLoading: boolean;
  error: string | null;
}










