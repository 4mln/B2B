import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

/**
 * Test utilities for React Native Testing Library
 * Provides common setup for testing components with providers
 */

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'user',
  isActive: true,
  isVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockWallet = {
  id: '1',
  userId: '1',
  currency: 'USD',
  currencyType: 'fiat' as const,
  balance: 1000.00,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockTransaction = {
  id: '1',
  walletId: '1',
  amount: 100.00,
  currency: 'USD',
  transactionType: 'deposit' as const,
  description: 'Test deposit',
  status: 'completed' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockProduct = {
  id: '1',
  title: 'Test Product',
  description: 'Test product description',
  price: 99.99,
  currency: 'USD',
  category: 'Electronics',
  sellerId: '1',
  sellerName: 'Test Seller',
  rating: 4.5,
  stock: 10,
  availability: 'in_stock' as const,
  condition: 'new' as const,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockRFQ = {
  id: '1',
  buyerId: '1',
  title: 'Test RFQ',
  description: 'Test RFQ description',
  category: 'Electronics',
  budget: 1000,
  currency: 'USD',
  status: 'open' as const,
  visibility: 'public' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockQuote = {
  id: '1',
  rfqId: '1',
  sellerId: '1',
  sellerName: 'Test Seller',
  price: 950,
  currency: 'USD',
  description: 'Test quote description',
  status: 'pending' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockNotification = {
  id: '1',
  userId: '1',
  type: 'info' as const,
  title: 'Test Notification',
  message: 'Test notification message',
  isRead: false,
  priority: 'medium' as const,
  channel: 'push' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  data: success ? data : undefined,
  error: success ? undefined : 'Test error',
  success,
  message: success ? 'Success' : 'Error',
});

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Mock hooks
export const mockUseQuery = (data: any, isLoading = false, error = null) => ({
  data,
  isLoading,
  error,
  refetch: jest.fn(),
  isFetching: false,
  isError: !!error,
  isSuccess: !isLoading && !error,
});

export const mockUseMutation = (isLoading = false, error = null) => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading,
  error,
  isError: !!error,
  isSuccess: !isLoading && !error,
  reset: jest.fn(),
});

// Test helpers
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      try {
        callback();
        resolve(undefined);
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };
    check();
  });
};

export const createMockStore = (initialState: any) => ({
  getState: jest.fn(() => initialState),
  setState: jest.fn(),
  subscribe: jest.fn(),
  destroy: jest.fn(),
});

// Export everything
export * from '@testing-library/react-native';
export { customRender as render };
