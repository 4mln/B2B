import apiClient from '@/services/api';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse } from './types';

/**
 * Products API Service
 * Centralized API calls to backend /products endpoints
 * Aligns with backend plugin structure
 */
export const productsApi = {
  /**
   * Get all products
   * Backend endpoint: GET /products
   */
  async getProducts(skip = 0, limit = 20, category?: string, search?: string): Promise<ApiResponse<Product[]>> {
    try {
      const params: any = { skip, limit };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await apiClient.get('/products', { params });
      return {
        data: response.data.products || response.data,
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
   * Get a specific product
   * Backend endpoint: GET /products/{product_id}
   */
  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get(`/products/${productId}`);
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
   * Backend endpoint: POST /products
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
   * Update a product
   * Backend endpoint: PUT /products/{product_id}
   */
  async updateProduct(productId: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.put(`/products/${productId}`, data);
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
   * Backend endpoint: DELETE /products/{product_id}
   */
  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/products/${productId}`);
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
   * Search products
   * Backend endpoint: GET /products/search
   */
  async searchProducts(query: string, category?: string): Promise<ApiResponse<Product[]>> {
    try {
      const params: any = { q: query };
      if (category) params.category = category;
      
      const response = await apiClient.get('/products/search', { params });
      return {
        data: response.data.products || response.data,
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
   * Get product categories
   * Backend endpoint: GET /products/categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/products/categories');
      return {
        data: response.data.categories || response.data,
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
   * Upload product image
   * Backend endpoint: POST /products/{product_id}/images
   */
  async uploadProductImage(productId: string, image: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/products/${productId}/images`, image, {
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
        error: error.response?.data?.detail || 'Failed to upload image',
        success: false,
      };
    }
  },

  /**
   * Get seller's products
   * Backend endpoint: GET /products/seller
   */
  async getSellerProducts(skip = 0, limit = 20): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/products/seller', {
        params: { skip, limit },
      });
      return {
        data: response.data.products || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch seller products',
        success: false,
      };
    }
  },

  /**
   * Get product reviews
   * Backend endpoint: GET /products/{product_id}/reviews
   */
  async getProductReviews(productId: string, skip = 0, limit = 20): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get(`/products/${productId}/reviews`, {
        params: { skip, limit },
      });
      return {
        data: response.data.reviews || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch reviews',
        success: false,
      };
    }
  },

  /**
   * Add product review
   * Backend endpoint: POST /products/{product_id}/reviews
   */
  async addProductReview(
    productId: string,
    rating: number,
    comment: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/products/${productId}/reviews`, {
        rating,
        comment,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to add review',
        success: false,
      };
    }
  },
};

export default productsApi;
