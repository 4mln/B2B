import { API_CONFIG } from '@/config/api';

export interface BackendTestResult {
  isConnected: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
  backendUrl: string;
  retryCount?: number;
  components?: {
    database?: string;
    redis?: string;
  };
}

/**
 * Create an AbortController with timeout for React Native compatibility
 */
const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  // Clean up timeout if request completes before timeout
  const originalSignal = controller.signal;
  const cleanup = () => clearTimeout(timeoutId);
  
  originalSignal.addEventListener('abort', cleanup);
  
  return originalSignal;
};

/**
 * Exponential backoff retry helper
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Test connection to the backend with retry logic
 */
export const testBackendConnection = async (
  maxRetries: number = 2,
  timeoutMs: number = 8000
): Promise<BackendTestResult> => {
  const backendUrl = API_CONFIG.BASE_URL;
  let retryCount = 0;
  
  const performTest = async (): Promise<BackendTestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        // Add timeout
        signal: createTimeoutSignal(timeoutMs),
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log('✓ Backend health check successful:', {
          status: data.status,
          version: data.version,
          environment: data.environment,
          responseTime: `${responseTime}ms`,
        });
        
        return {
          isConnected: true,
          status: response.status,
          responseTime,
          backendUrl,
          retryCount,
          components: data.components,
        };
      } else {
        console.warn('✗ Backend health check failed:', {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
        });
        
        return {
          isConnected: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
          backendUrl,
          retryCount,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('✗ Backend connection test failed:', {
        error: errorMessage,
        responseTime: `${responseTime}ms`,
        retry: retryCount,
      });
      
      // Throw error to trigger retry
      throw error;
    }
  };
  
  try {
    // Try with retry logic
    return await retryWithBackoff(performTest, maxRetries, 1000);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      isConnected: false,
      error: errorMessage,
      responseTime: 0,
      backendUrl,
      retryCount,
    };
  }
};

/**
 * Test OTP endpoint availability (quick check, no retry needed)
 */
export const testOTPEndpoint = async (): Promise<BackendTestResult> => {
  const startTime = Date.now();
  const backendUrl = API_CONFIG.BASE_URL;
  
  // Normalize API prefix
  const normalizedPrefix = API_CONFIG.API_PREFIX?.startsWith('/') 
    ? API_CONFIG.API_PREFIX 
    : `/${API_CONFIG.API_PREFIX || ''}`;
  
  const otpEndpoint = API_CONFIG.ENDPOINTS.AUTH.SEND_OTP.startsWith('/')
    ? API_CONFIG.ENDPOINTS.AUTH.SEND_OTP
    : `/${API_CONFIG.ENDPOINTS.AUTH.SEND_OTP}`;
  
  const fullUrl = `${backendUrl}${normalizedPrefix}${otpEndpoint}`;
  
  try {
    // Test with a dummy phone number to check if endpoint exists
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ phone: '09123456789' }),
      signal: createTimeoutSignal(5000),
    });
    const responseTime = Date.now() - startTime;

    // Consider the endpoint reachable if server responds with any non-5xx status
    // This avoids marking the whole backend as disconnected when auth returns 401/400/422.
    const reachable = response.status < 500;
    
    if (__DEV__) {
      console.log('OTP endpoint test:', {
        url: fullUrl,
        status: response.status,
        reachable,
        responseTime: `${responseTime}ms`,
      });
    }
    
    return {
      isConnected: reachable,
      status: response.status,
      error: reachable ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      responseTime,
      backendUrl,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (__DEV__) {
      console.error('OTP endpoint test failed:', errorMessage);
    }
    
    return {
      isConnected: false,
      error: errorMessage,
      responseTime,
      backendUrl,
    };
  }
};

/**
 * Run comprehensive backend tests
 */
export const runBackendTests = async (): Promise<{
  health: BackendTestResult;
  otp: BackendTestResult;
  overall: boolean;
}> => {
  console.log('Testing backend connection...');
  
  const [healthResult, otpResult] = await Promise.all([
    testBackendConnection(),
    testOTPEndpoint(),
  ]);
  
  // Overall connectivity should reflect core health only; OTP specifics are diagnostic.
  const overall = healthResult.isConnected;
  
  console.log('Backend test results:', {
    health: healthResult,
    otp: otpResult,
    overall,
  });
  
  return {
    health: healthResult,
    otp: otpResult,
    overall,
  };
};
