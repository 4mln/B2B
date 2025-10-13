import { cacheData, getCachedData, getAllCachedData, addToSyncQueue } from '@/services/offlineService';
import { trackFeatureUsage } from '@/services/analytics';

/**
 * Offline-aware RFQ API
 * Provides offline capabilities for RFQ functionality
 */

export interface OfflineRFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget: number;
  currency: string;
  deadline: number;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  buyerId: string;
  timestamp: number;
  synced: boolean;
  metadata?: any;
}

export interface OfflineQuote {
  id: string;
  rfqId: string;
  sellerId: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  deliveryTime: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  synced: boolean;
  metadata?: any;
}

/**
 * Cache RFQ data
 */
export const cacheRFQ = async (rfq: OfflineRFQ): Promise<void> => {
  try {
    await cacheData('rfq', rfq.id, rfq);
    
    // Track caching
    trackFeatureUsage('rfq_offline', 'cache_rfq', {
      rfqId: rfq.id,
      category: rfq.category,
      status: rfq.status,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to cache RFQ:', error);
  }
};

/**
 * Get cached RFQ
 */
export const getCachedRFQ = async (rfqId: string): Promise<OfflineRFQ | null> => {
  try {
    return await getCachedData('rfq', rfqId);
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to get cached RFQ:', error);
    return null;
  }
};

/**
 * Get all cached RFQs
 */
export const getAllCachedRFQs = async (): Promise<OfflineRFQ[]> => {
  try {
    return await getAllCachedData('rfq');
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to get all cached RFQs:', error);
    return [];
  }
};

/**
 * Cache quote data
 */
export const cacheQuote = async (quote: OfflineQuote): Promise<void> => {
  try {
    await cacheData('quote', quote.id, quote);
    
    // Track caching
    trackFeatureUsage('rfq_offline', 'cache_quote', {
      quoteId: quote.id,
      rfqId: quote.rfqId,
      sellerId: quote.sellerId,
      status: quote.status,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to cache quote:', error);
  }
};

/**
 * Get cached quotes for RFQ
 */
export const getCachedQuotes = async (rfqId: string): Promise<OfflineQuote[]> => {
  try {
    const allQuotes = await getAllCachedData('quote');
    return allQuotes.filter(quote => quote.rfqId === rfqId);
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to get cached quotes:', error);
    return [];
  }
};

/**
 * Create RFQ offline
 */
export const createRFQOffline = async (
  title: string,
  description: string,
  category: string,
  quantity: number,
  unit: string,
  budget: number,
  currency: string,
  deadline: number,
  buyerId: string,
  metadata?: any
): Promise<string> => {
  try {
    const rfqId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const rfq: OfflineRFQ = {
      id: rfqId,
      title,
      description,
      category,
      quantity,
      unit,
      budget,
      currency,
      deadline,
      status: 'draft',
      buyerId,
      timestamp: Date.now(),
      synced: false,
      metadata,
    };
    
    // Cache the RFQ
    await cacheRFQ(rfq);
    
    // Add to sync queue
    await addToSyncQueue('rfq', 'create', rfq);
    
    // Track offline RFQ creation
    trackFeatureUsage('rfq_offline', 'create_rfq', {
      rfqId,
      category,
      budget,
      currency,
    });
    
    return rfqId;
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to create RFQ offline:', error);
    throw error;
  }
};

/**
 * Update RFQ offline
 */
export const updateRFQOffline = async (
  rfqId: string,
  updates: Partial<OfflineRFQ>
): Promise<void> => {
  try {
    // Get existing RFQ
    const existing = await getCachedRFQ(rfqId);
    if (!existing) {
      throw new Error('RFQ not found');
    }
    
    const updatedRFQ = {
      ...existing,
      ...updates,
      timestamp: Date.now(),
    };
    
    // Cache the updated RFQ
    await cacheRFQ(updatedRFQ);
    
    // Add to sync queue
    await addToSyncQueue('rfq', 'update', updatedRFQ);
    
    // Track offline RFQ update
    trackFeatureUsage('rfq_offline', 'update_rfq', {
      rfqId,
      updates: Object.keys(updates),
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to update RFQ offline:', error);
    throw error;
  }
};

/**
 * Publish RFQ offline
 */
export const publishRFQOffline = async (rfqId: string): Promise<void> => {
  try {
    await updateRFQOffline(rfqId, { status: 'published' });
    
    // Track offline RFQ publication
    trackFeatureUsage('rfq_offline', 'publish_rfq', {
      rfqId,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to publish RFQ offline:', error);
    throw error;
  }
};

/**
 * Close RFQ offline
 */
export const closeRFQOffline = async (rfqId: string): Promise<void> => {
  try {
    await updateRFQOffline(rfqId, { status: 'closed' });
    
    // Track offline RFQ closure
    trackFeatureUsage('rfq_offline', 'close_rfq', {
      rfqId,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to close RFQ offline:', error);
    throw error;
  }
};

/**
 * Create quote offline
 */
export const createQuoteOffline = async (
  rfqId: string,
  sellerId: string,
  price: number,
  currency: string,
  quantity: number,
  unit: string,
  deliveryTime: number,
  description: string,
  metadata?: any
): Promise<string> => {
  try {
    const quoteId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const quote: OfflineQuote = {
      id: quoteId,
      rfqId,
      sellerId,
      price,
      currency,
      quantity,
      unit,
      deliveryTime,
      description,
      status: 'pending',
      timestamp: Date.now(),
      synced: false,
      metadata,
    };
    
    // Cache the quote
    await cacheQuote(quote);
    
    // Add to sync queue
    await addToSyncQueue('quote', 'create', quote);
    
    // Track offline quote creation
    trackFeatureUsage('rfq_offline', 'create_quote', {
      quoteId,
      rfqId,
      sellerId,
      price,
      currency,
    });
    
    return quoteId;
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to create quote offline:', error);
    throw error;
  }
};

/**
 * Update quote status offline
 */
export const updateQuoteStatusOffline = async (
  quoteId: string,
  status: 'pending' | 'accepted' | 'rejected'
): Promise<void> => {
  try {
    // Get existing quote
    const existing = await getCachedData('quote', quoteId);
    if (!existing) {
      throw new Error('Quote not found');
    }
    
    const updatedQuote = {
      ...existing,
      status,
      timestamp: Date.now(),
    };
    
    // Cache the updated quote
    await cacheQuote(updatedQuote);
    
    // Add to sync queue
    await addToSyncQueue('quote', 'update', updatedQuote);
    
    // Track offline quote status update
    trackFeatureUsage('rfq_offline', 'update_quote_status', {
      quoteId,
      status,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to update quote status offline:', error);
    throw error;
  }
};

/**
 * Accept quote offline
 */
export const acceptQuoteOffline = async (quoteId: string): Promise<void> => {
  try {
    await updateQuoteStatusOffline(quoteId, 'accepted');
    
    // Track offline quote acceptance
    trackFeatureUsage('rfq_offline', 'accept_quote', {
      quoteId,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to accept quote offline:', error);
    throw error;
  }
};

/**
 * Reject quote offline
 */
export const rejectQuoteOffline = async (quoteId: string): Promise<void> => {
  try {
    await updateQuoteStatusOffline(quoteId, 'rejected');
    
    // Track offline quote rejection
    trackFeatureUsage('rfq_offline', 'reject_quote', {
      quoteId,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to reject quote offline:', error);
    throw error;
  }
};

/**
 * Get offline RFQ statistics
 */
export const getOfflineRFQStats = async (): Promise<{
  totalRFQs: number;
  totalQuotes: number;
  draftRFQs: number;
  publishedRFQs: number;
  closedRFQs: number;
  unsyncedRFQs: number;
  unsyncedQuotes: number;
}> => {
  try {
    const rfqs = await getAllCachedRFQs();
    const allQuotes = await getAllCachedData('quote');
    
    return {
      totalRFQs: rfqs.length,
      totalQuotes: allQuotes.length,
      draftRFQs: rfqs.filter(r => r.status === 'draft').length,
      publishedRFQs: rfqs.filter(r => r.status === 'published').length,
      closedRFQs: rfqs.filter(r => r.status === 'closed').length,
      unsyncedRFQs: rfqs.filter(r => !r.synced).length,
      unsyncedQuotes: allQuotes.filter(q => !q.synced).length,
    };
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to get offline stats:', error);
    return {
      totalRFQs: 0,
      totalQuotes: 0,
      draftRFQs: 0,
      publishedRFQs: 0,
      closedRFQs: 0,
      unsyncedRFQs: 0,
      unsyncedQuotes: 0,
    };
  }
};

/**
 * Clear all offline RFQ data
 */
export const clearOfflineRFQData = async (): Promise<void> => {
  try {
    // Clear RFQs
    const rfqs = await getAllCachedRFQs();
    for (const rfq of rfqs) {
      await cacheData('rfq', rfq.id, null);
    }
    
    // Clear quotes
    const allQuotes = await getAllCachedData('quote');
    for (const quote of allQuotes) {
      await cacheData('quote', quote.id, null);
    }
    
    // Track data clearing
    trackFeatureUsage('rfq_offline', 'clear_data', {
      rfqCount: rfqs.length,
      quoteCount: allQuotes.length,
    });
  } catch (error) {
    console.error('[RFQOfflineAPI] Failed to clear offline data:', error);
  }
};

export default {
  cacheRFQ,
  getCachedRFQ,
  getAllCachedRFQs,
  cacheQuote,
  getCachedQuotes,
  createRFQOffline,
  updateRFQOffline,
  publishRFQOffline,
  closeRFQOffline,
  createQuoteOffline,
  updateQuoteStatusOffline,
  acceptQuoteOffline,
  rejectQuoteOffline,
  getOfflineRFQStats,
  clearOfflineRFQData,
};
