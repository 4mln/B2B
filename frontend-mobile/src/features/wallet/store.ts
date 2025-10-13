import '@/polyfills/web';
import { PaymentMethod, Transaction, WalletBalance, WalletState, WalletStatistics } from './types';
// Ensure process.env before requiring zustand (SSR/web)
// @ts-expect-error
if (typeof globalThis.process === 'undefined') {
  // @ts-expect-error
  globalThis.process = { env: {} };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = {};
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { create } = require('zustand');

interface WalletStore extends WalletState {
  // Actions
  setBalance: (balance: WalletBalance) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setStatistics: (statistics: WalletStatistics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: null,
  transactions: [],
  paymentMethods: [],
  statistics: null,
  isLoading: false,
  error: null,

  setBalance: (balance) => set({ balance }),
  
  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions]
  })),
  
  setPaymentMethods: (methods) => set({ paymentMethods: methods }),
  
  setStatistics: (statistics) => set({ statistics }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  updateTransaction: (transactionId, updates) => set((state) => ({
    transactions: state.transactions.map(transaction =>
      transaction.id === transactionId ? { ...transaction, ...updates } : transaction
    )
  })),
  
  clearError: () => set({ error: null }),
}));









