import apiClient from '@/services/api';
import { 
  Wallet, 
  Transaction, 
  CreateWalletRequest, 
  DepositRequest, 
  WithdrawalRequest,
  TransferRequest,
  ApiResponse 
} from './types';

/**
 * Wallet API Service
 * Centralized API calls to backend /wallet endpoints
 * Aligns with backend plugin structure
 */
export const walletApi = {
  /**
   * Get all wallets for the current user
   * Backend endpoint: GET /wallet/me
   */
  async getWallets(): Promise<ApiResponse<Wallet[]>> {
    try {
      const response = await apiClient.get('/wallet/me');
      return {
        data: response.data.wallets || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch wallets',
        success: false,
      };
    }
  },

  /**
   * Get a specific wallet
   * Backend endpoint: GET /wallet/{wallet_id}
   */
  async getWallet(walletId: string): Promise<ApiResponse<Wallet>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch wallet',
        success: false,
      };
    }
  },

  /**
   * Create a new wallet
   * Backend endpoint: POST /wallet/
   */
  async createWallet(data: CreateWalletRequest): Promise<ApiResponse<Wallet>> {
    try {
      const response = await apiClient.post('/wallet/', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create wallet',
        success: false,
      };
    }
  },

  /**
   * Update wallet (admin only)
   * Backend endpoint: PATCH /wallet/{wallet_id}
   */
  async updateWallet(walletId: string, data: Partial<Wallet>): Promise<ApiResponse<Wallet>> {
    try {
      const response = await apiClient.patch(`/wallet/${walletId}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update wallet',
        success: false,
      };
    }
  },

  /**
   * Get wallet transactions
   * Backend endpoint: GET /wallet/{wallet_id}/transactions
   */
  async getWalletTransactions(walletId: string): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}/transactions`);
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
   * Deposit funds
   * Backend endpoint: POST /wallet/deposit
   */
  async deposit(data: DepositRequest): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/wallet/deposit', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to deposit funds',
        success: false,
      };
    }
  },

  /**
   * Withdraw funds
   * Backend endpoint: POST /wallet/withdraw
   */
  async withdraw(data: WithdrawalRequest): Promise<ApiResponse<Transaction>> {
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
   * Transfer funds
   * Backend endpoint: POST /wallet/transfer
   */
  async transfer(data: TransferRequest): Promise<ApiResponse<Transaction>> {
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

  /**
   * Get user wallets by user ID (admin only)
   * Backend endpoint: GET /wallet/user/{user_id}
   */
  async getUserWallets(userId: string): Promise<ApiResponse<Wallet[]>> {
    try {
      const response = await apiClient.get(`/wallet/user/${userId}`);
      return {
        data: response.data.wallets || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch user wallets',
        success: false,
      };
    }
  },

  /**
   * Get wallet balance
   * Backend endpoint: GET /wallet/{wallet_id}/balance
   */
  async getWalletBalance(walletId: string): Promise<ApiResponse<{ balance: number; currency: string }>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}/balance`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch wallet balance',
        success: false,
      };
    }
  },

  /**
   * Get transaction history with filters
   * Backend endpoint: GET /wallet/{wallet_id}/transactions
   */
  async getTransactionHistory(
    walletId: string,
    filters?: {
      transactionType?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}/transactions`, {
        params: filters,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch transaction history',
        success: false,
      };
    }
  },

  /**
   * Get wallet analytics
   * Backend endpoint: GET /wallet/{wallet_id}/analytics
   */
  async getWalletAnalytics(
    walletId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}/analytics`, {
        params: { period },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch wallet analytics',
        success: false,
      };
    }
  },

  /**
   * Get supported currencies
   * Backend endpoint: GET /wallet/currencies
   */
  async getSupportedCurrencies(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/wallet/currencies');
      return {
        data: response.data.currencies || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch supported currencies',
        success: false,
      };
    }
  },

  /**
   * Get exchange rates
   * Backend endpoint: GET /wallet/exchange-rates
   */
  async getExchangeRates(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const response = await apiClient.get('/wallet/exchange-rates');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch exchange rates',
        success: false,
      };
    }
  },

  /**
   * Convert currency
   * Backend endpoint: POST /wallet/convert
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ApiResponse<{ convertedAmount: number; rate: number }>> {
    try {
      const response = await apiClient.post('/wallet/convert', {
        amount,
        fromCurrency,
        toCurrency,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to convert currency',
        success: false,
      };
    }
  },
};

export default walletApi;
