import '@/polyfills/web';
import { walletService } from '@/services/wallet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from './store';
import { TopUpRequest, TransactionFilters, WithdrawRequest } from './types';

export const useWalletBalance = () => {
  const { setBalance, setLoading, setError } = useWalletStore();

  return useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const response = await walletService.getBalance();
      if (response.success && response.data) {
        setBalance(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch balance');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useTransactions = (filters?: TransactionFilters) => {
  const { setTransactions, setLoading, setError } = useWalletStore();

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await walletService.getTransactions(filters);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch transactions');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useTopUp = () => {
  const queryClient = useQueryClient();
  const { addTransaction, setLoading, setError } = useWalletStore();

  return useMutation({
    mutationFn: async (data: TopUpRequest) => {
      const response = await walletService.topUp(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to top up wallet');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (transaction) => {
      addTransaction(transaction);
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-statistics'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  const { addTransaction, setLoading, setError } = useWalletStore();

  return useMutation({
    mutationFn: async (data: WithdrawRequest) => {
      const response = await walletService.withdraw(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to withdraw funds');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (transaction) => {
      addTransaction(transaction);
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-statistics'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const usePaymentMethods = () => {
  const { setPaymentMethods, setLoading, setError } = useWalletStore();

  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await walletService.getPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch payment methods');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useWalletStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await walletService.addPaymentMethod(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to add payment method');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useRemovePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useWalletStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await walletService.removePaymentMethod(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || 'Failed to remove payment method');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useWalletStatistics = () => {
  const { setStatistics, setLoading, setError } = useWalletStore();

  return useQuery({
    queryKey: ['wallet-statistics'],
    queryFn: async () => {
      const response = await walletService.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch statistics');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const { addTransaction, setLoading, setError } = useWalletStore();

  return useMutation({
    mutationFn: async (data: { recipientId: string; amount: number; description?: string }) => {
      const response = await walletService.transfer(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to transfer funds');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (transaction) => {
      addTransaction(transaction);
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-statistics'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};









