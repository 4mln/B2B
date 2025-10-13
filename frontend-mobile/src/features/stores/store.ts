import { create } from 'zustand';
import { Store, StoreStats, StoreProduct } from './types';
import { storeApi } from './api';

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  storeStats: StoreStats | null;
  storeProducts: StoreProduct[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStores: (page?: number, pageSize?: number) => Promise<void>;
  fetchStore: (storeId: string) => Promise<void>;
  createStore: (data: any) => Promise<Store | null>;
  updateStore: (storeId: string, data: any) => Promise<Store | null>;
  toggleStoreStatus: (storeId: string, isActive: boolean) => Promise<void>;
  fetchStoreStats: (storeId: string) => Promise<void>;
  fetchStoreProducts: (storeId: string, page?: number, pageSize?: number) => Promise<void>;
  addProductToStore: (storeId: string, productId: number) => Promise<void>;
  removeProductFromStore: (storeId: string, productId: number) => Promise<void>;
  setCurrentStore: (store: Store | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  currentStore: null,
  storeStats: null,
  storeProducts: [],
  isLoading: false,
  error: null,

  fetchStores: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.getStores(page, pageSize);
      if (response.success && response.data) {
        set({ stores: response.data.stores, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch stores', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch stores', isLoading: false });
    }
  },

  fetchStore: async (storeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.getStore(storeId);
      if (response.success && response.data) {
        set({ currentStore: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch store', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch store', isLoading: false });
    }
  },

  createStore: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.createStore(data);
      if (response.success && response.data) {
        const newStore = response.data;
        set((state) => ({
          stores: [...state.stores, newStore],
          currentStore: newStore,
          isLoading: false,
        }));
        return newStore;
      } else {
        set({ error: response.error || 'Failed to create store', isLoading: false });
        return null;
      }
    } catch (error) {
      set({ error: 'Failed to create store', isLoading: false });
      return null;
    }
  },

  updateStore: async (storeId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.updateStore(storeId, data);
      if (response.success && response.data) {
        const updatedStore = response.data;
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? updatedStore : store
          ),
          currentStore: state.currentStore?.id === storeId ? updatedStore : state.currentStore,
          isLoading: false,
        }));
        return updatedStore;
      } else {
        set({ error: response.error || 'Failed to update store', isLoading: false });
        return null;
      }
    } catch (error) {
      set({ error: 'Failed to update store', isLoading: false });
      return null;
    }
  },

  toggleStoreStatus: async (storeId: string, isActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.toggleStoreStatus(storeId, isActive);
      if (response.success && response.data) {
        const updatedStore = response.data;
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? updatedStore : store
          ),
          currentStore: state.currentStore?.id === storeId ? updatedStore : state.currentStore,
          isLoading: false,
        }));
      } else {
        set({ error: response.error || 'Failed to update store status', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update store status', isLoading: false });
    }
  },

  fetchStoreStats: async (storeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.getStoreStats(storeId);
      if (response.success && response.data) {
        set({ storeStats: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch store stats', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch store stats', isLoading: false });
    }
  },

  fetchStoreProducts: async (storeId: string, page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.getStoreProducts(storeId, page, pageSize);
      if (response.success && response.data) {
        set({ storeProducts: response.data.products, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch store products', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch store products', isLoading: false });
    }
  },

  addProductToStore: async (storeId: string, productId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.addProductToStore(storeId, productId);
      if (response.success) {
        // Refresh store products
        get().fetchStoreProducts(storeId);
      } else {
        set({ error: response.error || 'Failed to add product to store', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to add product to store', isLoading: false });
    }
  },

  removeProductFromStore: async (storeId: string, productId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeApi.removeProductFromStore(storeId, productId);
      if (response.success) {
        // Refresh store products
        get().fetchStoreProducts(storeId);
      } else {
        set({ error: response.error || 'Failed to remove product from store', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to remove product from store', isLoading: false });
    }
  },

  setCurrentStore: (store: Store | null) => {
    set({ currentStore: store });
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

