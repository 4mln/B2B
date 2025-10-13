import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './chatApi';
import { Message, Conversation, SendMessageRequest, CreateConversationRequest } from './types';

/**
 * Chat Hooks
 * React hooks to manage chat state and API interactions
 * Provides centralized state management for chat functionality
 */
export const useChatHooks = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const response = await chatApi.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch conversations');
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) => {
      const response = await chatApi.sendMessage(conversationId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to send message');
    },
    onSuccess: (newMessage) => {
      // Add message to local state
      setMessages(prev => [newMessage, ...prev]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === newMessage.conversationId 
            ? { ...conv, lastMessage: newMessage.text, timestamp: newMessage.timestamp }
            : conv
        )
      );
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', newMessage.conversationId] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: CreateConversationRequest) => {
      const response = await chatApi.createConversation(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create conversation');
    },
    onSuccess: (newConversation) => {
      setConversations(prev => [newConversation, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await chatApi.markAsRead(conversationId);
      if (response.success) {
        return conversationId;
      }
      throw new Error(response.error || 'Failed to mark as read');
    },
    onSuccess: (conversationId) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await chatApi.deleteMessage(messageId);
      if (response.success) {
        return messageId;
      }
      throw new Error(response.error || 'Failed to delete message');
    },
    onSuccess: (messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch messages');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (data: SendMessageRequest & { conversationId: string }) => {
    return sendMessageMutation.mutateAsync(data);
  }, [sendMessageMutation]);

  // Create conversation
  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    return createConversationMutation.mutateAsync(data);
  }, [createConversationMutation]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string, messageIds: string[] = []) => {
    return markAsReadMutation.mutateAsync(conversationId);
  }, [markAsReadMutation]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    return deleteMessageMutation.mutateAsync(messageId);
  }, [deleteMessageMutation]);

  // Refresh conversations
  const refreshConversations = useCallback(() => {
    refetchConversations();
  }, [refetchConversations]);

  // Refresh messages
  const refreshMessages = useCallback((conversationId: string) => {
    fetchMessages(conversationId);
  }, [fetchMessages]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(conversationsLoading || sendMessageMutation.isPending || createConversationMutation.isPending);
  }, [conversationsLoading, sendMessageMutation.isPending, createConversationMutation.isPending]);

  // Update error state
  useEffect(() => {
    if (conversationsError) {
      setError(conversationsError.message);
    }
  }, [conversationsError]);

  return {
    // State
    conversations,
    messages,
    loading,
    error,
    
    // Actions
    sendMessage,
    createConversation,
    markAsRead,
    deleteMessage,
    refreshConversations,
    refreshMessages,
    clearError,
    fetchMessages,
    
    // Mutation states
    isSending: sendMessageMutation.isPending,
    isCreating: createConversationMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
};

/**
 * Hook for managing a specific conversation
 */
export const useConversation = (conversationId: string) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: conversationData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['chat', 'conversation', conversationId],
    queryFn: async () => {
      const response = await chatApi.getConversation(conversationId);
      if (response.success && response.data) {
        setConversation(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch conversation');
    },
    enabled: !!conversationId,
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
    conversation,
    loading,
    error,
  };
};

/**
 * Hook for managing messages in a conversation
 */
export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: messagesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      const response = await chatApi.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch messages');
    },
    enabled: !!conversationId,
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
    messages,
    loading,
    error,
    refresh,
  };
};

export default useChatHooks;
