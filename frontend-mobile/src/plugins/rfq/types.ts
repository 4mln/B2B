/**
 * RFQ Plugin Types
 * TypeScript interfaces for RFQ functionality
 * Aligns with backend RFQ plugin schemas
 */

export interface RFQ {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  currency: string;
  status: 'open' | 'closed' | 'pending';
  visibility: 'public' | 'private';
  invitedSellerIds?: string[];
  deliveryRequirements?: string;
  specifications?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  quoteCount?: number;
  acceptedQuoteId?: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  price?: number;
  currency: string;
  description: string;
  deliveryTime?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  terms?: string;
  validityPeriod?: number; // in days
}

export interface CreateRFQRequest {
  title: string;
  description: string;
  category: string;
  budget?: number;
  currency: string;
  visibility?: 'public' | 'private';
  invitedSellerIds?: string[];
  deliveryRequirements?: string;
  specifications?: string;
  deadline?: string;
}

export interface CreateQuoteRequest {
  rfqId: string;
  price?: number;
  currency: string;
  description: string;
  deliveryTime?: string;
  attachments?: string[];
  terms?: string;
  validityPeriod?: number;
}

export interface UpdateRFQRequest {
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  currency?: string;
  status?: 'open' | 'closed' | 'pending';
  visibility?: 'public' | 'private';
  invitedSellerIds?: string[];
  deliveryRequirements?: string;
  specifications?: string;
  deadline?: string;
}

export interface UpdateQuoteRequest {
  price?: number;
  currency?: string;
  description?: string;
  deliveryTime?: string;
  attachments?: string[];
  terms?: string;
  validityPeriod?: number;
}

export interface RFQSearchFilters {
  category?: string;
  status?: 'open' | 'closed' | 'pending';
  minBudget?: number;
  maxBudget?: number;
  currency?: string;
  visibility?: 'public' | 'private';
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

export interface QuoteFilters {
  rfqId?: string;
  sellerId?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

export interface SuggestedSeller {
  sellerId: string;
  name: string;
  subscription: string;
  isVerified: boolean;
  isFeatured: boolean;
  businessName?: string;
  kycStatus?: string;
  reputation: number;
  matchScore: number;
}

export interface RFQAnalytics {
  totalRFQs: number;
  openRFQs: number;
  closedRFQs: number;
  pendingRFQs: number;
  totalQuotes: number;
  averageQuoteCount: number;
  averageBudget: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface QuoteAnalytics {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  averagePrice: number;
  averageResponseTime: number; // in hours
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    quoteCount: number;
    acceptanceRate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface RFQNotification {
  id: string;
  userId: string;
  type: 'rfq_created' | 'rfq_updated' | 'quote_received' | 'quote_accepted' | 'quote_rejected';
  title: string;
  message: string;
  rfqId?: string;
  quoteId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface RFQSettings {
  defaultCurrency: string;
  autoCloseAfterDays: number;
  requireApprovalForLargeRFQs: boolean;
  largeRFQThreshold: number;
  notifications: {
    newQuotes: boolean;
    quoteAccepted: boolean;
    quoteRejected: boolean;
    rfqClosed: boolean;
  };
  allowedCategories: string[];
  maxBudget: number;
  minBudget: number;
}

export interface RFQTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  description: string;
  specifications: string;
  deliveryRequirements: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface CreateRFQTemplateRequest {
  name: string;
  category: string;
  title: string;
  description: string;
  specifications: string;
  deliveryRequirements: string;
  isPublic?: boolean;
}

export interface UpdateRFQTemplateRequest {
  name?: string;
  category?: string;
  title?: string;
  description?: string;
  specifications?: string;
  deliveryRequirements?: string;
  isPublic?: boolean;
}

export interface RFQReport {
  id: string;
  rfqId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface CreateRFQReportRequest {
  rfqId: string;
  reason: string;
  description: string;
}

export interface RFQStats {
  totalRFQs: number;
  totalQuotes: number;
  averageQuoteTime: number; // in hours
  acceptanceRate: number; // percentage
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    rfqCount: number;
    quoteCount: number;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// RFQ state types
export interface RFQState {
  rfqs: RFQ[];
  quotes: Quote[];
  currentRFQ: RFQ | null;
  loading: boolean;
  error: string | null;
  analytics: RFQAnalytics | null;
  settings: RFQSettings | null;
  notifications: RFQNotification[];
  unreadNotifications: number;
  searchQuery: string;
  filters: RFQSearchFilters;
}

export interface RFQActions {
  setRFQs: (rfqs: RFQ[]) => void;
  addRFQ: (rfq: RFQ) => void;
  updateRFQ: (rfqId: string, updates: Partial<RFQ>) => void;
  removeRFQ: (rfqId: string) => void;
  setCurrentRFQ: (rfq: RFQ | null) => void;
  setQuotes: (quotes: Quote[]) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (quoteId: string, updates: Partial<Quote>) => void;
  removeQuote: (quoteId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalytics: (analytics: RFQAnalytics | null) => void;
  setSettings: (settings: RFQSettings) => void;
  addNotification: (notification: RFQNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: RFQSearchFilters) => void;
  clearError: () => void;
  resetState: () => void;
}

export default {};
