import { StyleSheet } from 'react-native';

/**
 * Explore Styles
 * StyleSheet for explore components
 * Maintains consistent styling across explore functionality
 */
export const exploreStyles = StyleSheet.create({
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
  
  filterButton: {
    padding: 8,
  },
  
  filterButtonText: {
    fontSize: 18,
    color: '#007AFF',
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
  
  // Categories styles
  categoriesSection: {
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  categoriesList: {
    paddingHorizontal: 16,
  },
  
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  categoryItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  
  // Filters styles
  filtersContainer: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    maxHeight: 300,
  },
  
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  filtersContent: {
    paddingHorizontal: 16,
  },
  
  filterGroup: {
    marginBottom: 16,
  },
  
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  
  filterInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  filterOptionText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  
  filterActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  clearButton: {
    backgroundColor: '#F0F0F0',
  },
  
  applyButton: {
    backgroundColor: '#007AFF',
  },
  
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Results styles
  resultsSection: {
    flex: 1,
    paddingVertical: 16,
  },
  
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  
  resultsCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Product item styles
  productItem: {
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
  
  productImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  productImagePlaceholder: {
    fontSize: 48,
    color: '#8E8E93',
  },
  
  productInfo: {
    flex: 1,
  },
  
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  productDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  productCategory: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  productSeller: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  productRatingText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  
  // Seller item styles
  sellerItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  sellerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
  
  sellerInfo: {
    flex: 1,
  },
  
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  
  sellerBusiness: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  
  sellerIndustry: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  
  sellerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  sellerRating: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  
  sellerProducts: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  sellerActions: {
    marginLeft: 12,
  },
  
  sellerActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  sellerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  
  quickActionIcon: {
    fontSize: 20,
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
  
  // Search suggestions styles
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
    maxHeight: 200,
  },
  
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  suggestionText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  
  // Trending styles
  trendingContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  trendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  trendingList: {
    flexDirection: 'row',
  },
  
  trendingItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  trendingImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  trendingImagePlaceholder: {
    fontSize: 24,
    color: '#8E8E93',
  },
  
  trendingName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  
  trendingPrice: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Analytics styles
  analyticsContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    margin: 16,
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
});

export default exploreStyles;
