import apiClient from './api';

// Types
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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Wallet service functions
export const walletService = {
  /**
   * Get wallet balance
   */
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    try {
      const response = await apiClient.get('/wallet/balance');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch balance',
        success: false,
      };
    }
  },

  /**
   * Get transaction history
   */
  async getTransactions(filters?: TransactionFilters): Promise<ApiResponse<TransactionResponse>> {
    try {
      const response = await apiClient.get('/wallet/transactions', { params: filters });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch transactions',
        success: false,
      };
    }
  },

  /**
   * Top up wallet
   */
  async topUp(data: TopUpRequest): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/wallet/top-up', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to top up wallet',
        success: false,
      };
    }
  },

  /**
   * Withdraw funds
   */
  async withdraw(data: WithdrawRequest): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/wallet/withdraw', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to withdraw funds',
        success: false,
      };
    }
  },

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.get(`/wallet/transactions/${id}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch transaction',
        success: false,
      };
    }
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<{ id: string; name: string; type: string; isActive: boolean }[]>> {
    try {
      const response = await apiClient.get('/wallet/payment-methods');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch payment methods',
        success: false,
      };
    }
  },

  /**
   * Add payment method
   */
  async addPaymentMethod(data: any): Promise<ApiResponse<{ id: string; name: string; type: string; isActive: boolean }>> {
    try {
      const response = await apiClient.post('/wallet/payment-methods', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to add payment method',
        success: false,
      };
    }
  },

  /**
   * Remove payment method
   */
  async removePaymentMethod(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/wallet/payment-methods/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to remove payment method',
        success: false,
      };
    }
  },

  /**
   * Get wallet statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    totalIncome: number;
    totalExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    transactionCount: number;
  }>> {
    try {
      const response = await apiClient.get('/wallet/statistics');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch statistics',
        success: false,
      };
    }
  },

  /**
   * Transfer funds to another user
   */
  async transfer(data: { recipientId: string; amount: number; description?: string }): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/wallet/transfer', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to transfer funds',
        success: false,
      };
    }
  },
};










