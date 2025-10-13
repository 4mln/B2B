import { PluginMetadata } from '../types';
import WalletScreen from './WalletScreen';

/**
 * Wallet Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the wallet plugin
 */
export const plugin: PluginMetadata = {
  name: 'wallet',
  version: '1.0.0',
  route: '/wallet',
  component: WalletScreen,
  permissions: ['wallet:read', 'wallet:write'],
  dependencies: ['auth'],
  description: 'Digital wallet for managing balances, transactions, and financial operations',
  icon: '💰',
  category: 'core',
};

// Export all wallet-related components and utilities
export { default as WalletScreen } from './WalletScreen';
export { walletApi } from './walletApi';
export { useWalletHooks, useWallet, useWalletTransactions, useWalletAnalytics } from './walletHooks';
export { walletStyles } from './walletStyles';
export * from './types';

// Export the plugin as default
export default plugin;
