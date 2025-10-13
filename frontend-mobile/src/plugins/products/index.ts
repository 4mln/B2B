import { PluginMetadata } from '../types';
import ProductsScreen from './ProductsScreen';

/**
 * Products Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the products plugin
 */
export const plugin: PluginMetadata = {
  name: 'products',
  version: '1.0.0',
  route: '/products',
  component: ProductsScreen,
  permissions: ['products:read', 'products:write'],
  dependencies: ['auth'],
  description: 'Product catalog and management functionality',
  icon: '📦',
  category: 'feature',
};

// Export all products-related components and utilities
export { default as ProductsScreen } from './ProductsScreen';
export { productsApi } from './productsApi';
export { useProductsHooks, useProduct, useSellerProducts } from './productsHooks';
export { productsStyles } from './productsStyles';
export * from './types';

// Export the plugin as default
export default plugin;
