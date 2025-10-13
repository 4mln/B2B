import '@/polyfills/web';
import { ChatState, Conversation, Message } from './types';
// Ensure process.env exists before loading zustand (SSR/web)
// @ts-expect-error
if (typeof globalThis.process === 'undefined') {
  // @ts-expect-error
  globalThis.process = { env: {} };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = {};
}
// Load zustand after polyfills to avoid reading undefined process.env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { create } = require('zustand');

interface ChatStore extends ChatState {
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsTyping: (typing: boolean) => void;
  setTypingUsers: (users: string[]) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  isTyping: false,
  typingUsers: [],

  setConversations: (conversations) => set({ conversations }),
  
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(message =>
      message.id === messageId ? { ...message, ...updates } : message
    )
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setIsTyping: (typing) => set({ isTyping: typing }),
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  markAsRead: (conversationId, messageIds) => set((state) => ({
    messages: state.messages.map(message =>
      messageIds.includes(message.id) ? { ...message, isRead: true } : message
    ),
    conversations: state.conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - messageIds.length) }
        : conv
    )
  })),
  
  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ),
    currentConversation: state.currentConversation?.id === conversationId
      ? { ...state.currentConversation, ...updates }
      : state.currentConversation
  })),
  
  clearMessages: () => set({ messages: [] }),
  
  clearError: () => set({ error: null }),
}));









