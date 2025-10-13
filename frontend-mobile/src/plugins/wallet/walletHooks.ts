import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from './walletApi';
import { Wallet, Transaction, CreateWalletRequest, DepositRequest, WithdrawalRequest, TransferRequest } from './types';

/**
 * Wallet Hooks
 * React hooks to manage wallet state and API interactions
 * Provides centralized state management for wallet functionality
 */
export const useWalletHooks = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch wallets
  const {
    data: walletsData,
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ['wallet', 'wallets'],
    queryFn: async () => {
      const response = await walletApi.getWallets();
      if (response.success && response.data) {
        setWallets(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch wallets');
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async (data: CreateWalletRequest) => {
      const response = await walletApi.createWallet(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create wallet');
    },
    onSuccess: (newWallet) => {
      setWallets(prev => [newWallet, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['wallet', 'wallets'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: DepositRequest) => {
      const response = await walletApi.deposit(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to deposit funds');
    },
    onSuccess: (transaction) => {
      setTransactions(prev => [transaction, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['wallet', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawalRequest) => {
      const response = await walletApi.withdraw(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to withdraw funds');
    },
    onSuccess: (transaction) => {
      setTransactions(prev => [transaction, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['wallet', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: TransferRequest) => {
      const response = await walletApi.transfer(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to transfer funds');
    },
    onSuccess: (transaction) => {
      setTransactions(prev => [transaction, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['wallet', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Fetch transactions for a specific wallet
  const fetchTransactions = useCallback(async (walletId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.getWalletTransactions(walletId);
      if (response.success && response.data) {
        setTransactions(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch transactions');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deposit funds
  const deposit = useCallback(async (amount: number, currency: string) => {
    return depositMutation.mutateAsync({
      amount,
      currency,
    });
  }, [depositMutation]);

  // Withdraw funds
  const withdraw = useCallback(async (amount: number, currency: string) => {
    return withdrawMutation.mutateAsync({
      amount,
      currency,
    });
  }, [withdrawMutation]);

  // Transfer funds
  const transfer = useCallback(async (amount: number, currency: string, recipientId: string) => {
    return transferMutation.mutateAsync({
      amount,
      currency,
      recipientId,
    });
  }, [transferMutation]);

  // Create wallet
  const createWallet = useCallback(async (data: CreateWalletRequest) => {
    return createWalletMutation.mutateAsync(data);
  }, [createWalletMutation]);

  // Refresh wallets
  const refreshWallets = useCallback(() => {
    refetchWallets();
  }, [refetchWallets]);

  // Refresh transactions
  const refreshTransactions = useCallback((walletId: string) => {
    fetchTransactions(walletId);
  }, [fetchTransactions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(walletsLoading || createWalletMutation.isPending || depositMutation.isPending || withdrawMutation.isPending || transferMutation.isPending);
  }, [walletsLoading, createWalletMutation.isPending, depositMutation.isPending, withdrawMutation.isPending, transferMutation.isPending]);

  // Update error state
  useEffect(() => {
    if (walletsError) {
      setError(walletsError.message);
    }
  }, [walletsError]);

  return {
    // State
    wallets,
    transactions,
    loading,
    error,
    
    // Actions
    deposit,
    withdraw,
    transfer,
    createWallet,
    refreshWallets,
    refreshTransactions,
    fetchTransactions,
    clearError,
    
    // Mutation states
    isCreating: createWalletMutation.isPending,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isTransferring: transferMutation.isPending,
  };
};

/**
 * Hook for managing a specific wallet
 */
export const useWallet = (walletId: string) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: walletData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['wallet', 'detail', walletId],
    queryFn: async () => {
      const response = await walletApi.getWallet(walletId);
      if (response.success && response.data) {
        setWallet(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch wallet');
    },
    enabled: !!walletId,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    wallet,
    loading,
    error,
  };
};

/**
 * Hook for managing wallet transactions
 */
export const useWalletTransactions = (walletId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: transactionsData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['wallet', 'transactions', walletId],
    queryFn: async () => {
      const response = await walletApi.getWalletTransactions(walletId);
      if (response.success && response.data) {
        setTransactions(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch transactions');
    },
    enabled: !!walletId,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    transactions,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook for wallet analytics
 */
export const useWalletAnalytics = (walletId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analyticsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['wallet', 'analytics', walletId, period],
    queryFn: async () => {
      const response = await walletApi.getWalletAnalytics(walletId, period);
      if (response.success && response.data) {
        setAnalytics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch analytics');
    },
    enabled: !!walletId,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    analytics,
    loading,
    error,
  };
};

export default useWalletHooks;
