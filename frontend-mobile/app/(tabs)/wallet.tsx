import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { useTopUp, useTransactions, useTransfer, useWalletBalance, useWithdraw } from '@/features/wallet/hooks';
import { useWalletStore } from '@/features/wallet/store';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // State for modals
  const [isTopUpModalVisible, setTopUpModalVisible] = useState(false);
  const [isWithdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { data: balanceData, refetch: refetchBalance } = useWalletBalance();
  const { transactions, isLoading } = useWalletStore();
  const { refetch: refetchTransactions } = useTransactions();
  const topUp = useTopUp();
  const withdraw = useWithdraw();
  const transfer = useTransfer();

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchTransactions()]);
    setRefreshing(false);
  };

  // Handle top up
  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(Number(topUpAmount))) {
      Alert.alert(t('errors.validationError'), t('wallet.enterValidAmount', 'Please enter a valid amount'));
      return;
    }

    try {
      await topUp.mutateAsync({ 
        amount: Number(topUpAmount), 
        method: 'wallet' 
      });
      setTopUpAmount('');
      setTopUpModalVisible(false);
      Alert.alert(t('common.done'), t('wallet.topUpSuccess', 'Your wallet has been topped up'));
    } catch (e) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.topUpFailed', 'Failed to top up'));
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      Alert.alert(t('errors.validationError'), t('wallet.enterValidAmount', 'Please enter a valid amount'));
      return;
    }

    try {
      await withdraw.mutateAsync({ 
        amount: Number(withdrawAmount), 
        bankAccount: { 
          accountNumber: '****', 
          bankName: 'Bank', 
          accountHolderName: 'You' 
        } 
      });
      setWithdrawAmount('');
      setWithdrawModalVisible(false);
      Alert.alert(t('common.done'), t('wallet.withdrawSuccess', 'Withdrawal request submitted'));
    } catch (e) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.withdrawFailed', 'Failed to withdraw'));
    }
  };

  // Handle transfer
  const handleTransfer = async () => {
    if (!transferAmount || isNaN(Number(transferAmount))) {
      Alert.alert(t('errors.validationError'), t('wallet.enterValidAmount', 'Please enter a valid amount'));
      return;
    }

    if (!recipientId) {
      Alert.alert(t('errors.validationError'), t('wallet.enterRecipientIdError', 'Please enter a recipient ID'));
      return;
    }

    try {
      await transfer.mutateAsync({
        recipientId,
        amount: Number(transferAmount),
        description: transferDescription
      });
      setTransferAmount('');
      setRecipientId('');
      setTransferDescription('');
      setTransferModalVisible(false);
      Alert.alert(t('common.done'), t('wallet.transferSuccess', 'Funds transferred successfully'));
    } catch (e) {
      Alert.alert(t('errors.error', 'Error'), t('wallet.transferFailed', 'Failed to transfer funds'));
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={24}
          color={item.type === 'credit' ? colors.success[500] : colors.error[500]}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: item.type === 'credit' ? colors.success[500] : colors.error[500] }
        ]}>
          {item.type === 'credit' ? '+' : '-'}{item.amount.toLocaleString()} Toman
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? colors.success[100] : colors.warning[100] }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? colors.success[600] : colors.warning[600] }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.lg,
      backgroundColor: colors.primary[500],
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: colors.background.light,
      textAlign: 'center',
      marginBottom: semanticSpacing.lg,
    },
    balanceCard: {
      backgroundColor: colors.background.light,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.lg,
      alignItems: 'center',
      ...semanticSpacing.shadow.md,
    },
    balanceLabel: {
      fontSize: typography.body.fontSize,
      color: colors.gray[600],
      marginBottom: semanticSpacing.sm,
    },
    balanceAmount: {
      fontSize: typography.h1.fontSize,
      fontWeight: typography.h1.fontWeight,
      color: colors.primary[600],
      marginBottom: semanticSpacing.lg,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    actionButton: {
      flex: 1,
      paddingVertical: semanticSpacing.md,
      borderRadius: semanticSpacing.radius.lg,
      alignItems: 'center',
      marginHorizontal: semanticSpacing.xs,
    },
    primaryButton: {
      backgroundColor: colors.primary[500],
    },
    secondaryButton: {
      backgroundColor: colors.gray[100],
    },
    actionButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
    },
    primaryButtonText: {
      color: colors.background.light,
    },
    secondaryButtonText: {
      color: colors.gray[700],
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginVertical: semanticSpacing.lg,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: semanticSpacing.md,
      paddingHorizontal: semanticSpacing.sm,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionDescription: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.xs,
    },
    transactionDate: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    transactionAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.semibold,
      marginBottom: semanticSpacing.xs,
    },
    statusBadge: {
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: semanticSpacing.xs,
      borderRadius: semanticSpacing.radius.sm,
    },
    statusText: {
      fontSize: typography.caption.fontSize,
      fontWeight: fontWeights.medium,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.xl,
    },
    emptyStateText: {
      fontSize: typography.bodyLarge.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      textAlign: 'center',
      marginTop: semanticSpacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: semanticSpacing.md,
    },
    buttonIcon: {
      marginRight: semanticSpacing.xs,
    },
    tertiaryButton: {
      backgroundColor: colors.secondary[500],
    },
    tertiaryButtonText: {
      color: colors.background.light,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.lg,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    modalTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    modalBody: {
      flex: 1,
    },
    inputLabel: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      borderRadius: semanticSpacing.radius.md,
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
      backgroundColor: isDark ? colors.background.surface : colors.background.surface,
      marginBottom: semanticSpacing.md,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    modalButton: {
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.md,
      paddingVertical: semanticSpacing.md,
      alignItems: 'center',
      marginTop: semanticSpacing.md,
    },
    modalButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('wallet.title', 'Wallet')}</Text>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('wallet.currentBalance', 'Current Balance')}</Text>
          <Text style={styles.balanceAmount}>
            {(balanceData?.balance ?? 0).toLocaleString()} {balanceData?.currency || 'Toman'}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={() => setTopUpModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.background.light} style={styles.buttonIcon} />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>{t('wallet.topUp', 'Top Up')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={() => setWithdrawModalVisible(true)}
            >
              <Ionicons name="cash-outline" size={18} color={colors.gray[700]} style={styles.buttonIcon} />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>{t('wallet.withdraw', 'Withdraw')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.tertiaryButton]} 
              onPress={() => setTransferModalVisible(true)}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={colors.background.light} style={styles.buttonIcon} />
              <Text style={[styles.actionButtonText, styles.tertiaryButtonText]}>{t('wallet.transfer', 'Transfer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('wallet.recentTransactions', 'Recent Transactions')}</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons 
              name="refresh-outline" 
              size={20} 
              color={isDark ? colors.primary[400] : colors.primary[600]} 
            />
          </TouchableOpacity>
        </View>
        
        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
                tintColor={isDark ? colors.primary[400] : colors.primary[600]}
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="wallet-outline"
              size={64}
              color={isDark ? colors.gray[400] : colors.gray[500]}
            />
            <Text style={styles.emptyStateText}>{t('wallet.noTransactions', 'No transactions yet')}</Text>
          </View>
        )}
      </View>

      {/* Top Up Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTopUpModalVisible}
        onRequestClose={() => setTopUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('wallet.topUpWallet', 'Top Up Wallet')}</Text>
              <TouchableOpacity onPress={() => setTopUpModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.gray[400] : colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('wallet.amount', 'Amount')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.enterAmount', 'Enter amount')}
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
              />
              
              <TouchableOpacity style={styles.modalButton} onPress={handleTopUp}>
                <Text style={styles.modalButtonText}>{t('wallet.topUp', 'Top Up')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWithdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('wallet.withdrawFunds', 'Withdraw Funds')}</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.gray[400] : colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('wallet.amount', 'Amount')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.enterAmount', 'Enter amount')}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
              
              <TouchableOpacity style={styles.modalButton} onPress={handleWithdraw}>
                <Text style={styles.modalButtonText}>{t('wallet.withdraw', 'Withdraw')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTransferModalVisible}
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('wallet.transferFunds', 'Transfer Funds')}</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.gray[400] : colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('wallet.recipientId', 'Recipient ID')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.enterRecipientId', 'Enter recipient ID')}
                value={recipientId}
                onChangeText={setRecipientId}
              />
              
              <Text style={styles.inputLabel}>{t('wallet.amount', 'Amount')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.enterAmount', 'Enter amount')}
                keyboardType="numeric"
                value={transferAmount}
                onChangeText={setTransferAmount}
              />
              
              <Text style={styles.inputLabel}>{t('wallet.description', 'Description (Optional)')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('wallet.enterDescription', 'Enter description')}
                multiline
                numberOfLines={3}
                value={transferDescription}
                onChangeText={setTransferDescription}
              />
              
              <TouchableOpacity style={styles.modalButton} onPress={handleTransfer}>
                <Text style={styles.modalButtonText}>{t('wallet.transfer', 'Transfer')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}