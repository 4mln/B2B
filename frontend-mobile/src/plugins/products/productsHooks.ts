import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from './productsApi';
import { Product, CreateProductRequest, UpdateProductRequest } from './types';

/**
 * Products Hooks
 * React hooks to manage products state and API interactions
 * Provides centralized state management for products functionality
 */
export const useProductsHooks = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const queryClient = useQueryClient();

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', 'list'],
    queryFn: async () => {
      const response = await productsApi.getProducts(0, 20);
      if (response.success && response.data) {
        setProducts(response.data);
        setCurrentPage(0);
        setHasMore(response.data.length === 20);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch products');
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const response = await productsApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch categories');
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await productsApi.createProduct(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create product');
    },
    onSuccess: (newProduct) => {
      setProducts(prev => [newProduct, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: UpdateProductRequest }) => {
      const response = await productsApi.updateProduct(productId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update product');
    },
    onSuccess: (updatedProduct) => {
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await productsApi.deleteProduct(productId);
      if (response.success) {
        return productId;
      }
      throw new Error(response.error || 'Failed to delete product');
    },
    onSuccess: (productId) => {
      setProducts(prev => prev.filter(product => product.id !== productId));
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      refetchProducts();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.searchProducts(query);
      if (response.success && response.data) {
        setProducts(response.data);
        setCurrentPage(0);
        setHasMore(false); // Search results don't have pagination
        return response.data;
      }
      throw new Error(response.error || 'Failed to search products');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refetchProducts]);

  // Load more products
  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const response = await productsApi.getProducts(nextPage * 20, 20);
      if (response.success && response.data) {
        setProducts(prev => [...prev, ...response.data!]);
        setCurrentPage(nextPage);
        setHasMore(response.data.length === 20);
        return response.data;
      }
      throw new Error(response.error || 'Failed to load more products');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading]);

  // Refresh products
  const refreshProducts = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  // Create product
  const createProduct = useCallback(async (data: CreateProductRequest) => {
    return createProductMutation.mutateAsync(data);
  }, [createProductMutation]);

  // Update product
  const updateProduct = useCallback(async (productId: string, data: UpdateProductRequest) => {
    return updateProductMutation.mutateAsync({ productId, data });
  }, [updateProductMutation]);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    return deleteProductMutation.mutateAsync(productId);
  }, [deleteProductMutation]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(productsLoading || categoriesLoading || createProductMutation.isPending || updateProductMutation.isPending);
  }, [productsLoading, categoriesLoading, createProductMutation.isPending, updateProductMutation.isPending]);

  // Update error state
  useEffect(() => {
    if (productsError) {
      setError(productsError.message);
    } else if (categoriesError) {
      setError(categoriesError.message);
    }
  }, [productsError, categoriesError]);

  return {
    // State
    products,
    categories,
    loading,
    error,
    hasMore,
    
    // Actions
    searchProducts,
    refreshProducts,
    loadMoreProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
};

/**
 * Hook for managing a specific product
 */
export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: productData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['products', 'detail', productId],
    queryFn: async () => {
      const response = await productsApi.getProduct(productId);
      if (response.success && response.data) {
        setProduct(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch product');
    },
    enabled: !!productId,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    product,
    loading,
    error,
  };
};

/**
 * Hook for managing seller's products
 */
export const useSellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: productsData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['products', 'seller'],
    queryFn: async () => {
      const response = await productsApi.getSellerProducts();
      if (response.success && response.data) {
        setProducts(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch seller products');
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    products,
    loading,
    error,
    refresh,
  };
};

export default useProductsHooks;
