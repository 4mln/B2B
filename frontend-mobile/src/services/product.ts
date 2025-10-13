import apiClient from './api';

// Types
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
  // New store filtering
  store_id?: string;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Product service functions
export const productService = {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<ProductSearchResponse>> {
    try {
      const response = await apiClient.get('/products', { params: filters });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch products',
        success: false,
      };
    }
  },

  /**
   * Get a specific product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch product',
        success: false,
      };
    }
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.post('/products', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create product',
        success: false,
      };
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.put(`/products/${id}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update product',
        success: false,
      };
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/products/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete product',
        success: false,
      };
    }
  },

  /**
   * Search products (resilient to backend path differences)
   */
  async searchProducts(query: string, filters?: Omit<ProductFilters, 'search'>): Promise<ApiResponse<ProductSearchResponse>> {
    const params = { q: query, search: query, ...filters } as any;

    const tryPaths = async (paths: string[]): Promise<ApiResponse<ProductSearchResponse>> => {
      for (const path of paths) {
        try {
          const response = await apiClient.get(path, { params });
          return { data: response.data, success: true };
        } catch (error: any) {
          const status = error?.response?.status;
          if (status && status !== 404) {
            return {
              error: error.response?.data?.detail || `Failed to search products (status ${status})`,
              success: false,
            };
          }
          // if 404, continue to next path
        }
      }
      return { error: 'Failed to search products (no matching route)', success: false };
    };

    // Try common patterns in order of likelihood
    return await tryPaths([
      '/products',               // /api/products?q=...
      '/products/search',        // /api/products/search?q=...
      '/search/products',        // /api/search/products?q=...
      '/v1/products',            // /api/v1/products?q=...
      '/v1/products/search',     // /api/v1/products/search?q=...
    ]);
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, filters?: Omit<ProductFilters, 'category'>): Promise<ApiResponse<ProductSearchResponse>> {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/products`, {
        params: filters,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch products by category',
        success: false,
      };
    }
  },

  /**
   * Get user's products
   */
  async getUserProducts(filters?: Omit<ProductFilters, 'seller'>): Promise<ApiResponse<ProductSearchResponse>> {
    try {
      const response = await apiClient.get('/me/products', { params: filters });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch user products',
        success: false,
      };
    }
  },

  /**
   * Upload product images
   */
  async uploadImages(images: FormData): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.post('/products/images', images, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to upload images',
        success: false,
      };
    }
  },

  /**
   * Get product categories
   */
  async getCategories(): Promise<ApiResponse<{ id: string; name: string; icon: string }[]>> {
    try {
      const response = await apiClient.get('/categories');
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
   * Get products by store
   */
  async getProductsByStore(storeId: string, filters?: Omit<ProductFilters, 'store_id'>): Promise<ApiResponse<ProductSearchResponse>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}/products`, {
        params: { ...filters, store_id: storeId },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch store products',
        success: false,
      };
    }
  },

  /**
   * Add product to store
   */
  async addProductToStore(storeId: string, productId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/stores/${storeId}/products/${productId}/add`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to add product to store',
        success: false,
      };
    }
  },

  /**
   * Remove product from store
   */
  async removeProductFromStore(storeId: string, productId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/stores/${storeId}/products/${productId}/remove`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to remove product from store',
        success: false,
      };
    }
  },
};

