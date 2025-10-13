import apiClient from '@/services/api';
import { 
  Message, 
  Conversation, 
  SendMessageRequest, 
  CreateConversationRequest,
  ApiResponse 
} from './types';

/**
 * Chat API Service
 * Centralized API calls to backend /messaging endpoints
 * Aligns with backend plugin structure
 */
export const chatApi = {
  /**
   * Get all conversations for the current user
   * Backend endpoint: GET /messaging/chats
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await apiClient.get('/messaging/chats');
      return {
        data: response.data.chats || response.data,
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
   * Backend endpoint: GET /messaging/chats/{chat_room_id}/messages
   */
  async getMessages(conversationId: string, skip = 0, limit = 50): Promise<ApiResponse<Message[]>> {
    try {
      const response = await apiClient.get(`/messaging/chats/${conversationId}/messages`, {
        params: { skip, limit },
      });
      return {
        data: response.data.messages || response.data,
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
   * Backend endpoint: POST /messaging/chats/{chat_room_id}/messages
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await apiClient.post(`/messaging/chats/${conversationId}/messages`, {
        content: data.text,
        message_type: data.type || 'text',
        metadata: data.attachments ? { attachments: data.attachments } : undefined,
      });
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
   * Backend endpoint: POST /messaging/chats
   */
  async createConversation(data: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.post('/messaging/chats', {
        name: data.name,
        chat_type: data.participantIds.length > 2 ? 'group' : 'direct',
        participant_ids: data.participantIds,
      });
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
   * Get a specific conversation
   * Backend endpoint: GET /messaging/chats/{chat_room_id}
   */
  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.get(`/messaging/chats/${conversationId}`);
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

  /**
   * Update conversation details
   * Backend endpoint: PATCH /messaging/chats/{chat_room_id}
   */
  async updateConversation(
    conversationId: string,
    data: { name?: string; is_active?: boolean }
  ): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.patch(`/messaging/chats/${conversationId}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update conversation',
        success: false,
      };
    }
  },

  /**
   * Mark messages as read
   * Backend endpoint: POST /messaging/chats/{chat_room_id}/read
   */
  async markAsRead(conversationId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/messaging/chats/${conversationId}/read`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to mark as read',
        success: false,
      };
    }
  },

  /**
   * Delete a message
   * Backend endpoint: DELETE /messaging/messages/{message_id}
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/messaging/messages/${messageId}`);
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
   * Update a message
   * Backend endpoint: PUT /messaging/messages/{message_id}
   */
  async updateMessage(
    messageId: string,
    content: string
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await apiClient.put(`/messaging/messages/${messageId}`, {
        content,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update message',
        success: false,
      };
    }
  },

  /**
   * Get conversation participants
   * Backend endpoint: GET /messaging/chats/{chat_room_id}/participants
   */
  async getParticipants(conversationId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get(`/messaging/chats/${conversationId}/participants`);
      return {
        data: response.data.participants || response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch participants',
        success: false,
      };
    }
  },

  /**
   * Add participant to conversation
   * Backend endpoint: POST /messaging/chats/{chat_room_id}/participants
   */
  async addParticipant(
    conversationId: string,
    userId: string,
    isAdmin = false
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/messaging/chats/${conversationId}/participants`, {
        user_id: userId,
        is_admin: isAdmin,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to add participant',
        success: false,
      };
    }
  },

  /**
   * Remove participant from conversation
   * Backend endpoint: DELETE /messaging/chats/{chat_room_id}/participants/{user_id}
   */
  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/messaging/chats/${conversationId}/participants/${userId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to remove participant',
        success: false,
      };
    }
  },

  /**
   * Upload file attachment
   * Backend endpoint: POST /messaging/attachments (if available)
   */
  async uploadAttachment(file: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/messaging/attachments', file, {
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
   * Get unread message count
   * Backend endpoint: GET /messaging/unread
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const response = await apiClient.get('/messaging/unread');
      return {
        data: response.data.total_unread || 0,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch unread count',
        success: false,
      };
    }
  },
};

export default chatApi;
