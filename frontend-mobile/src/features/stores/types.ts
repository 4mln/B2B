// Store types for the unified store management system

export interface Store {
  id: string;
  user_id: string;
  name: string;
  address: string;
  banner?: string;
  subscription_type: 'free' | 'silver' | 'gold';
  is_active: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
  products?: StoreProduct[];
}

export interface StoreProduct {
  id: number;
  seller_id: number;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  images?: StoreProductImage[];
}

export interface StoreProductImage {
  id: string;
  product_id: number;
  store_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  banner?: string;
  subscription_type?: 'free' | 'silver' | 'gold';
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  banner?: string;
  subscription_type?: 'free' | 'silver' | 'gold';
}

export interface StoreStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  views_count: number;
}

export interface StoreListResponse {
  stores: Store[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StoreProductsResponse {
  products: StoreProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

