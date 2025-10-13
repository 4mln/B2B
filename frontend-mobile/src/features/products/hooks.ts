import '@/polyfills/web';
import { productService } from '@/services/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProductsStore } from './store';
import { CreateProductRequest, ProductFilters, UpdateProductRequest } from './types';

const getErrorMessage = (value: unknown): string => {
  if (!value) return 'Unknown error';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const useProducts = (filters?: ProductFilters) => {
  const { setProducts, setLoading, setError, setTotal, setPage, setHasMore } = useProductsStore();

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productService.getProducts(filters);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotal(response.data.total);
        setPage(response.data.page);
        setHasMore(response.data.page < response.data.totalPages);
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to fetch products');
    },
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
  });
};

export const useProduct = (id: string) => {
  const { setSelectedProduct, setLoading, setError } = useProductsStore();

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getProductById(id);
      if (response.success && response.data) {
        setSelectedProduct(response.data);
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to fetch product');
    },
    enabled: !!id,
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useProductsStore();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await productService.createProduct(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to create product');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['user-products'] });
    },
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { updateProduct, setLoading, setError } = useProductsStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      const response = await productService.updateProduct(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to update product');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, variables) => {
      updateProduct(variables.id, data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user-products'] });
    },
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { removeProduct, setLoading, setError } = useProductsStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        return id;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to delete product');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (id) => {
      removeProduct(id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['user-products'] });
    },
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useSearchProducts = () => {
  const { setProducts, setLoading, setError, setTotal } = useProductsStore();

  return useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: ProductFilters }) => {
      const response = await productService.searchProducts(query, filters);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotal(response.data.total);
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to search products');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUserProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['user-products', filters],
    queryFn: async () => {
      const response = await productService.getUserProducts(filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to fetch user products');
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await productService.getCategories();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(getErrorMessage(response.error) || 'Failed to fetch categories');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};









