import apiClient from '@/services/api';
import { API_CONFIG } from '@/config/api';
import {
  ApiResponse,
  Wallet,
  Transaction,
  CreateWalletRequest,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  TransactionFilters,
  WalletBalance,
  TransactionResponse
} from '@/types/wallet';

/**
 * Unified Wallet API Service
 * Matches backend FastAPI plugin endpoints exactly
 */
export const walletService = {
  /**
   * Get current user's wallets
   * Backend: GET /api/v1/wallet/me
   */
  async getMyWallets(): Promise<ApiResponse<Wallet[]>> {
    try {
      const response = await apiClient.get('/wallet/me');
      return {
        data: response.data.wallets,
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
   * Get wallet by ID
   * Backend: GET /api/v1/wallet/{wallet_id}
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
   * Create new wallet
   * Backend: POST /api/v1/wallet/
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
   * Get wallet transactions
   * Backend: GET /api/v1/wallet/{wallet_id}/transactions
   */
  async getTransactions(walletId: string, filters?: TransactionFilters): Promise<ApiResponse<TransactionResponse>> {
    try {
      const response = await apiClient.get(`/wallet/${walletId}/transactions`, { params: filters });
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
   * Backend: POST /api/v1/wallet/deposit
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
   * Backend: POST /api/v1/wallet/withdraw
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
   * Transfer funds between wallets
   * Backend: POST /api/v1/wallet/transfer
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
   * Get user's wallets (admin only)
   * Backend: GET /api/v1/wallet/user/{user_id}
   */
  async getUserWallets(userId: string): Promise<ApiResponse<Wallet[]>> {
    try {
      const response = await apiClient.get(`/wallet/user/${userId}`);
      return {
        data: response.data.wallets,
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
   * Helper: Get primary wallet balance
   * Uses /wallet/me and returns first wallet or null
   */
  async getBalance(): Promise<ApiResponse<WalletBalance | null>> {
    try {
      const response = await this.getMyWallets();
      if (!response.success || !response.data?.length) {
        return {
          data: null,
          success: true,
        };
      }
      const wallet = response.data[0];
      return {
        data: {
          balance: wallet.balance,
          currency: wallet.currency,
          currency_type: wallet.currency_type,
          lastUpdated: wallet.updated_at,
        },
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch balance',
        success: false,
      };
    }
  },
};

export default walletService;