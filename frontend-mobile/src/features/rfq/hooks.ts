import { rfqService } from '@/services/rfq';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRFQStore } from './store';
import { CreateQuoteRequest, CreateRFQRequest, RFQFilters, UpdateRFQRequest } from './types';

export const useRFQs = (filters?: RFQFilters) => {
  const { setRFQs, setLoading, setError } = useRFQStore();

  return useQuery({
    queryKey: ['rfqs', filters],
    queryFn: async () => {
      const response = await rfqService.getRFQs(filters);
      if (response.success && response.data) {
        setRFQs(response.data.rfqs);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch RFQs');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useRFQ = (id: string) => {
  const { setSelectedRFQ, setLoading, setError } = useRFQStore();

  return useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      const response = await rfqService.getRFQById(id);
      if (response.success && response.data) {
        setSelectedRFQ(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch RFQ');
    },
    enabled: !!id,
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  const { addRFQ, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async (data: CreateRFQRequest) => {
      const response = await rfqService.createRFQ(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create RFQ');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (rfq) => {
      addRFQ(rfq);
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['user-rfqs'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient();
  const { updateRFQ, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRFQRequest }) => {
      const response = await rfqService.updateRFQ(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update RFQ');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (rfq, variables) => {
      updateRFQ(variables.id, rfq);
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfq', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user-rfqs'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useDeleteRFQ = () => {
  const queryClient = useQueryClient();
  const { removeRFQ, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rfqService.deleteRFQ(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || 'Failed to delete RFQ');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (id) => {
      removeRFQ(id);
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['user-rfqs'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useSubmitQuote = () => {
  const queryClient = useQueryClient();
  const { addQuote, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async ({ rfqId, data }: { rfqId: string; data: CreateQuoteRequest }) => {
      const response = await rfqService.submitQuote(rfqId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to submit quote');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (quote, variables) => {
      addQuote(variables.rfqId, quote);
      queryClient.invalidateQueries({ queryKey: ['rfq', variables.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['user-quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useAcceptQuote = () => {
  const queryClient = useQueryClient();
  const { updateQuote, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async ({ rfqId, quoteId }: { rfqId: string; quoteId: string }) => {
      const response = await rfqService.acceptQuote(rfqId, quoteId);
      if (response.success) {
        return { rfqId, quoteId };
      }
      throw new Error(response.error || 'Failed to accept quote');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: ({ quoteId }) => {
      updateQuote(quoteId, { status: 'accepted' });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['user-quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useRejectQuote = () => {
  const queryClient = useQueryClient();
  const { updateQuote, setLoading, setError } = useRFQStore();

  return useMutation({
    mutationFn: async ({ rfqId, quoteId }: { rfqId: string; quoteId: string }) => {
      const response = await rfqService.rejectQuote(rfqId, quoteId);
      if (response.success) {
        return { rfqId, quoteId };
      }
      throw new Error(response.error || 'Failed to reject quote');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: ({ quoteId }) => {
      updateQuote(quoteId, { status: 'rejected' });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['user-quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUserRFQs = (filters?: RFQFilters) => {
  const { setUserRFQs, setLoading, setError } = useRFQStore();

  return useQuery({
    queryKey: ['user-rfqs', filters],
    queryFn: async () => {
      const response = await rfqService.getUserRFQs(filters);
      if (response.success && response.data) {
        setUserRFQs(response.data.rfqs);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user RFQs');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useUserQuotes = (filters?: { status?: string; page?: number; limit?: number }) => {
  const { setUserQuotes, setLoading, setError } = useRFQStore();

  return useQuery({
    queryKey: ['user-quotes', filters],
    queryFn: async () => {
      const response = await rfqService.getUserQuotes(filters);
      if (response.success && response.data) {
        setUserQuotes(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user quotes');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};










