import apiClient from './api';

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity?: string;
  budget?: string;
  deliveryDate?: string;
  location?: string;
  specifications?: string;
  status: 'open' | 'closed' | 'awarded';
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface RFQFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateRFQRequest {
  title: string;
  description: string;
  category: string;
  quantity?: string;
  budget?: string;
  deliveryDate?: string;
  location?: string;
  specifications?: string;
}

export interface UpdateRFQRequest extends Partial<CreateRFQRequest> {}

export interface CreateQuoteRequest {
  price: number;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export const rfqService = {
  async getRFQs(filters?: RFQFilters): Promise<ApiResponse<{ rfqs: RFQ[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const response = await apiClient.get('/rfqs', { params: filters });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch RFQs', success: false };
    }
  },

  async getRFQById(id: string): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.get(`/rfqs/${id}`);
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch RFQ', success: false };
    }
  },

  async createRFQ(data: CreateRFQRequest): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.post('/rfqs', data);
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to create RFQ', success: false };
    }
  },

  async updateRFQ(id: string, data: UpdateRFQRequest): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.put(`/rfqs/${id}`, data);
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to update RFQ', success: false };
    }
  },

  async deleteRFQ(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/rfqs/${id}`);
      return { success: true } as ApiResponse<void>;
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete RFQ', success: false };
    }
  },

  async submitQuote(rfqId: string, data: CreateQuoteRequest): Promise<ApiResponse<Quote>> {
    try {
      const response = await apiClient.post(`/rfqs/${rfqId}/quotes`, data);
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to submit quote', success: false };
    }
  },

  async acceptQuote(rfqId: string, quoteId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/rfqs/${rfqId}/quotes/${quoteId}/accept`);
      return { success: true } as ApiResponse<void>;
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to accept quote', success: false };
    }
  },

  async rejectQuote(rfqId: string, quoteId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/rfqs/${rfqId}/quotes/${quoteId}/reject`);
      return { success: true } as ApiResponse<void>;
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to reject quote', success: false };
    }
  },

  async getUserRFQs(filters?: RFQFilters): Promise<ApiResponse<{ rfqs: RFQ[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const response = await apiClient.get('/me/rfqs', { params: filters });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch user RFQs', success: false };
    }
  },

  async getUserQuotes(filters?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<Quote[]>> {
    try {
      const response = await apiClient.get('/me/quotes', { params: filters });
      return { data: response.data, success: true };
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to fetch user quotes', success: false };
    }
  },
};


