/**
 * Chat Plugin Types
 * TypeScript interfaces for chat functionality
 * Aligns with backend messaging plugin schemas
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyToId?: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  senderName?: string;
  senderAvatar?: string;
  readBy?: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType?: string;
  thumbnailUrl?: string;
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
  chatType: 'direct' | 'group';
  createdBy: string;
  isActive: boolean;
  lastMessageDetails?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
  };
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isAdmin?: boolean;
  joinedAt: string;
  lastReadAt?: string;
}

export interface SendMessageRequest {
  text: string;
  type?: 'text' | 'image' | 'file';
  attachments?: Attachment[];
  replyToId?: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationRequest {
  participantIds: string[];
  name?: string;
  chatType?: 'direct' | 'group';
  description?: string;
}

export interface UpdateConversationRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface ChatListResponse {
  chats: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ParticipantListResponse {
  participants: Participant[];
  total: number;
}

export interface ChatInvitation {
  id: string;
  chatRoomId: string;
  invitedBy: string;
  invitedUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
  chatRoomName: string;
  inviterName: string;
  invitedUserName: string;
}

export interface ChatInvitationCreate {
  invitedUserId: string;
}

export interface ChatInvitationUpdate {
  status: 'accepted' | 'declined';
}

export interface InvitationListResponse {
  invitations: ChatInvitation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UnreadMessagesResponse {
  totalUnread: number;
  conversations: Array<{
    conversationId: string;
    unreadCount: number;
  }>;
}

export interface ChatRoomOut {
  id: string;
  name: string;
  chatType: 'direct' | 'group';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  participantCount: number;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
}

export interface MessageOut {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  senderName: string;
  senderAvatar?: string;
  readBy: string[];
}

export interface ChatParticipantOut {
  id: string;
  chatRoomId: string;
  userId: string;
  isAdmin: boolean;
  joinedAt: string;
  leftAt?: string;
  lastReadAt?: string;
  userName: string;
  userAvatar?: string;
  userOnline: boolean;
}

export interface ChatParticipantCreate {
  userId: string;
  isAdmin?: boolean;
}

export interface ChatRoomCreate {
  name: string;
  chatType: 'direct' | 'group';
  participantIds: string[];
  description?: string;
}

export interface ChatRoomUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface MessageCreate {
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
  replyToId?: string;
}

export interface MessageUpdate {
  content: string;
}

export interface ChatRoomWithParticipants extends ChatRoomOut {
  participants: ChatParticipantOut[];
}

export interface MessageResponse extends MessageOut {}

export interface ChatParticipantResponse extends ChatParticipantOut {}

// WebSocket types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'presence';
  data: any;
  conversationId: string;
  timestamp: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

// Chat state types
export interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  typingUsers: string[];
  onlineUsers: string[];
}

export interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export default {};
