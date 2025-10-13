import { cacheData, getCachedData, getAllCachedData, addToSyncQueue } from '@/services/offlineService';
import { trackFeatureUsage } from '@/services/analytics';

/**
 * Offline-aware Wallet API
 * Provides offline capabilities for wallet functionality
 */

export interface OfflineWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: number;
  synced: boolean;
  metadata?: any;
}

export interface OfflineTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  timestamp: number;
  synced: boolean;
  metadata?: any;
}

/**
 * Cache wallet data
 */
export const cacheWallet = async (wallet: OfflineWallet): Promise<void> => {
  try {
    await cacheData('wallet', wallet.id, wallet);
    
    // Track caching
    trackFeatureUsage('wallet_offline', 'cache_wallet', {
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to cache wallet:', error);
  }
};

/**
 * Get cached wallet
 */
export const getCachedWallet = async (walletId: string): Promise<OfflineWallet | null> => {
  try {
    return await getCachedData('wallet', walletId);
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to get cached wallet:', error);
    return null;
  }
};

/**
 * Get all cached wallets
 */
export const getAllCachedWallets = async (): Promise<OfflineWallet[]> => {
  try {
    return await getAllCachedData('wallet');
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to get all cached wallets:', error);
    return [];
  }
};

/**
 * Cache transaction data
 */
export const cacheTransaction = async (transaction: OfflineTransaction): Promise<void> => {
  try {
    await cacheData('transaction', transaction.id, transaction);
    
    // Track caching
    trackFeatureUsage('wallet_offline', 'cache_transaction', {
      transactionId: transaction.id,
      walletId: transaction.walletId,
      type: transaction.type,
      amount: transaction.amount,
    });
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to cache transaction:', error);
  }
};

/**
 * Get cached transactions for wallet
 */
export const getCachedTransactions = async (walletId: string): Promise<OfflineTransaction[]> => {
  try {
    const allTransactions = await getAllCachedData('transaction');
    return allTransactions.filter(transaction => transaction.walletId === walletId);
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to get cached transactions:', error);
    return [];
  }
};

/**
 * Create wallet offline
 */
export const createWalletOffline = async (
  userId: string,
  currency: string = 'USD',
  initialBalance: number = 0
): Promise<string> => {
  try {
    const walletId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const wallet: OfflineWallet = {
      id: walletId,
      userId,
      balance: initialBalance,
      currency,
      lastUpdated: Date.now(),
      synced: false,
    };
    
    // Cache the wallet
    await cacheWallet(wallet);
    
    // Add to sync queue
    await addToSyncQueue('wallet', 'create', wallet);
    
    // Track offline wallet creation
    trackFeatureUsage('wallet_offline', 'create_wallet', {
      walletId,
      userId,
      currency,
      initialBalance,
    });
    
    return walletId;
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to create wallet offline:', error);
    throw error;
  }
};

/**
 * Update wallet balance offline
 */
export const updateWalletBalanceOffline = async (
  walletId: string,
  newBalance: number,
  description?: string
): Promise<void> => {
  try {
    // Get existing wallet
    const existing = await getCachedWallet(walletId);
    if (!existing) {
      throw new Error('Wallet not found');
    }
    
    const updatedWallet = {
      ...existing,
      balance: newBalance,
      lastUpdated: Date.now(),
    };
    
    // Cache the updated wallet
    await cacheWallet(updatedWallet);
    
    // Add to sync queue
    await addToSyncQueue('wallet', 'update', updatedWallet);
    
    // Track offline balance update
    trackFeatureUsage('wallet_offline', 'update_balance', {
      walletId,
      oldBalance: existing.balance,
      newBalance,
      description,
    });
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to update wallet balance offline:', error);
    throw error;
  }
};

/**
 * Create transaction offline
 */
export const createTransactionOffline = async (
  walletId: string,
  type: 'deposit' | 'withdrawal' | 'transfer',
  amount: number,
  currency: string,
  description: string,
  metadata?: any
): Promise<string> => {
  try {
    const transactionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: OfflineTransaction = {
      id: transactionId,
      walletId,
      type,
      amount,
      currency,
      description,
      timestamp: Date.now(),
      synced: false,
      metadata,
    };
    
    // Cache the transaction
    await cacheTransaction(transaction);
    
    // Add to sync queue
    await addToSyncQueue('transaction', 'create', transaction);
    
    // Track offline transaction
    trackFeatureUsage('wallet_offline', 'create_transaction', {
      transactionId,
      walletId,
      type,
      amount,
      currency,
    });
    
    return transactionId;
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to create transaction offline:', error);
    throw error;
  }
};

/**
 * Process deposit offline
 */
export const processDepositOffline = async (
  walletId: string,
  amount: number,
  currency: string,
  description: string = 'Deposit'
): Promise<string> => {
  try {
    // Get existing wallet
    const existing = await getCachedWallet(walletId);
    if (!existing) {
      throw new Error('Wallet not found');
    }
    
    // Create transaction
    const transactionId = await createTransactionOffline(
      walletId,
      'deposit',
      amount,
      currency,
      description
    );
    
    // Update wallet balance
    const newBalance = existing.balance + amount;
    await updateWalletBalanceOffline(walletId, newBalance, description);
    
    // Track offline deposit
    trackFeatureUsage('wallet_offline', 'process_deposit', {
      walletId,
      amount,
      currency,
      newBalance,
    });
    
    return transactionId;
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to process deposit offline:', error);
    throw error;
  }
};

/**
 * Process withdrawal offline
 */
export const processWithdrawalOffline = async (
  walletId: string,
  amount: number,
  currency: string,
  description: string = 'Withdrawal'
): Promise<string> => {
  try {
    // Get existing wallet
    const existing = await getCachedWallet(walletId);
    if (!existing) {
      throw new Error('Wallet not found');
    }
    
    // Check sufficient balance
    if (existing.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create transaction
    const transactionId = await createTransactionOffline(
      walletId,
      'withdrawal',
      amount,
      currency,
      description
    );
    
    // Update wallet balance
    const newBalance = existing.balance - amount;
    await updateWalletBalanceOffline(walletId, newBalance, description);
    
    // Track offline withdrawal
    trackFeatureUsage('wallet_offline', 'process_withdrawal', {
      walletId,
      amount,
      currency,
      newBalance,
    });
    
    return transactionId;
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to process withdrawal offline:', error);
    throw error;
  }
};

/**
 * Process transfer offline
 */
export const processTransferOffline = async (
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  currency: string,
  description: string = 'Transfer'
): Promise<{ fromTransactionId: string; toTransactionId: string }> => {
  try {
    // Get source wallet
    const fromWallet = await getCachedWallet(fromWalletId);
    if (!fromWallet) {
      throw new Error('Source wallet not found');
    }
    
    // Check sufficient balance
    if (fromWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create withdrawal transaction
    const fromTransactionId = await createTransactionOffline(
      fromWalletId,
      'withdrawal',
      amount,
      currency,
      `Transfer to ${toWalletId}`
    );
    
    // Create deposit transaction
    const toTransactionId = await createTransactionOffline(
      toWalletId,
      'deposit',
      amount,
      currency,
      `Transfer from ${fromWalletId}`
    );
    
    // Update source wallet balance
    const fromNewBalance = fromWallet.balance - amount;
    await updateWalletBalanceOffline(fromWalletId, fromNewBalance, description);
    
    // Update destination wallet balance
    const toWallet = await getCachedWallet(toWalletId);
    if (toWallet) {
      const toNewBalance = toWallet.balance + amount;
      await updateWalletBalanceOffline(toWalletId, toNewBalance, description);
    }
    
    // Track offline transfer
    trackFeatureUsage('wallet_offline', 'process_transfer', {
      fromWalletId,
      toWalletId,
      amount,
      currency,
    });
    
    return { fromTransactionId, toTransactionId };
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to process transfer offline:', error);
    throw error;
  }
};

/**
 * Get offline wallet statistics
 */
export const getOfflineWalletStats = async (): Promise<{
  totalWallets: number;
  totalTransactions: number;
  totalBalance: number;
  unsyncedWallets: number;
  unsyncedTransactions: number;
}> => {
  try {
    const wallets = await getAllCachedWallets();
    const allTransactions = await getAllCachedData('transaction');
    
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    
    return {
      totalWallets: wallets.length,
      totalTransactions: allTransactions.length,
      totalBalance,
      unsyncedWallets: wallets.filter(w => !w.synced).length,
      unsyncedTransactions: allTransactions.filter(t => !t.synced).length,
    };
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to get offline stats:', error);
    return {
      totalWallets: 0,
      totalTransactions: 0,
      totalBalance: 0,
      unsyncedWallets: 0,
      unsyncedTransactions: 0,
    };
  }
};

/**
 * Clear all offline wallet data
 */
export const clearOfflineWalletData = async (): Promise<void> => {
  try {
    // Clear wallets
    const wallets = await getAllCachedWallets();
    for (const wallet of wallets) {
      await cacheData('wallet', wallet.id, null);
    }
    
    // Clear transactions
    const allTransactions = await getAllCachedData('transaction');
    for (const transaction of allTransactions) {
      await cacheData('transaction', transaction.id, null);
    }
    
    // Track data clearing
    trackFeatureUsage('wallet_offline', 'clear_data', {
      walletCount: wallets.length,
      transactionCount: allTransactions.length,
    });
  } catch (error) {
    console.error('[WalletOfflineAPI] Failed to clear offline data:', error);
  }
};

export default {
  cacheWallet,
  getCachedWallet,
  getAllCachedWallets,
  cacheTransaction,
  getCachedTransactions,
  createWalletOffline,
  updateWalletBalanceOffline,
  createTransactionOffline,
  processDepositOffline,
  processWithdrawalOffline,
  processTransferOffline,
  getOfflineWalletStats,
  clearOfflineWalletData,
};
