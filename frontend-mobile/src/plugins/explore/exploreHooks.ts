import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreApi } from './exploreApi';
import { Product, Seller, SearchFilters } from './types';

/**
 * Explore Hooks
 * React hooks to manage explore state and API interactions
 * Provides centralized state management for explore functionality
 */
export const useExploreHooks = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const queryClient = useQueryClient();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['explore', 'categories'],
    queryFn: async () => {
      const response = await exploreApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch categories');
    },
    staleTime: 300000, // 5 minutes
  });

  // Search products mutation
  const searchProductsMutation = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
      const response = await exploreApi.searchProducts(query, filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to search products');
    },
    onSuccess: (searchResults) => {
      setProducts(searchResults);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Search sellers mutation
  const searchSellersMutation = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: any }) => {
      const response = await exploreApi.searchSellers(query, filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to search sellers');
    },
    onSuccess: (searchResults) => {
      setSellers(searchResults);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Get trending products
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ['explore', 'trending'],
    queryFn: async () => {
      const response = await exploreApi.getTrendingProducts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch trending products');
    },
    staleTime: 300000, // 5 minutes
  });

  // Get top rated products
  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    error: topRatedError,
  } = useQuery({
    queryKey: ['explore', 'top-rated'],
    queryFn: async () => {
      const response = await exploreApi.getTopRatedProducts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch top rated products');
    },
    staleTime: 300000, // 5 minutes
  });

  // Get featured sellers
  const {
    data: featuredSellersData,
    isLoading: featuredSellersLoading,
    error: featuredSellersError,
  } = useQuery({
    queryKey: ['explore', 'featured-sellers'],
    queryFn: async () => {
      const response = await exploreApi.getFeaturedSellers();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch featured sellers');
    },
    staleTime: 300000, // 5 minutes
  });

  // Get product recommendations
  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useQuery({
    queryKey: ['explore', 'recommendations'],
    queryFn: async () => {
      const response = await exploreApi.getProductRecommendations();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch recommendations');
    },
    staleTime: 300000, // 5 minutes
  });

  // Search products
  const searchProducts = useCallback(async (query: string, searchFilters?: SearchFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters || {});
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchProductsMutation.mutateAsync({ query, filters: searchFilters });
      return results;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [searchProductsMutation]);

  // Search sellers
  const searchSellers = useCallback(async (query: string, searchFilters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchSellersMutation.mutateAsync({ query, filters: searchFilters });
      return results;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [searchSellersMutation]);

  // Get categories
  const getCategories = useCallback(async () => {
    try {
      const response = await exploreApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch categories');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Refresh results
  const refreshResults = useCallback(() => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery, filters);
    }
  }, [searchQuery, filters, searchProducts]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(
      categoriesLoading ||
      searchProductsMutation.isPending ||
      searchSellersMutation.isPending ||
      trendingLoading ||
      topRatedLoading ||
      featuredSellersLoading ||
      recommendationsLoading
    );
  }, [
    categoriesLoading,
    searchProductsMutation.isPending,
    searchSellersMutation.isPending,
    trendingLoading,
    topRatedLoading,
    featuredSellersLoading,
    recommendationsLoading,
  ]);

  // Update error state
  useEffect(() => {
    if (categoriesError || trendingError || topRatedError || featuredSellersError || recommendationsError) {
      setError(
        categoriesError?.message ||
        trendingError?.message ||
        topRatedError?.message ||
        featuredSellersError?.message ||
        recommendationsError?.message ||
        'An error occurred'
      );
    }
  }, [categoriesError, trendingError, topRatedError, featuredSellersError, recommendationsError]);

  return {
    // State
    products,
    sellers,
    categories,
    loading,
    error,
    searchQuery,
    filters,
    
    // Actions
    searchProducts,
    searchSellers,
    getCategories,
    refreshResults,
    clearError,
    setFilters,
    
    // Data
    trendingProducts: trendingData || [],
    topRatedProducts: topRatedData || [],
    featuredSellers: featuredSellersData || [],
    recommendations: recommendationsData || [],
    
    // Mutation states
    isSearching: searchProductsMutation.isPending || searchSellersMutation.isPending,
  };
};

/**
 * Hook for search suggestions
 */
export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: suggestionsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['explore', 'suggestions', query],
    queryFn: async () => {
      const response = await exploreApi.getSearchSuggestions(query);
      if (response.success && response.data) {
        setSuggestions(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch suggestions');
    },
    enabled: query.length > 2,
    staleTime: 30000, // 30 seconds
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
    suggestions,
    loading,
    error,
  };
};

/**
 * Hook for search analytics
 */
export const useSearchAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analyticsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['explore', 'analytics', period],
    queryFn: async () => {
      const response = await exploreApi.getSearchAnalytics(period);
      if (response.success && response.data) {
        setAnalytics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch analytics');
    },
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

/**
 * Hook for saved searches
 */
export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: savedSearchesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['explore', 'saved-searches'],
    queryFn: async () => {
      const response = await exploreApi.getSavedSearches();
      if (response.success && response.data) {
        setSavedSearches(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch saved searches');
    },
  });

  const saveSearchMutation = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
      const response = await exploreApi.saveSearchQuery(query, filters);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Failed to save search');
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const deleteSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await exploreApi.deleteSavedSearch(id);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Failed to delete saved search');
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const saveSearch = useCallback(async (query: string, filters?: SearchFilters) => {
    return saveSearchMutation.mutateAsync({ query, filters });
  }, [saveSearchMutation]);

  const deleteSearch = useCallback(async (id: string) => {
    return deleteSearchMutation.mutateAsync(id);
  }, [deleteSearchMutation]);

  return {
    savedSearches,
    loading,
    error,
    saveSearch,
    deleteSearch,
    isSaving: saveSearchMutation.isPending,
    isDeleting: deleteSearchMutation.isPending,
  };
};

export default useExploreHooks;
