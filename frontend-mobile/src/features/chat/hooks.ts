import '@/polyfills/web';
import { chatService } from '@/services/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from './store';
import { CreateConversationRequest, SendMessageRequest } from './types';

export const useConversations = () => {
  const { setConversations, setLoading, setError } = useChatStore();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch conversations');
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useMessages = (conversationId: string) => {
  const { setMessages, setLoading, setError } = useChatStore();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await chatService.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch messages');
    },
    enabled: !!conversationId,
    onError: (error: any) => {
      setError(error.message);
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { addMessage, setLoading, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) => {
      const response = await chatService.sendMessage(conversationId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to send message');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', message.senderId] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useChatStore();

  return useMutation({
    mutationFn: async (data: CreateConversationRequest) => {
      const response = await chatService.createConversation(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create conversation');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useMarkAsRead = () => {
  const { markAsRead, setLoading, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }) => {
      const response = await chatService.markAsRead(conversationId, messageIds);
      if (response.success) {
        return { conversationId, messageIds };
      }
      throw new Error(response.error || 'Failed to mark as read');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: ({ conversationId, messageIds }) => {
      markAsRead(conversationId, messageIds);
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
      const response = await chatService.deleteMessage(conversationId, messageId);
      if (response.success) {
        return messageId;
      }
      throw new Error(response.error || 'Failed to delete message');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (messageId) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUploadAttachment = () => {
  const { setLoading, setError } = useChatStore();

  return useMutation({
    mutationFn: async (file: FormData) => {
      const response = await chatService.uploadAttachment(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to upload attachment');
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};









