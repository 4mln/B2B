import { useStoreStore } from './store';
import { useAuthStore } from '../auth/store';
import { CAPABILITIES } from '../auth/types';

export const useStores = () => {
  const {
    stores,
    currentStore,
    storeStats,
    storeProducts,
    isLoading,
    error,
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    toggleStoreStatus,
    fetchStoreStats,
    fetchStoreProducts,
    addProductToStore,
    removeProductFromStore,
    setCurrentStore,
    clearError,
  } = useStoreStore();

  const { user, hasCapability } = useAuthStore();

  const canManageStores = hasCapability(CAPABILITIES.CAN_MANAGE_STORE);

  return {
    stores,
    currentStore,
    storeStats,
    storeProducts,
    isLoading,
    error,
    canManageStores,
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    toggleStoreStatus,
    fetchStoreStats,
    fetchStoreProducts,
    addProductToStore,
    removeProductFromStore,
    setCurrentStore,
    clearError,
  };
};

export const useStoreCapabilities = () => {
  const { user, hasCapability } = useAuthStore();

  return {
    canManageStores: hasCapability(CAPABILITIES.CAN_MANAGE_STORE),
    canManageProducts: hasCapability(CAPABILITIES.CAN_MANAGE_PRODUCTS),
    canPurchase: hasCapability(CAPABILITIES.CAN_PURCHASE),
    canSell: hasCapability(CAPABILITIES.CAN_SELL),
    user,
  };
};

