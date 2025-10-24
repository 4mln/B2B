// API Configuration
export const API_CONFIG = {
  // Backend URL - Update this to match your backend
  BASE_URL: (process.env.EXPO_PUBLIC_API_URL || process.env.BACKEND_URL || (__DEV__ 
    ? 'http://localhost:8000' 
    : 'https://api.b2b-marketplace.com')) as string,
  
  // API prefix (set EXPO_PUBLIC_API_PREFIX="" if your backend has no prefix)
  API_PREFIX: (typeof process !== 'undefined' && process.env && typeof process.env.EXPO_PUBLIC_API_PREFIX !== 'undefined'
    ? String(process.env.EXPO_PUBLIC_API_PREFIX)
    : '/api/v1') as string,
  
  // API Version
  VERSION: 'v1',
  
  // Timeout settings (increased for production)
  TIMEOUT: 15000,  // 15 seconds for regular API calls
  HEALTH_CHECK_TIMEOUT: 8000,  // 8 seconds for health checks
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints (updated for unified user model)
    AUTH: {
      SEND_OTP: '/auth/otp/request',
      VERIFY_OTP: '/auth/otp/verify',
      REFRESH_TOKEN: '/refresh',
      PROFILE: '/users/profile',
      CURRENT_USER: '/users/profile',
      LOGOUT: '/auth/me/sessions/logout-all',
      REGISTER: '/users/register',
      CAPABILITIES: '/users/capabilities',
    },
    
    // Product endpoints
    PRODUCTS: {
      LIST: '/products',
      GET: '/products/:id',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id',
      SEARCH: '/products/search',
    },
    
    // Guild endpoints (categories)
    GUILDS: {
      LIST: '/guilds',
      GET: '/guilds/:id',
      PRODUCTS: '/guilds/:id/products',
    },
    
    // Store endpoints (new unified store management)
    STORES: {
      LIST: '/stores',
      GET: '/stores/:id',
      CREATE: '/stores/create',
      UPDATE: '/stores/:id/update',
      ACTIVATE: '/stores/:id/activate',
      STATS: '/stores/:id/stats',
      PRODUCTS: '/stores/:id/products',
      ADD_PRODUCT: '/stores/:id/products/:product_id/add',
      REMOVE_PRODUCT: '/stores/:id/products/:product_id/remove',
      PRODUCT_IMAGES: '/stores/:id/products/:product_id/images',
      SET_PRIMARY_IMAGE: '/stores/:id/products/:product_id/images/:image_id/primary',
    },
    
    // Seller endpoints (legacy - for backward compatibility)
    SELLERS: {
      LIST: '/sellers',
      GET: '/sellers/:id',
      STOREFRONT: '/sellers/:id/storefront',
    },
    
    // RFQ endpoints
    RFQS: {
      LIST: '/rfqs',
      GET: '/rfqs/:id',
      CREATE: '/rfqs',
      UPDATE: '/rfqs/:id',
      DELETE: '/rfqs/:id',
    },
    
    // Chat endpoints
    CHAT: {
      CONVERSATIONS: '/chat/conversations',
      MESSAGES: '/chat/conversations/:id/messages',
      SEND_MESSAGE: '/chat/conversations/:id/messages',
      CREATE_CONVERSATION: '/chat/conversations',
    },
    
    // Wallet endpoints
    WALLET: {
      BALANCE: '/wallet/balance',
      TRANSACTIONS: '/wallet/transactions',
      TOP_UP: '/wallet/top-up',
      WITHDRAW: '/wallet/withdraw',
    },
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

// Helper function to get API endpoint
export const getApiEndpoint = (category: keyof typeof API_CONFIG.ENDPOINTS, endpoint: string): string => {
  const categoryEndpoints = API_CONFIG.ENDPOINTS[category] as Record<string, string>;
  return categoryEndpoints[endpoint] || '';
};
