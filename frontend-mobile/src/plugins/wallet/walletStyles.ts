import { StyleSheet } from 'react-native';

/**
 * Wallet Styles
 * StyleSheet for wallet components
 * Maintains consistent styling across wallet functionality
 */
export const walletStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  backButton: {
    padding: 8,
  },
  
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
  },
  
  addWalletButton: {
    padding: 8,
  },
  
  addWalletButtonText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Section styles
  walletsSection: {
    paddingVertical: 16,
  },
  
  transactionsSection: {
    flex: 1,
    paddingVertical: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  
  // Wallet list styles
  walletsList: {
    paddingHorizontal: 16,
  },
  
  walletItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  walletItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  walletInfo: {
    flex: 1,
  },
  
  walletCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  
  walletType: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  
  walletBalance: {
    alignItems: 'flex-end',
  },
  
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  balanceCurrency: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  
  actionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  
  depositButton: {
    backgroundColor: '#34C759',
  },
  
  withdrawButton: {
    backgroundColor: '#FF9500',
  },
  
  transferButton: {
    backgroundColor: '#007AFF',
  },
  
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Transaction list styles
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textTransform: 'capitalize',
  },
  
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  positiveAmount: {
    color: '#34C759',
  },
  
  negativeAmount: {
    color: '#FF3B30',
  },
  
  transactionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  statusCompleted: {
    backgroundColor: '#D4F5D4',
    color: '#34C759',
  },
  
  statusPending: {
    backgroundColor: '#FFF3CD',
    color: '#FF9500',
  },
  
  statusFailed: {
    backgroundColor: '#F8D7DA',
    color: '#FF3B30',
  },
  
  // Quick actions styles
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  
  // Loading and error styles
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  modalInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  
  modalButtonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
  
  modalButtonTextSecondary: {
    color: '#1D1D1F',
  },
  
  // Balance display styles
  balanceCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  
  balanceCardTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  
  balanceCardAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  
  balanceCardCurrency: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  
  // Transaction filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    marginRight: 8,
  },
  
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Analytics styles
  analyticsContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  analyticsCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  
  analyticsCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  // Currency selector
  currencySelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    marginRight: 8,
  },
  
  currencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  currencyButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  currencyButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default walletStyles;
