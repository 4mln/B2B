/**
 * Explore Plugin Types
 * TypeScript interfaces for explore functionality
 * Aligns with backend product and seller schemas
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency: string;
  category: string;
  subcategory?: string;
  image?: string;
  images?: string[];
  sellerId: string;
  sellerName: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  availability: 'in_stock' | 'out_of_stock' | 'on_order';
  condition: 'new' | 'used' | 'refurbished';
  specifications?: Record<string, any>;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  businessName?: string;
  industry?: string;
  description?: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  isVerified: boolean;
  isFeatured: boolean;
  location?: string;
  website?: string;
  phone?: string;
  email?: string;
  socialLinks?: Record<string, string>;
  businessHours?: Record<string, string>;
  paymentMethods?: string[];
  shippingOptions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  rating?: number;
  availability?: string;
  condition?: string;
  location?: string;
  sellerId?: string;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  products: Product[];
  sellers: Seller[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: SearchFilters;
  suggestions?: string[];
}

export interface SearchSuggestion {
  id: string;
  query: string;
  type: 'product' | 'seller' | 'category';
  count: number;
  isPopular: boolean;
}

export interface TrendingProduct {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency: string;
  category: string;
  sellerName: string;
  rating?: number;
  trendScore: number;
  views: number;
  searches: number;
  period: string;
}

export interface PopularCategory {
  name: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  subcategories: Array<{
    name: string;
    count: number;
  }>;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  searchTrends: Array<{
    date: string;
    searches: number;
    uniqueSearches: number;
  }>;
  topCategories: Array<{
    category: string;
    searches: number;
    percentage: number;
  }>;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    searches: number;
    percentage: number;
  }>;
  conversionRate: number;
  averageSearchTime: number;
  bounceRate: number;
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ProductRecommendation {
  id: string;
  product: Product;
  reason: string;
  score: number;
  type: 'similar' | 'trending' | 'personalized' | 'category';
  metadata?: Record<string, any>;
}

export interface SellerRecommendation {
  id: string;
  seller: Seller;
  reason: string;
  score: number;
  type: 'similar' | 'trending' | 'personalized' | 'location';
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  ratings?: number[];
  availability?: string[];
  conditions?: string[];
  locations?: string[];
  sellers?: string[];
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  isSelected: boolean;
}

export interface FilterGroup {
  name: string;
  type: 'single' | 'multiple' | 'range';
  options: FilterOption[];
  isExpanded: boolean;
}

export interface SearchContext {
  query: string;
  filters: SearchFilters;
  results: SearchResult;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error?: string;
}

export interface SearchAction {
  type: 'SEARCH' | 'FILTER' | 'SORT' | 'CLEAR' | 'SAVE' | 'LOAD';
  payload: any;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult | null;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error?: string;
  lastSearch?: string;
  searchTime?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Explore state types
export interface ExploreState {
  products: Product[];
  sellers: Seller[];
  categories: string[];
  searchQuery: string;
  filters: SearchFilters;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  recommendations: ProductRecommendation[];
  trending: TrendingProduct[];
  popular: PopularCategory[];
  analytics: SearchAnalytics | null;
  loading: boolean;
  error: string | null;
}

export interface ExploreActions {
  setProducts: (products: Product[]) => void;
  setSellers: (sellers: Seller[]) => void;
  setCategories: (categories: string[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  addToHistory: (search: SearchHistory) => void;
  clearHistory: () => void;
  saveSearch: (search: SavedSearch) => void;
  deleteSavedSearch: (id: string) => void;
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
  setTrending: (trending: TrendingProduct[]) => void;
  setPopular: (popular: PopularCategory[]) => void;
  setAnalytics: (analytics: SearchAnalytics | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetState: () => void;
}

export default {};
