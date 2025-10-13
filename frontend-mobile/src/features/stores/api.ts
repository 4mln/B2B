import apiClient from '@/services/api';
import { handleStoreError } from '@/utils/errorHandling';
import {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreStats,
  StoreListResponse,
  StoreProductsResponse,
  StoreProduct,
  StoreProductImage,
  ApiResponse,
} from './types';

export const storeApi = {
  /**
   * Get all stores
   */
  async getStores(page = 1, pageSize = 10): Promise<ApiResponse<StoreListResponse>> {
    try {
      const response = await apiClient.get('/stores', {
        params: { page, page_size: pageSize },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      handleStoreError(error.response?.data || error);
      return {
        error: error.response?.data?.detail || 'Failed to fetch stores',
        success: false,
      };
    }
  },

  /**
   * Get store by ID
   */
  async getStore(storeId: string): Promise<ApiResponse<Store>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch store',
        success: false,
      };
    }
  },

  /**
   * Create a new store
   */
  async createStore(data: CreateStoreRequest): Promise<ApiResponse<Store>> {
    try {
      const response = await apiClient.post('/stores/create', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      handleStoreError(error.response?.data || error);
      return {
        error: error.response?.data?.detail || 'Failed to create store',
        success: false,
      };
    }
  },

  /**
   * Update store
   */
  async updateStore(storeId: string, data: UpdateStoreRequest): Promise<ApiResponse<Store>> {
    try {
      const response = await apiClient.put(`/stores/${storeId}/update`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update store',
        success: false,
      };
    }
  },

  /**
   * Activate/deactivate store
   */
  async toggleStoreStatus(storeId: string, isActive: boolean): Promise<ApiResponse<Store>> {
    try {
      const response = await apiClient.patch(`/stores/${storeId}/activate`, { is_active: isActive });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update store status',
        success: false,
      };
    }
  },

  /**
   * Get store statistics
   */
  async getStoreStats(storeId: string): Promise<ApiResponse<StoreStats>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}/stats`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch store stats',
        success: false,
      };
    }
  },

  /**
   * Get products in store
   */
  async getStoreProducts(
    storeId: string,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<StoreProductsResponse>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}/products`, {
        params: { page, page_size: pageSize },
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
   * Get specific product in store
   */
  async getStoreProduct(storeId: string, productId: number): Promise<ApiResponse<StoreProduct>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}/products/${productId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch store product',
        success: false,
      };
    }
  },

  /**
   * Add product to store
   */
  async addProductToStore(storeId: string, productId: number): Promise<ApiResponse<StoreProduct>> {
    try {
      const response = await apiClient.post(`/stores/${storeId}/products/${productId}/add`);
      return {
        data: response.data,
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

  /**
   * Get product images in store
   */
  async getStoreProductImages(storeId: string, productId: number): Promise<ApiResponse<StoreProductImage[]>> {
    try {
      const response = await apiClient.get(`/stores/${storeId}/products/${productId}/images`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch product images',
        success: false,
      };
    }
  },

  /**
   * Upload product image to store
   */
  async uploadStoreProductImage(
    storeId: string,
    productId: number,
    imageFile: FormData
  ): Promise<ApiResponse<StoreProductImage>> {
    try {
      const response = await apiClient.post(`/stores/${storeId}/products/${productId}/images`, imageFile, {
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
        error: error.response?.data?.detail || 'Failed to upload product image',
        success: false,
      };
    }
  },

  /**
   * Set primary product image in store
   */
  async setPrimaryStoreProductImage(
    storeId: string,
    productId: number,
    imageId: string
  ): Promise<ApiResponse<StoreProductImage>> {
    try {
      const response = await apiClient.patch(
        `/stores/${storeId}/products/${productId}/images/${imageId}/primary`
      );
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to set primary image',
        success: false,
      };
    }
  },

  /**
   * Delete product image from store
   */
  async deleteStoreProductImage(
    storeId: string,
    productId: number,
    imageId: string
  ): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/stores/${storeId}/products/${productId}/images/${imageId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete product image',
        success: false,
      };
    }
  },
};
