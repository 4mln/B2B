import { API_CONFIG } from '@/config/api';
import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useAuthStore } from '@/features/auth/store';
import i18n from '@/i18n';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance with production-grade configuration
const normalizedPrefix = API_CONFIG.API_PREFIX?.startsWith('/') ? API_CONFIG.API_PREFIX : `/${API_CONFIG.API_PREFIX || ''}`;
const baseURL = `${API_CONFIG.BASE_URL}${normalizedPrefix}`
  .replace(/\/+$/,'')
  .replace(/([^:])\/\/+/g, '$1/');

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  // Add retry configuration
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
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

// Response interceptor to handle auth errors and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      // Log successful responses in dev mode
      try {
        console.log('[API Response]', response.status, response.config.url);
      } catch {}
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (refreshToken) {
          const refreshUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`;
          const response = await axios.post(refreshUrl, {
            refresh_token: refreshToken,
          }, {
            timeout: 10000,  // Shorter timeout for refresh
          });

          const { access_token, refresh_token } = response.data;
          await SecureStore.setItemAsync('auth_token', access_token);
          await SecureStore.setItemAsync('refresh_token', refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and trigger app logout flow
        console.error('Token refresh failed:', refreshError);
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        try {
          useAuthStore.getState().logout();
        } catch {}
      }
    }

    // Handle network errors with retry logic
    if (!error.response && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= API_CONFIG.MAX_RETRIES) {
        // Wait before retry with exponential backoff
        const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (__DEV__) {
          console.log(`[API Retry] Attempt ${originalRequest._retryCount}/${API_CONFIG.MAX_RETRIES}`, originalRequest.url);
        }
        
        return apiClient(originalRequest);
      }
    }

    // Network or timeout error (no response after retries)
    if (!error.response) {
      console.error('[API Network Error]', error.message, originalRequest?.url);
      
      try {
        const backLabel = i18n.t('common.back', 'Back');
        const title = i18n.t('errors.networkErrorTitle', 'Connection Error');
        const message = i18n.t('errors.networkOffline', 'No internet connection. Please check your network.');
        
        // Don't show message for background requests
        if (!originalRequest?._silent) {
          useMessageBoxStore.getState().show({ 
            type: 'error',
            title, 
            message, 
            actions: [{ label: backLabel }] 
          });
        }
      } catch {}
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('[API Server Error]', error.response.status, originalRequest?.url);
      
      try {
        const backLabel = i18n.t('common.back', 'Back');
        const title = i18n.t('errors.serverErrorTitle', 'Server Error');
        const message = i18n.t('errors.serverMaintenance', 'The server is currently experiencing issues. Please try again later.');
        
        if (!originalRequest?._silent) {
          useMessageBoxStore.getState().show({ 
            type: 'error',
            title, 
            message, 
            actions: [{ label: backLabel }] 
          });
        }
      } catch {}
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;










