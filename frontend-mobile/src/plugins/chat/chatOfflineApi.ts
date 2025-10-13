import { cacheData, getCachedData, getAllCachedData, addToSyncQueue } from '@/services/offlineService';
import { trackFeatureUsage } from '@/services/analytics';

/**
 * Offline-aware Chat API
 * Provides offline capabilities for chat functionality
 */

export interface OfflineMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp: number;
  synced: boolean;
  type: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface OfflineConversation {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: OfflineMessage;
  timestamp: number;
  synced: boolean;
}

/**
 * Cache conversation data
 */
export const cacheConversation = async (conversation: OfflineConversation): Promise<void> => {
  try {
    await cacheData('conversation', conversation.id, conversation);
    
    // Track caching
    trackFeatureUsage('chat_offline', 'cache_conversation', {
      conversationId: conversation.id,
      participantCount: conversation.participants.length,
    });
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to cache conversation:', error);
  }
};

/**
 * Get cached conversation
 */
export const getCachedConversation = async (conversationId: string): Promise<OfflineConversation | null> => {
  try {
    return await getCachedData('conversation', conversationId);
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to get cached conversation:', error);
    return null;
  }
};

/**
 * Get all cached conversations
 */
export const getAllCachedConversations = async (): Promise<OfflineConversation[]> => {
  try {
    return await getAllCachedData('conversation');
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to get all cached conversations:', error);
    return [];
  }
};

/**
 * Cache message data
 */
export const cacheMessage = async (message: OfflineMessage): Promise<void> => {
  try {
    await cacheData('message', message.id, message);
    
    // Track caching
    trackFeatureUsage('chat_offline', 'cache_message', {
      messageId: message.id,
      conversationId: message.conversationId,
      type: message.type,
    });
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to cache message:', error);
  }
};

/**
 * Get cached messages for conversation
 */
export const getCachedMessages = async (conversationId: string): Promise<OfflineMessage[]> => {
  try {
    const allMessages = await getAllCachedData('message');
    return allMessages.filter(message => message.conversationId === conversationId);
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to get cached messages:', error);
    return [];
  }
};

/**
 * Send message offline
 */
export const sendMessageOffline = async (
  content: string,
  conversationId: string,
  senderId: string,
  type: 'text' | 'image' | 'file' = 'text',
  metadata?: any
): Promise<string> => {
  try {
    const messageId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: OfflineMessage = {
      id: messageId,
      content,
      senderId,
      conversationId,
      timestamp: Date.now(),
      synced: false,
      type,
      metadata,
    };
    
    // Cache the message
    await cacheMessage(message);
    
    // Add to sync queue
    await addToSyncQueue('message', 'create', message);
    
    // Track offline message
    trackFeatureUsage('chat_offline', 'send_message', {
      messageId,
      conversationId,
      type,
    });
    
    return messageId;
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to send message offline:', error);
    throw error;
  }
};

/**
 * Create conversation offline
 */
export const createConversationOffline = async (
  name: string,
  participants: string[],
  creatorId: string
): Promise<string> => {
  try {
    const conversationId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: OfflineConversation = {
      id: conversationId,
      name,
      participants,
      timestamp: Date.now(),
      synced: false,
    };
    
    // Cache the conversation
    await cacheConversation(conversation);
    
    // Add to sync queue
    await addToSyncQueue('conversation', 'create', conversation);
    
    // Track offline conversation
    trackFeatureUsage('chat_offline', 'create_conversation', {
      conversationId,
      participantCount: participants.length,
    });
    
    return conversationId;
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to create conversation offline:', error);
    throw error;
  }
};

/**
 * Update conversation offline
 */
export const updateConversationOffline = async (
  conversationId: string,
  updates: Partial<OfflineConversation>
): Promise<void> => {
  try {
    // Get existing conversation
    const existing = await getCachedConversation(conversationId);
    if (!existing) {
      throw new Error('Conversation not found');
    }
    
    const updatedConversation = {
      ...existing,
      ...updates,
      timestamp: Date.now(),
    };
    
    // Cache the updated conversation
    await cacheConversation(updatedConversation);
    
    // Add to sync queue
    await addToSyncQueue('conversation', 'update', updatedConversation);
    
    // Track offline update
    trackFeatureUsage('chat_offline', 'update_conversation', {
      conversationId,
      updates: Object.keys(updates),
    });
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to update conversation offline:', error);
    throw error;
  }
};

/**
 * Delete conversation offline
 */
export const deleteConversationOffline = async (conversationId: string): Promise<void> => {
  try {
    // Add to sync queue
    await addToSyncQueue('conversation', 'delete', { id: conversationId });
    
    // Track offline deletion
    trackFeatureUsage('chat_offline', 'delete_conversation', {
      conversationId,
    });
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to delete conversation offline:', error);
    throw error;
  }
};

/**
 * Get offline chat statistics
 */
export const getOfflineChatStats = async (): Promise<{
  totalConversations: number;
  totalMessages: number;
  unsyncedConversations: number;
  unsyncedMessages: number;
}> => {
  try {
    const conversations = await getAllCachedConversations();
    const allMessages = await getAllCachedData('message');
    
    return {
      totalConversations: conversations.length,
      totalMessages: allMessages.length,
      unsyncedConversations: conversations.filter(c => !c.synced).length,
      unsyncedMessages: allMessages.filter(m => !m.synced).length,
    };
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to get offline stats:', error);
    return {
      totalConversations: 0,
      totalMessages: 0,
      unsyncedConversations: 0,
      unsyncedMessages: 0,
    };
  }
};

/**
 * Clear all offline chat data
 */
export const clearOfflineChatData = async (): Promise<void> => {
  try {
    // Clear conversations
    const conversations = await getAllCachedConversations();
    for (const conversation of conversations) {
      await cacheData('conversation', conversation.id, null);
    }
    
    // Clear messages
    const allMessages = await getAllCachedData('message');
    for (const message of allMessages) {
      await cacheData('message', message.id, null);
    }
    
    // Track data clearing
    trackFeatureUsage('chat_offline', 'clear_data', {
      conversationCount: conversations.length,
      messageCount: allMessages.length,
    });
  } catch (error) {
    console.error('[ChatOfflineAPI] Failed to clear offline data:', error);
  }
};

export default {
  cacheConversation,
  getCachedConversation,
  getAllCachedConversations,
  cacheMessage,
  getCachedMessages,
  sendMessageOffline,
  createConversationOffline,
  updateConversationOffline,
  deleteConversationOffline,
  getOfflineChatStats,
  clearOfflineChatData,
};
