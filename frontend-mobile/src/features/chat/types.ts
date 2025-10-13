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

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  typingUsers: string[];
}










