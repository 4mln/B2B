export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity?: string;
  budget?: string;
  deliveryDate?: string;
  location?: string;
  specifications?: string;
  status: 'open' | 'closed' | 'awarded';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  quotes: Quote[];
  attachments?: Attachment[];
}

export interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  supplier: Supplier;
  price: number;
  description: string;
  deliveryTime: string;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  verified: boolean;
  location: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface CreateRFQRequest {
  title: string;
  description: string;
  category: string;
  quantity?: string;
  budget?: string;
  deliveryDate?: string;
  location?: string;
  specifications?: string;
  attachments?: Attachment[];
}

export interface UpdateRFQRequest {
  title?: string;
  description?: string;
  category?: string;
  quantity?: string;
  budget?: string;
  deliveryDate?: string;
  location?: string;
  specifications?: string;
  status?: 'open' | 'closed' | 'awarded';
  attachments?: Attachment[];
}

export interface RFQFilters {
  category?: string;
  status?: string;
  location?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'budget_high' | 'budget_low';
  page?: number;
  limit?: number;
}

export interface RFQSearchResponse {
  rfqs: RFQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateQuoteRequest {
  price: number;
  description: string;
  deliveryTime: string;
  terms: string;
}

export interface RFQState {
  rfqs: RFQ[];
  selectedRFQ: RFQ | null;
  userRFQs: RFQ[];
  userQuotes: Quote[];
  filters: RFQFilters;
  isLoading: boolean;
  error: string | null;
}










