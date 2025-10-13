import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useWalletHooks } from './walletHooks';
import { walletStyles } from './walletStyles';
import { Wallet, Transaction } from './types';

/**
 * Wallet Screen Component
 * Main wallet interface for balance, transactions, and financial operations
 * Aligns with backend /wallet endpoints
 */
interface WalletScreenProps {
  onBack?: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const {
    wallets,
    transactions,
    loading,
    error,
    refreshWallets,
    refreshTransactions,
    deposit,
    withdraw,
    transfer,
    createWallet,
  } = useWalletHooks();

  // Handle wallet selection
  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  // Handle deposit
  const handleDeposit = async (amount: number, currency: string) => {
    try {
      await deposit(amount, currency);
      Alert.alert(t('common.done'), t('wallet.topUpSuccess', 'Deposit initiated successfully'));
      setShowDepositModal(false);
      refreshWallets();
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.topUpFailed', 'Failed to initiate deposit'));
    }
  };

  // Handle withdrawal
  const handleWithdraw = async (amount: number, currency: string) => {
    try {
      await withdraw(amount, currency);
      Alert.alert(t('common.done'), t('wallet.withdrawSuccess', 'Withdrawal initiated successfully'));
      setShowWithdrawModal(false);
      refreshWallets();
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.withdrawFailed', 'Failed to initiate withdrawal'));
    }
  };

  // Handle transfer
  const handleTransfer = async (amount: number, currency: string, recipientId: string) => {
    try {
      await transfer(amount, currency, recipientId);
      Alert.alert(t('common.done'), t('wallet.transferSuccess', 'Transfer completed successfully'));
      refreshWallets();
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.transferFailed', 'Failed to complete transfer'));
    }
  };

  // Render wallet item
  const renderWallet = ({ item }: { item: Wallet }) => (
    <TouchableOpacity
      style={[
        walletStyles.walletItem,
        selectedWallet?.id === item.id && walletStyles.walletItemSelected
      ]}
      onPress={() => handleWalletSelect(item)}
    >
      <View style={walletStyles.walletHeader}>
        <View style={walletStyles.walletInfo}>
          <Text style={walletStyles.walletCurrency}>{item.currency}</Text>
          <Text style={walletStyles.walletType}>{item.currencyType}</Text>
        </View>
        <View style={walletStyles.walletBalance}>
          <Text style={walletStyles.balanceAmount}>
            {item.balance.toFixed(2)}
          </Text>
          <Text style={walletStyles.balanceCurrency}>{item.currency}</Text>
        </View>
      </View>
      <View style={walletStyles.walletActions}>
        <TouchableOpacity
          style={[walletStyles.actionButton, walletStyles.depositButton]}
          onPress={() => setShowDepositModal(true)}
        >
          <Text style={walletStyles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[walletStyles.actionButton, walletStyles.withdrawButton]}
          onPress={() => setShowWithdrawModal(true)}
        >
          <Text style={walletStyles.actionButtonText}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[walletStyles.actionButton, walletStyles.transferButton]}
          onPress={() => {/* Handle transfer */}}
        >
          <Text style={walletStyles.actionButtonText}>Transfer</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={walletStyles.transactionItem}>
      <View style={walletStyles.transactionHeader}>
        <Text style={walletStyles.transactionType}>{item.transactionType}</Text>
        <Text style={[
          walletStyles.transactionAmount,
          item.amount > 0 ? walletStyles.positiveAmount : walletStyles.negativeAmount
        ]}>
          {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} {item.currency}
        </Text>
      </View>
      <Text style={walletStyles.transactionDescription}>{item.description}</Text>
      <View style={walletStyles.transactionMeta}>
        <Text style={walletStyles.transactionDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[
          walletStyles.transactionStatus,
          item.status === 'completed' ? walletStyles.statusCompleted : 
          item.status === 'pending' ? walletStyles.statusPending : walletStyles.statusFailed
        ]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  if (loading && !wallets.length) {
    return (
      <View style={walletStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={walletStyles.loadingText}>{t('wallet.loading', 'Loading wallet...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={walletStyles.errorContainer}>
        <Text style={walletStyles.errorText}>{error || t('errors.unknownError')}</Text>
        <TouchableOpacity style={walletStyles.retryButton} onPress={refreshWallets}>
          <Text style={walletStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={walletStyles.container}>
      {/* Header */}
      <View style={walletStyles.header}>
        <TouchableOpacity onPress={onBack} style={walletStyles.backButton}>
          <Text style={walletStyles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={walletStyles.headerTitle}>{t('wallet.title')}</Text>
        <TouchableOpacity style={walletStyles.addWalletButton}>
          <Text style={walletStyles.addWalletButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Wallets Section */}
      <View style={walletStyles.walletsSection}>
        <Text style={walletStyles.sectionTitle}>{t('wallet.yourWallets', 'Your Wallets')}</Text>
        <FlatList
          data={wallets}
          renderItem={renderWallet}
          keyExtractor={(item) => item.id}
          style={walletStyles.walletsList}
          horizontal
          showsHorizontalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshWallets}
        />
      </View>

      {/* Transactions Section */}
      {selectedWallet && (
        <View style={walletStyles.transactionsSection}>
          <Text style={walletStyles.sectionTitle}>
            {t('wallet.transactions')} - {selectedWallet.currency}
          </Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            style={walletStyles.transactionsList}
            refreshing={loading}
            onRefresh={() => refreshTransactions(selectedWallet.id)}
            ListEmptyComponent={
              <View style={walletStyles.emptyState}>
                <Text style={walletStyles.emptyStateText}>
                  {t('wallet.noTransactions')}
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={walletStyles.quickActions}>
        <TouchableOpacity
          style={walletStyles.quickActionButton}
          onPress={() => setShowDepositModal(true)}
        >
          <Text style={walletStyles.quickActionIcon}>💰</Text>
          <Text style={walletStyles.quickActionText}>{t('wallet.topUp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={walletStyles.quickActionButton}
          onPress={() => setShowWithdrawModal(true)}
        >
          <Text style={walletStyles.quickActionIcon}>💸</Text>
          <Text style={walletStyles.quickActionText}>{t('wallet.withdraw')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={walletStyles.quickActionButton}
          onPress={() => {/* Handle transfer */}}
        >
          <Text style={walletStyles.quickActionIcon}>↔️</Text>
          <Text style={walletStyles.quickActionText}>{t('wallet.transfer')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={walletStyles.quickActionButton}
          onPress={() => {/* Handle history */}}
        >
          <Text style={walletStyles.quickActionIcon}>📊</Text>
          <Text style={walletStyles.quickActionText}>{t('wallet.history', 'History')}</Text>
        </TouchableOpacity>
      </View>
</View>
);
};

export default WalletScreen;
