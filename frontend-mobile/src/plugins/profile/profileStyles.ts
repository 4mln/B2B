import { StyleSheet } from 'react-native';

/**
 * Profile Styles
 * StyleSheet for profile components
 * Maintains consistent styling across profile functionality
 */
export const profileStyles = StyleSheet.create({
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
  
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Photo section styles
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  
  photoPlaceholderText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#8E8E93',
  },
  
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  photoEditButtonText: {
    fontSize: 14,
  },
  
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  // Info section styles
  infoSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  
  fieldContainer: {
    marginBottom: 16,
  },
  
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  
  fieldValue: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 22,
  },
  
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1D1D1F',
  },
  
  // Status badge styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  statusBadgeVerified: {
    backgroundColor: '#D4F5D4',
  },
  
  statusBadgePending: {
    backgroundColor: '#FFF3CD',
  },
  
  statusBadgeRejected: {
    backgroundColor: '#F8D7DA',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    textTransform: 'uppercase',
  },
  
  statusTextPending: {
    color: '#FF9500',
  },
  
  statusTextRejected: {
    color: '#FF3B30',
  },
  
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  
  saveButton: {
    backgroundColor: '#007AFF',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Additional actions styles
  additionalActions: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  additionalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  additionalActionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  
  additionalActionText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
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
  
  // Form styles
  formContainer: {
    padding: 16,
  },
  
  formField: {
    marginBottom: 16,
  },
  
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  
  formInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1D1D1F',
  },
  
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  formSelect: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  
  formSelectText: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  
  // Verification styles
  verificationContainer: {
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginBottom: 16,
  },
  
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  
  verificationText: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  
  verificationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  
  verificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Business info styles
  businessInfo: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  
  businessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  businessField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  businessFieldLabel: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  
  businessFieldValue: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  
  // Privacy settings styles
  privacyContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  privacySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  privacySettingLabel: {
    fontSize: 14,
    color: '#1D1D1F',
    flex: 1,
  },
  
  privacySettingValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  // Analytics styles
  analyticsContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  analyticsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  analyticsCardTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  
  analyticsCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
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
});

export default profileStyles;
