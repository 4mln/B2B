import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useChatHooks } from './chatHooks';
import { chatStyles } from './chatStyles';
import { Message, Conversation } from './types';

/**
 * Chat Screen Component
 * Main chat interface for messaging functionality
 * Aligns with backend /messaging endpoints
 */
interface ChatScreenProps {
  conversationId?: string;
  onBack?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  conversationId, 
  onBack 
}) => {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  const {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    createConversation,
    markAsRead,
    deleteMessage,
    refreshConversations,
    refreshMessages,
  } = useChatHooks();

  // Load conversation data when conversationId changes
  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId);
      setSelectedConversation(conversation || null);
      if (conversation) {
        refreshMessages(conversationId);
        markAsRead(conversationId, []);
      }
    }
  }, [conversationId, conversations]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessage({
        conversationId,
        text: messageText.trim(),
        type: 'text',
      });
      setMessageText('');
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('chat.sendFailed', 'Failed to send message'));
    }
  };

  // Handle creating a new conversation
  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation({
        participantIds: [], // This would be populated from user selection
        name: t('chat.newConversation', 'New Conversation'),
      });
      setSelectedConversation(newConversation);
    } catch (error) {
      Alert.alert('Error', 'Failed to create conversation');
    }
  };

  // Render individual message
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      chatStyles.messageContainer,
      item.senderId === 'current_user' ? chatStyles.currentUserMessage : chatStyles.otherUserMessage
    ]}>
      <Text style={chatStyles.messageText}>{item.text}</Text>
      <Text style={chatStyles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
      {item.attachments && item.attachments.length > 0 && (
        <View style={chatStyles.attachmentsContainer}>
          {item.attachments.map((attachment) => (
            <TouchableOpacity key={attachment.id} style={chatStyles.attachment}>
              <Text style={chatStyles.attachmentText}>{attachment.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render conversation list item
  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={chatStyles.conversationItem}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={chatStyles.conversationAvatar}>
        <Text style={chatStyles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={chatStyles.conversationContent}>
        <Text style={chatStyles.conversationName}>{item.name}</Text>
        <Text style={chatStyles.conversationLastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={chatStyles.conversationMeta}>
        <Text style={chatStyles.conversationTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        {item.unreadCount > 0 && (
          <View style={chatStyles.unreadBadge}>
            <Text style={chatStyles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !conversations.length) {
    return (
      <View style={chatStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={chatStyles.loadingText}>{t('chat.loading', 'Loading conversations...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={chatStyles.errorContainer}>
        <Text style={chatStyles.errorText}>{error || t('errors.unknownError')}</Text>
        <TouchableOpacity style={chatStyles.retryButton} onPress={refreshConversations}>
          <Text style={chatStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={chatStyles.container}>
      {/* Header */}
      <View style={chatStyles.header}>
        <TouchableOpacity onPress={onBack} style={chatStyles.backButton}>
          <Text style={chatStyles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={chatStyles.headerTitle}>
          {selectedConversation ? selectedConversation.name : t('navigation.chat')}
        </Text>
        <TouchableOpacity onPress={handleCreateConversation} style={chatStyles.newChatButton}>
          <Text style={chatStyles.newChatButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      {!selectedConversation && (
        <View style={chatStyles.conversationListContainer}>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            style={chatStyles.conversationList}
            refreshing={loading}
            onRefresh={refreshConversations}
          />
        </View>
      )}

      {/* Messages */}
      {selectedConversation && (
        <View style={chatStyles.messagesContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={chatStyles.messagesList}
            inverted
            refreshing={loading}
            onRefresh={() => refreshMessages(conversationId!)}
          />
          
          {/* Message Input */}
          <View style={chatStyles.inputContainer}>
            <TextInput
              style={chatStyles.messageInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder={t('chat.typeMessage')}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                chatStyles.sendButton,
                !messageText.trim() && chatStyles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Text style={chatStyles.sendButtonText}>{t('chat.send')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ChatScreen;
