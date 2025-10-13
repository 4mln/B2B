/**
 * Products Plugin Types
 * TypeScript interfaces for products functionality
 * Aligns with backend products plugin schemas
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock?: number;
  sku?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  rating?: number;
  reviewCount?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  stock?: number;
  sku?: string;
  tags?: string[];
  specifications?: Record<string, any>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  stock?: number;
  sku?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  isActive?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProductSearchRequest {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  isVerified: boolean;
}

export interface CreateProductReviewRequest {
  rating: number;
  comment: string;
}

export interface ProductReviewResponse {
  reviews: ProductReview[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface UploadProductImageRequest {
  productId: string;
  image: File;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductImageResponse {
  images: ProductImage[];
  primaryImage?: ProductImage;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  name: string;
  value: string;
  unit?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductSpecificationRequest {
  name: string;
  value: string;
  unit?: string;
  order?: number;
}

export interface UpdateProductSpecificationRequest {
  name?: string;
  value?: string;
  unit?: string;
  order?: number;
}

export interface ProductTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface CreateProductTagRequest {
  name: string;
  color?: string;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  clicks: number;
  favorites: number;
  shares: number;
  conversions: number;
  revenue: number;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
}

export interface ProductComparison {
  products: Product[];
  specifications: {
    name: string;
    values: Record<string, string>;
  }[];
  differences: {
    specification: string;
    products: Record<string, string>;
  }[];
}

export interface ProductWishlist {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface CreateProductWishlistRequest {
  productId: string;
}

export interface ProductWishlistResponse {
  wishlist: ProductWishlist[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductRecommendation {
  product: Product;
  reason: string;
  score: number;
}

export interface ProductRecommendationResponse {
  recommendations: ProductRecommendation[];
  total: number;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  inStock?: boolean;
  sellerId?: string;
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'rating';
  order: 'asc' | 'desc';
}

export interface ProductListRequest {
  page?: number;
  limit?: number;
  search?: string;
  filter?: ProductFilter;
  sort?: ProductSort;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Product state types
export interface ProductState {
  products: Product[];
  categories: string[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchQuery: string;
  selectedCategory: string | null;
  filters: ProductFilter;
  sort: ProductSort;
}

export interface ProductActions {
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  setCurrentProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setFilters: (filters: ProductFilter) => void;
  setSort: (sort: ProductSort) => void;
  clearFilters: () => void;
  resetState: () => void;
}

export default {};
