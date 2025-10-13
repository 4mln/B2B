import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../features/auth/store';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Add response interceptor to handle network errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors and timeouts gracefully
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('API request timeout - backend may be unavailable');
      return Promise.reject(new Error('Request timeout - please check your connection'));
    }

    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.warn('API connection refused - backend may not be running');
      return Promise.reject(new Error('Service unavailable - please try again later'));
    }

    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          await SecureStore.setItemAsync('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const { logout } = useAuthStore.getState();
        logout();
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Auth methods - Updated to match backend endpoints
  auth: {
    sendOTP: (phone: string) => apiClient.post('/auth/otp/request', { phone }),
    verifyOTP: (phone: string, otp: string) => apiClient.post('/auth/otp/verify', { phone, code: otp }),
    refreshToken: (refreshToken: string) => apiClient.post('/refresh', { refreshToken }),
    getProfile: () => apiClient.get('/users/me/profile'),
    updateProfile: (data: any) => apiClient.patch('/users/me/profile', data),
    logout: () => apiClient.post('/auth/me/sessions/logout-all'),
    getCurrentUser: () => apiClient.get('/auth/me'),
  },

  // Products
  products: {
    list: (params?: any) => apiClient.get('/api/v1/products/', { params }),
    get: (id: string) => apiClient.get(`/api/v1/products/${id}`),
    create: (data: any) => apiClient.post('/api/v1/products/', data),
    update: (id: string, data: any) => apiClient.put(`/api/v1/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/products/${id}`),
    search: (query: string, filters?: any) => apiClient.get('/api/v1/products/', {
      params: { q: query, ...filters }
    }),
  },

  // Guilds/Categories
  guilds: {
    list: () => apiClient.get('/guilds'),
    get: (id: string) => apiClient.get(`/guilds/${id}`),
    getProducts: (id: string, params?: any) => apiClient.get(`/guilds/${id}/products`, { params }),
  },

  // RFQs
  rfqs: {
    list: (params?: any) => apiClient.get('/rfq', { params }),
    get: (id: string) => apiClient.get(`/rfq/${id}`),
    create: (data: any) => apiClient.post('/rfq', data),
    update: (id: string, data: any) => apiClient.put(`/rfq/${id}`, data),
    delete: (id: string) => apiClient.delete(`/rfq/${id}`),
  },

  // Chat
  chat: {
    getConversations: () => apiClient.get('/messaging/chats'),
    getMessages: (conversationId: string) => apiClient.get(`/messaging/chats/${conversationId}/messages`),
    sendMessage: (conversationId: string, data: any) => apiClient.post(`/messaging/chats/${conversationId}/messages`, data),
    createConversation: (data: any) => apiClient.post('/messaging/chats', data),
  },

  // Wallet
  wallet: {
    getBalance: () => apiClient.get('/api/v1/wallet/me'),
    getTransactions: (params?: any) => apiClient.get('/api/v1/wallet/me/transactions', { params }),
    topUp: (data: any) => apiClient.post('/api/v1/wallet/deposit', data),
    withdraw: (data: any) => apiClient.post('/api/v1/wallet/withdraw', data),
  },
};

export default apiClient;
