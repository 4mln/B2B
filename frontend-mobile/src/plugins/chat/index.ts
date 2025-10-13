import { PluginMetadata } from '../types';
import ChatScreen from './ChatScreen';

/**
 * Chat Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the chat plugin
 */
export const plugin: PluginMetadata = {
  name: 'chat',
  version: '1.0.0',
  route: '/chat',
  component: ChatScreen,
  permissions: ['chat:read', 'chat:write'],
  dependencies: ['auth'],
  description: 'Real-time messaging and chat functionality',
  icon: '💬',
  category: 'feature',
};

// Export all chat-related components and utilities
export { default as ChatScreen } from './ChatScreen';
export { chatApi } from './chatApi';
export { useChatHooks, useConversation, useMessages } from './chatHooks';
export { chatStyles } from './chatStyles';
export * from './types';

// Export the plugin as default
export default plugin;
