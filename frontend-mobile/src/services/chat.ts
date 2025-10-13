import apiClient from './api';

// Types
export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  isOnline: boolean;
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export interface SendMessageRequest {
  text: string;
  type?: 'text' | 'image' | 'file';
  attachments?: Attachment[];
}

export interface CreateConversationRequest {
  participantIds: string[];
  name?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Chat service functions
export const chatService = {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await apiClient.get('/chat/conversations');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch conversations',
        success: false,
      };
    }
  },

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResponse<Message[]>> {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch messages',
        success: false,
      };
    }
  },

  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to send message',
        success: false,
      };
    }
  },

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.post('/chat/conversations', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create conversation',
        success: false,
      };
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<ApiResponse<void>> {
    try {
      await apiClient.patch(`/chat/conversations/${conversationId}/messages/read`, {
        messageIds,
      });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to mark messages as read',
        success: false,
      };
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete message',
        success: false,
      };
    }
  },

  /**
   * Upload file attachment
   */
  async uploadAttachment(file: FormData): Promise<ApiResponse<Attachment>> {
    try {
      const response = await apiClient.post('/chat/attachments', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to upload attachment',
        success: false,
      };
    }
  },

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch conversation',
        success: false,
      };
    }
  },
};

