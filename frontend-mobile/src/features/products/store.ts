import '@/polyfills/web';
import { Product, ProductFilters } from './types';
// Ensure process.env before requiring zustand (SSR/web)
// @ts-expect-error
if (typeof globalThis.process === 'undefined') {
  // @ts-expect-error
  globalThis.process = { env: {} };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = {};
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { create } = require('zustand');

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: ProductFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotal: (total: number) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  clearProducts: () => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  selectedProduct: null,
  filters: {},
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  hasMore: true,

  setProducts: (products) => set({ products }),
  
  addProducts: (newProducts) => set((state) => ({
    products: [...state.products, ...newProducts]
  })),
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  setFilters: (filters) => set({ filters, page: 1, products: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setTotal: (total) => set({ total }),
  
  setPage: (page) => set({ page }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  clearProducts: () => set({ products: [], page: 1, total: 0, hasMore: true }),
  
  updateProduct: (productId, updates) => set((state) => ({
    products: state.products.map(product =>
      product.id === productId ? { ...product, ...updates } : product
    ),
    selectedProduct: state.selectedProduct?.id === productId
      ? { ...state.selectedProduct, ...updates }
      : state.selectedProduct
  })),
  
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter(product => product.id !== productId),
    selectedProduct: state.selectedProduct?.id === productId ? null : state.selectedProduct
  })),
}));









