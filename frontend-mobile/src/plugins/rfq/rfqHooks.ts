import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from './rfqApi';
import { RFQ, Quote, CreateRFQRequest, CreateQuoteRequest } from './types';

/**
 * RFQ Hooks
 * React hooks to manage RFQ state and API interactions
 * Provides centralized state management for RFQ functionality
 */
export const useRFQHooks = () => {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch RFQs
  const {
    data: rfqsData,
    isLoading: rfqsLoading,
    error: rfqsError,
    refetch: refetchRFQs,
  } = useQuery({
    queryKey: ['rfq', 'list'],
    queryFn: async () => {
      const response = await rfqApi.getRFQs();
      if (response.success && response.data) {
        setRFQs(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch RFQs');
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Create RFQ mutation
  const createRFQMutation = useMutation({
    mutationFn: async (data: CreateRFQRequest) => {
      const response = await rfqApi.createRFQ(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create RFQ');
    },
    onSuccess: (newRFQ) => {
      setRFQs(prev => [newRFQ, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['rfq', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: CreateQuoteRequest) => {
      const response = await rfqApi.createQuote(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create quote');
    },
    onSuccess: (newQuote) => {
      setQuotes(prev => [newQuote, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['rfq', 'quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await rfqApi.acceptQuote(quoteId);
      if (response.success) {
        return quoteId;
      }
      throw new Error(response.error || 'Failed to accept quote');
    },
    onSuccess: (quoteId) => {
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'accepted' }
            : quote
        )
      );
      queryClient.invalidateQueries({ queryKey: ['rfq', 'quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Reject quote mutation
  const rejectQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await rfqApi.rejectQuote(quoteId);
      if (response.success) {
        return quoteId;
      }
      throw new Error(response.error || 'Failed to reject quote');
    },
    onSuccess: (quoteId) => {
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'rejected' }
            : quote
        )
      );
      queryClient.invalidateQueries({ queryKey: ['rfq', 'quotes'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Fetch quotes for a specific RFQ
  const fetchQuotes = useCallback(async (rfqId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await rfqApi.getRFQQuotes(rfqId);
      if (response.success && response.data) {
        setQuotes(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch quotes');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search RFQs
  const searchRFQs = useCallback(async (query: string) => {
    if (!query.trim()) {
      refetchRFQs();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await rfqApi.searchRFQs(query);
      if (response.success && response.data) {
        setRFQs(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to search RFQs');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refetchRFQs]);

  // Create RFQ
  const createRFQ = useCallback(async (data: CreateRFQRequest) => {
    return createRFQMutation.mutateAsync(data);
  }, [createRFQMutation]);

  // Create quote
  const createQuote = useCallback(async (data: CreateQuoteRequest) => {
    return createQuoteMutation.mutateAsync(data);
  }, [createQuoteMutation]);

  // Accept quote
  const acceptQuote = useCallback(async (quoteId: string) => {
    return acceptQuoteMutation.mutateAsync(quoteId);
  }, [acceptQuoteMutation]);

  // Reject quote
  const rejectQuote = useCallback(async (quoteId: string) => {
    return rejectQuoteMutation.mutateAsync(quoteId);
  }, [rejectQuoteMutation]);

  // Refresh RFQs
  const refreshRFQs = useCallback(() => {
    refetchRFQs();
  }, [refetchRFQs]);

  // Refresh quotes
  const refreshQuotes = useCallback((rfqId: string) => {
    fetchQuotes(rfqId);
  }, [fetchQuotes]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(rfqsLoading || createRFQMutation.isPending || createQuoteMutation.isPending);
  }, [rfqsLoading, createRFQMutation.isPending, createQuoteMutation.isPending]);

  // Update error state
  useEffect(() => {
    if (rfqsError) {
      setError(rfqsError.message);
    }
  }, [rfqsError]);

  return {
    // State
    rfqs,
    quotes,
    loading,
    error,
    
    // Actions
    createRFQ,
    createQuote,
    acceptQuote,
    rejectQuote,
    searchRFQs,
    refreshRFQs,
    refreshQuotes,
    fetchQuotes,
    clearError,
    
    // Mutation states
    isCreatingRFQ: createRFQMutation.isPending,
    isCreatingQuote: createQuoteMutation.isPending,
    isAcceptingQuote: acceptQuoteMutation.isPending,
    isRejectingQuote: rejectQuoteMutation.isPending,
  };
};

/**
 * Hook for managing a specific RFQ
 */
export const useRFQ = (rfqId: string) => {
  const [rfq, setRFQ] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: rfqData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['rfq', 'detail', rfqId],
    queryFn: async () => {
      const response = await rfqApi.getRFQ(rfqId);
      if (response.success && response.data) {
        setRFQ(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch RFQ');
    },
    enabled: !!rfqId,
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
    rfq,
    loading,
    error,
  };
};

/**
 * Hook for managing RFQ quotes
 */
export const useRFQQuotes = (rfqId: string) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: quotesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['rfq', 'quotes', rfqId],
    queryFn: async () => {
      const response = await rfqApi.getRFQQuotes(rfqId);
      if (response.success && response.data) {
        setQuotes(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch quotes');
    },
    enabled: !!rfqId,
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
    quotes,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook for RFQ analytics
 */
export const useRFQAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analyticsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['rfq', 'analytics', period],
    queryFn: async () => {
      const response = await rfqApi.getRFQAnalytics(period);
      if (response.success && response.data) {
        setAnalytics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch analytics');
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

  return {
    analytics,
    loading,
    error,
  };
};

export default useRFQHooks;
