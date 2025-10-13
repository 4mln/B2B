import { StyleSheet } from 'react-native';

/**
 * RFQ Styles
 * StyleSheet for RFQ components
 * Maintains consistent styling across RFQ functionality
 */
export const rfqStyles = StyleSheet.create({
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
  
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Search styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  // Section styles
  rfqsSection: {
    flex: 1,
    paddingVertical: 16,
  },
  
  quotesSection: {
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
  
  // RFQ list styles
  rfqsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  rfqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  
  rfqItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  rfqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
    marginRight: 8,
  },
  
  rfqStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  
  rfqDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  rfqMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  rfqCategory: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  rfqBudget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  
  rfqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  rfqDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  rfqQuotes: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Quote list styles
  quotesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  quoteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  quoteSeller: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  quotePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  
  quoteDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  quoteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  quoteDelivery: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  quoteDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  quoteActionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  
  acceptButton: {
    backgroundColor: '#34C759',
  },
  
  quoteActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  acceptButtonText: {
    color: '#FFFFFF',
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
    maxWidth: 500,
    maxHeight: '80%',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  modalForm: {
    maxHeight: 400,
  },
  
  modalInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
    marginBottom: 16,
  },
  
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Filter styles
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
  
  // Status badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  statusOpen: {
    backgroundColor: '#D4F5D4',
  },
  
  statusClosed: {
    backgroundColor: '#F8D7DA',
  },
  
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  statusTextOpen: {
    color: '#34C759',
  },
  
  statusTextClosed: {
    color: '#FF3B30',
  },
  
  statusTextPending: {
    color: '#FF9500',
  },
  
  // Quote status
  quoteStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  quoteStatusPending: {
    backgroundColor: '#FFF3CD',
  },
  
  quoteStatusAccepted: {
    backgroundColor: '#D4F5D4',
  },
  
  quoteStatusRejected: {
    backgroundColor: '#F8D7DA',
  },
  
  quoteStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  quoteStatusTextPending: {
    color: '#FF9500',
  },
  
  quoteStatusTextAccepted: {
    color: '#34C759',
  },
  
  quoteStatusTextRejected: {
    color: '#FF3B30',
  },
});

export default rfqStyles;
