import { API_CONFIG } from '@/config/api';
import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useAuthStore } from '@/features/auth/store';
import i18n from '@/i18n';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
const normalizedPrefix = API_CONFIG.API_PREFIX?.startsWith('/') ? API_CONFIG.API_PREFIX : `/${API_CONFIG.API_PREFIX || ''}`;
const baseURL = `${API_CONFIG.BASE_URL}${normalizedPrefix}`
  .replace(/\/+$/,'')
  .replace(/([^:])\/\/+/g, '$1/');
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    if (__DEV__) {
      try {
        // Safe dev-only request log
        // eslint-disable-next-line no-console
        console.log('[API]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`, config.params || '');
      } catch {}
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
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          await SecureStore.setItemAsync('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and trigger app logout flow
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        try {
          useAuthStore.getState().logout();
        } catch {}
      }
    }

    // Network or timeout error (no response)
    if (!error.response) {
      try {
        const backLabel = i18n.t('common.back');
        const title = i18n.t('errors.networkErrorTitle', 'Connection Error');
        const message = i18n.t('errors.networkOffline', 'No internet connection. Please check your network.');
        useMessageBoxStore.getState().show({ title, message, actions: [{ label: backLabel }] });
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;










