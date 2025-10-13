import apiClient from './api';

export interface Seller {
  id: number;
  name: string;
  email: string;
  rating: number;
}

export interface CreateSellerRequest {
  name: string;
  email: string;
}

export interface UpdateSellerRequest {
  name?: string;
  email?: string;
}

export interface ListSellersParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

const sellerService = {
  /**
   * Get a list of sellers with optional filtering and pagination
   */
  listSellers: async (params: ListSellersParams = {}) => {
    const response = await apiClient.get<Seller[]>('/api/v1/sellers', { params });
    return response.data;
  },

  /**
   * Get a seller by ID
   */
  getSeller: async (id: number) => {
    const response = await apiClient.get<Seller>(`/api/v1/sellers/${id}`);
    return response.data;
  },

  /**
   * Create a new seller
   */
  createSeller: async (data: CreateSellerRequest) => {
    const response = await apiClient.post<Seller>('/api/v1/sellers', data);
    return response.data;
  },

  /**
   * Update an existing seller
   */
  updateSeller: async (id: number, data: UpdateSellerRequest) => {
    const response = await apiClient.patch<Seller>(`/api/v1/sellers/${id}`, data);
    return response.data;
  },

  /**
   * Delete a seller
   */
  deleteSeller: async (id: number) => {
    await apiClient.delete(`/api/v1/sellers/${id}`);
    return true;
  },
};

export default sellerService;