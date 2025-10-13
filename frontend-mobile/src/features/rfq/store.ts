import { create } from 'zustand';
import { Quote, RFQ, RFQFilters, RFQState } from './types';

interface RFQStore extends RFQState {
  // Actions
  setRFQs: (rfqs: RFQ[]) => void;
  setSelectedRFQ: (rfq: RFQ | null) => void;
  setUserRFQs: (rfqs: RFQ[]) => void;
  setUserQuotes: (quotes: Quote[]) => void;
  setFilters: (filters: RFQFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRFQ: (rfq: RFQ) => void;
  updateRFQ: (rfqId: string, updates: Partial<RFQ>) => void;
  removeRFQ: (rfqId: string) => void;
  addQuote: (rfqId: string, quote: Quote) => void;
  updateQuote: (quoteId: string, updates: Partial<Quote>) => void;
  clearError: () => void;
}

export const useRFQStore = create<RFQStore>((set, get) => ({
  rfqs: [],
  selectedRFQ: null,
  userRFQs: [],
  userQuotes: [],
  filters: {},
  isLoading: false,
  error: null,

  setRFQs: (rfqs) => set({ rfqs }),
  
  setSelectedRFQ: (rfq) => set({ selectedRFQ: rfq }),
  
  setUserRFQs: (rfqs) => set({ userRFQs: rfqs }),
  
  setUserQuotes: (quotes) => set({ userQuotes: quotes }),
  
  setFilters: (filters) => set({ filters }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  addRFQ: (rfq) => set((state) => ({
    rfqs: [rfq, ...state.rfqs],
    userRFQs: [rfq, ...state.userRFQs]
  })),
  
  updateRFQ: (rfqId, updates) => set((state) => ({
    rfqs: state.rfqs.map(rfq =>
      rfq.id === rfqId ? { ...rfq, ...updates } : rfq
    ),
    userRFQs: state.userRFQs.map(rfq =>
      rfq.id === rfqId ? { ...rfq, ...updates } : rfq
    ),
    selectedRFQ: state.selectedRFQ?.id === rfqId
      ? { ...state.selectedRFQ, ...updates }
      : state.selectedRFQ
  })),
  
  removeRFQ: (rfqId) => set((state) => ({
    rfqs: state.rfqs.filter(rfq => rfq.id !== rfqId),
    userRFQs: state.userRFQs.filter(rfq => rfq.id !== rfqId),
    selectedRFQ: state.selectedRFQ?.id === rfqId ? null : state.selectedRFQ
  })),
  
  addQuote: (rfqId, quote) => set((state) => ({
    rfqs: state.rfqs.map(rfq =>
      rfq.id === rfqId ? { ...rfq, quotes: [...rfq.quotes, quote] } : rfq
    ),
    selectedRFQ: state.selectedRFQ?.id === rfqId
      ? { ...state.selectedRFQ, quotes: [...state.selectedRFQ.quotes, quote] }
      : state.selectedRFQ
  })),
  
  updateQuote: (quoteId, updates) => set((state) => ({
    rfqs: state.rfqs.map(rfq => ({
      ...rfq,
      quotes: rfq.quotes.map(quote =>
        quote.id === quoteId ? { ...quote, ...updates } : quote
      )
    })),
    selectedRFQ: state.selectedRFQ ? {
      ...state.selectedRFQ,
      quotes: state.selectedRFQ.quotes.map(quote =>
        quote.id === quoteId ? { ...quote, ...updates } : quote
      )
    } : null,
    userQuotes: state.userQuotes.map(quote =>
      quote.id === quoteId ? { ...quote, ...updates } : quote
    )
  })),
  
  clearError: () => set({ error: null }),
}));










