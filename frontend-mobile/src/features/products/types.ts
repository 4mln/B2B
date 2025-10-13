export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  images: string[];
  specifications: ProductSpecification[];
  seller: Seller;
  // New store association fields
  seller_id?: number; // Legacy seller ID
  store_id?: string; // New store association
  stock?: number;
  status?: 'pending' | 'approved' | 'rejected';
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  responseTime: string;
  verified: boolean;
  location: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  search?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popularity';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  images: string[];
  specifications: ProductSpecification[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  condition?: 'new' | 'used' | 'refurbished';
  location?: string;
  images?: string[];
  specifications?: ProductSpecification[];
  isAvailable?: boolean;
  stock?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

// Store-related product management
export interface AddProductToStoreRequest {
  product_id: number;
  store_id: string;
}

export interface StoreProductAssociation {
  product_id: number;
  store_id: string;
  added_at: string;
}

export interface ProductStoreFilter {
  store_id?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  search?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popularity';
  page?: number;
  limit?: number;
}










