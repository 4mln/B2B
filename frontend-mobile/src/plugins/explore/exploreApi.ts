import apiClient from '@/services/api';
import { 
  Product, 
  Seller, 
  SearchFilters, 
  ApiResponse 
} from './types';

/**
 * Explore API Service
 * Centralized API calls to backend /products/search endpoints
 * Aligns with backend plugin structure
 */
export const exploreApi = {
  /**
   * Search products
   * Backend endpoint: GET /products/search
   */
  async searchProducts(query: string, filters?: SearchFilters): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/products/search', {
        params: { q: query, ...filters },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to search products',
        success: false,
      };
    }
  },

  /**
   * Search sellers
   * Backend endpoint: GET /sellers/search
   */
  async searchSellers(query: string, filters?: {
    industry?: string;
    location?: string;
    rating?: number;
    verified?: boolean;
  }): Promise<ApiResponse<Seller[]>> {
    try {
      const response = await apiClient.get('/sellers/search', {
        params: { q: query, ...filters },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to search sellers',
        success: false,
      };
    }
  },

  /**
   * Get product categories
   * Backend endpoint: GET /products/categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/products/categories');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch categories',
        success: false,
      };
    }
  },

  /**
   * Get trending products
   * Backend endpoint: GET /products/trending
   */
  async getTrendingProducts(limit = 20): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/products/trending', {
        params: { limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch trending products',
        success: false,
      };
    }
  },

  /**
   * Get top rated products
   * Backend endpoint: GET /products/top-rated
   */
  async getTopRatedProducts(limit = 20): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/products/top-rated', {
        params: { limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch top rated products',
        success: false,
      };
    }
  },

  /**
   * Get featured sellers
   * Backend endpoint: GET /sellers/featured
   */
  async getFeaturedSellers(limit = 20): Promise<ApiResponse<Seller[]>> {
    try {
      const response = await apiClient.get('/sellers/featured', {
        params: { limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch featured sellers',
        success: false,
      };
    }
  },

  /**
   * Get product recommendations
   * Backend endpoint: GET /products/recommendations
   */
  async getProductRecommendations(userId?: string, limit = 20): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/products/recommendations', {
        params: { userId, limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch recommendations',
        success: false,
      };
    }
  },

  /**
   * Get search suggestions
   * Backend endpoint: GET /search/suggestions
   */
  async getSearchSuggestions(query: string, limit = 10): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/search/suggestions', {
        params: { q: query, limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch suggestions',
        success: false,
      };
    }
  },

  /**
   * Get search analytics
   * Backend endpoint: GET /search/analytics
   */
  async getSearchAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
    searchTrends: Array<{ date: string; searches: number }>;
    topCategories: Array<{ category: string; searches: number }>;
  }>> {
    try {
      const response = await apiClient.get('/search/analytics', {
        params: { period },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch search analytics',
        success: false,
      };
    }
  },

  /**
   * Save search query
   * Backend endpoint: POST /search/save
   */
  async saveSearchQuery(query: string, filters?: SearchFilters): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/search/save', { query, filters });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to save search',
        success: false,
      };
    }
  },

  /**
   * Get saved searches
   * Backend endpoint: GET /search/saved
   */
  async getSavedSearches(): Promise<ApiResponse<Array<{
    id: string;
    query: string;
    filters: SearchFilters;
    createdAt: string;
  }>>> {
    try {
      const response = await apiClient.get('/search/saved');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch saved searches',
        success: false,
      };
    }
  },

  /**
   * Delete saved search
   * Backend endpoint: DELETE /search/saved/{id}
   */
  async deleteSavedSearch(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/search/saved/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete saved search',
        success: false,
      };
    }
  },

  /**
   * Get product filters
   * Backend endpoint: GET /products/filters
   */
  async getProductFilters(): Promise<ApiResponse<{
    categories: string[];
    priceRanges: Array<{ min: number; max: number; label: string }>;
    ratings: number[];
    availability: string[];
    locations: string[];
  }>> {
    try {
      const response = await apiClient.get('/products/filters');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch product filters',
        success: false,
      };
    }
  },

  /**
   * Get seller filters
   * Backend endpoint: GET /sellers/filters
   */
  async getSellerFilters(): Promise<ApiResponse<{
    industries: string[];
    locations: string[];
    ratings: number[];
    verificationStatus: string[];
  }>> {
    try {
      const response = await apiClient.get('/sellers/filters');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch seller filters',
        success: false,
      };
    }
  },

  /**
   * Get search history
   * Backend endpoint: GET /search/history
   */
  async getSearchHistory(limit = 20): Promise<ApiResponse<Array<{
    query: string;
    timestamp: string;
    resultCount: number;
  }>>> {
    try {
      const response = await apiClient.get('/search/history', {
        params: { limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch search history',
        success: false,
      };
    }
  },

  /**
   * Clear search history
   * Backend endpoint: DELETE /search/history
   */
  async clearSearchHistory(): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete('/search/history');
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to clear search history',
        success: false,
      };
    }
  },
};

export default exploreApi;
