import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletScreen from '../WalletScreen';
import { mockWallet, mockTransaction, mockUser } from '../../../test/utils/testUtils';

// Mock the wallet hooks
jest.mock('../walletHooks', () => ({
  useWalletHooks: () => ({
    wallets: [mockWallet],
    transactions: [mockTransaction],
    loading: false,
    error: null,
    deposit: jest.fn(),
    withdraw: jest.fn(),
    transfer: jest.fn(),
    createWallet: jest.fn(),
    refreshWallets: jest.fn(),
    refreshTransactions: jest.fn(),
    clearError: jest.fn(),
  }),
}));

describe('WalletScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders wallet screen correctly', () => {
    renderWithProviders(<WalletScreen />);

    expect(screen.getByText('Wallet')).toBeTruthy();
  });

  it('displays wallet balance', () => {
    renderWithProviders(<WalletScreen />);

    expect(screen.getByText('1000.00')).toBeTruthy();
    expect(screen.getByText('USD')).toBeTruthy();
  });

  it('displays transaction history', () => {
    renderWithProviders(<WalletScreen />);

    expect(screen.getByText('Test deposit')).toBeTruthy();
    expect(screen.getByText('$100.00')).toBeTruthy();
  });

  it('handles deposit action', async () => {
    const mockDeposit = jest.fn();
    
    jest.doMock('../walletHooks', () => ({
      useWalletHooks: () => ({
        wallets: [mockWallet],
        transactions: [mockTransaction],
        loading: false,
        error: null,
        deposit: mockDeposit,
        withdraw: jest.fn(),
        transfer: jest.fn(),
        createWallet: jest.fn(),
        refreshWallets: jest.fn(),
        refreshTransactions: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(<WalletScreen />);

    const depositButton = screen.getByText('Deposit');
    fireEvent.press(depositButton);

    await waitFor(() => {
      expect(mockDeposit).toHaveBeenCalled();
    });
  });

  it('handles withdraw action', async () => {
    const mockWithdraw = jest.fn();
    
    jest.doMock('../walletHooks', () => ({
      useWalletHooks: () => ({
        wallets: [mockWallet],
        transactions: [mockTransaction],
        loading: false,
        error: null,
        deposit: jest.fn(),
        withdraw: mockWithdraw,
        transfer: jest.fn(),
        createWallet: jest.fn(),
        refreshWallets: jest.fn(),
        refreshTransactions: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(<WalletScreen />);

    const withdrawButton = screen.getByText('Withdraw');
    fireEvent.press(withdrawButton);

    await waitFor(() => {
      expect(mockWithdraw).toHaveBeenCalled();
    });
  });

  it('handles transfer action', async () => {
    const mockTransfer = jest.fn();
    
    jest.doMock('../walletHooks', () => ({
      useWalletHooks: () => ({
        wallets: [mockWallet],
        transactions: [mockTransaction],
        loading: false,
        error: null,
        deposit: jest.fn(),
        withdraw: jest.fn(),
        transfer: mockTransfer,
        createWallet: jest.fn(),
        refreshWallets: jest.fn(),
        refreshTransactions: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(<WalletScreen />);

    const transferButton = screen.getByText('Transfer');
    fireEvent.press(transferButton);

    await waitFor(() => {
      expect(mockTransfer).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    jest.doMock('../walletHooks', () => ({
      useWalletHooks: () => ({
        wallets: [],
        transactions: [],
        loading: true,
        error: null,
        deposit: jest.fn(),
        withdraw: jest.fn(),
        transfer: jest.fn(),
        createWallet: jest.fn(),
        refreshWallets: jest.fn(),
        refreshTransactions: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(<WalletScreen />);

    expect(screen.getByText('Loading wallet...')).toBeTruthy();
  });

  it('displays error state', () => {
    jest.doMock('../walletHooks', () => ({
      useWalletHooks: () => ({
        wallets: [],
        transactions: [],
        loading: false,
        error: 'Test error',
        deposit: jest.fn(),
        withdraw: jest.fn(),
        transfer: jest.fn(),
        createWallet: jest.fn(),
        refreshWallets: jest.fn(),
        refreshTransactions: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(<WalletScreen />);

    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('handles wallet selection', () => {
    renderWithProviders(<WalletScreen />);

    const walletItem = screen.getByText('USD');
    fireEvent.press(walletItem);

    // Should show transactions for selected wallet
    expect(screen.getByText('Transactions - USD')).toBeTruthy();
  });

  it('handles back navigation', () => {
    const mockOnBack = jest.fn();
    renderWithProviders(<WalletScreen onBack={mockOnBack} />);

    const backButton = screen.getByText('← Back');
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
