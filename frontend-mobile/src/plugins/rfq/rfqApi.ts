import apiClient from '@/services/api';
import { 
  RFQ, 
  Quote, 
  CreateRFQRequest, 
  CreateQuoteRequest,
  ApiResponse 
} from './types';

/**
 * RFQ API Service
 * Centralized API calls to backend /rfq endpoints
 * Aligns with backend plugin structure
 */
export const rfqApi = {
  /**
   * Get all RFQs
   * Backend endpoint: GET /rfq/rfqs
   */
  async getRFQs(): Promise<ApiResponse<RFQ[]>> {
    try {
      const response = await apiClient.get('/rfq/rfqs');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch RFQs',
        success: false,
      };
    }
  },

  /**
   * Create a new RFQ
   * Backend endpoint: POST /rfq/rfqs
   */
  async createRFQ(data: CreateRFQRequest): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.post('/rfq/rfqs', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create RFQ',
        success: false,
      };
    }
  },

  /**
   * Get a specific RFQ
   * Backend endpoint: GET /rfq/rfqs/{rfq_id}
   */
  async getRFQ(rfqId: string): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.get(`/rfq/rfqs/${rfqId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch RFQ',
        success: false,
      };
    }
  },

  /**
   * Update an RFQ
   * Backend endpoint: PUT /rfq/rfqs/{rfq_id}
   */
  async updateRFQ(rfqId: string, data: Partial<CreateRFQRequest>): Promise<ApiResponse<RFQ>> {
    try {
      const response = await apiClient.put(`/rfq/rfqs/${rfqId}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update RFQ',
        success: false,
      };
    }
  },

  /**
   * Delete an RFQ
   * Backend endpoint: DELETE /rfq/rfqs/{rfq_id}
   */
  async deleteRFQ(rfqId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/rfq/rfqs/${rfqId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete RFQ',
        success: false,
      };
    }
  },

  /**
   * Get quotes for an RFQ
   * Backend endpoint: GET /rfq/rfqs/{rfq_id}/quotes
   */
  async getRFQQuotes(rfqId: string): Promise<ApiResponse<Quote[]>> {
    try {
      const response = await apiClient.get(`/rfq/rfqs/${rfqId}/quotes`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch quotes',
        success: false,
      };
    }
  },

  /**
   * Create a quote for an RFQ
   * Backend endpoint: POST /rfq/quotes
   */
  async createQuote(data: CreateQuoteRequest): Promise<ApiResponse<Quote>> {
    try {
      const response = await apiClient.post('/rfq/quotes', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create quote',
        success: false,
      };
    }
  },

  /**
   * Get a specific quote
   * Backend endpoint: GET /rfq/quotes/{quote_id}
   */
  async getQuote(quoteId: string): Promise<ApiResponse<Quote>> {
    try {
      const response = await apiClient.get(`/rfq/quotes/${quoteId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch quote',
        success: false,
      };
    }
  },

  /**
   * Update a quote
   * Backend endpoint: PUT /rfq/quotes/{quote_id}
   */
  async updateQuote(quoteId: string, data: Partial<CreateQuoteRequest>): Promise<ApiResponse<Quote>> {
    try {
      const response = await apiClient.put(`/rfq/quotes/${quoteId}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update quote',
        success: false,
      };
    }
  },

  /**
   * Delete a quote
   * Backend endpoint: DELETE /rfq/quotes/{quote_id}
   */
  async deleteQuote(quoteId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/rfq/quotes/${quoteId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete quote',
        success: false,
      };
    }
  },

  /**
   * Get suggested sellers for an RFQ
   * Backend endpoint: GET /rfq/rfqs/{rfq_id}/matches
   */
  async getSuggestedSellers(rfqId: string, limit = 20): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get(`/rfq/rfqs/${rfqId}/matches`, {
        params: { limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch suggested sellers',
        success: false,
      };
    }
  },

  /**
   * Search RFQs
   * Backend endpoint: GET /rfq/rfqs/search
   */
  async searchRFQs(query: string, filters?: {
    category?: string;
    status?: string;
    minBudget?: number;
    maxBudget?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<RFQ[]>> {
    try {
      const response = await apiClient.get('/rfq/rfqs/search', {
        params: { q: query, ...filters },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to search RFQs',
        success: false,
      };
    }
  },

  /**
   * Get user's RFQs
   * Backend endpoint: GET /rfq/rfqs/my
   */
  async getMyRFQs(): Promise<ApiResponse<RFQ[]>> {
    try {
      const response = await apiClient.get('/rfq/rfqs/my');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch my RFQs',
        success: false,
      };
    }
  },

  /**
   * Get user's quotes
   * Backend endpoint: GET /rfq/quotes/my
   */
  async getMyQuotes(): Promise<ApiResponse<Quote[]>> {
    try {
      const response = await apiClient.get('/rfq/quotes/my');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch my quotes',
        success: false,
      };
    }
  },

  /**
   * Accept a quote
   * Backend endpoint: POST /rfq/quotes/{quote_id}/accept
   */
  async acceptQuote(quoteId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/rfq/quotes/${quoteId}/accept`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to accept quote',
        success: false,
      };
    }
  },

  /**
   * Reject a quote
   * Backend endpoint: POST /rfq/quotes/{quote_id}/reject
   */
  async rejectQuote(quoteId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/rfq/quotes/${quoteId}/reject`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to reject quote',
        success: false,
      };
    }
  },

  /**
   * Get RFQ analytics
   * Backend endpoint: GET /rfq/analytics
   */
  async getRFQAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/rfq/analytics', {
        params: { period },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch RFQ analytics',
        success: false,
      };
    }
  },
};

export default rfqApi;
