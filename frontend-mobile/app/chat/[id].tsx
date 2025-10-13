import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMessages, useSendMessage } from '@/features/chat/hooks';
import { useChatStore } from '@/features/chat/store';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { lineHeights, typography } from '@/theme/typography';

export default function ChatDetailScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();

  const [message, setMessage] = useState('');
  const { messages, isLoading } = useChatStore();
  const { refetch, isFetching } = useMessages(id as string);
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();

  const conversation = useMemo(() => ({
    id: id || 'unknown',
    name: 'Conversation',
    avatar: 'https://via.placeholder.com/50',
    isOnline: true,
  }), [id]);

  const flatListRef = useRef<FlatList<any>>(null);
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text || !id) return;
    await sendMessage({ conversationId: String(id), data: { text } });
    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  }, [message, id, sendMessage]);

  const handleSendImage = () => {
    Alert.alert(
      'Send Image',
      'Choose an image to send',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
      ]
    );
  };

  const handleSendFile = () => {
    Alert.alert(
      'Send File',
      'Choose a file to send',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Document', onPress: () => console.log('Send document') },
        { text: 'PDF', onPress: () => console.log('Send PDF') },
      ]
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.senderId === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.sellerMessage
      ]}>
        {!isUser && (
          <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.sellerBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.sellerMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.sellerTimestamp
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    backButton: {
      padding: semanticSpacing.sm,
      marginRight: semanticSpacing.sm,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: semanticSpacing.sm,
    },
    headerText: {
      flex: 1,
    },
    headerName: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.fontWeights.semibold,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    onlineStatus: {
      fontSize: typography.caption.fontSize,
      color: colors.success[500],
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      padding: semanticSpacing.sm,
      marginLeft: semanticSpacing.sm,
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: semanticSpacing.xs,
      alignItems: 'flex-end',
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    sellerMessage: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: semanticSpacing.sm,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      borderRadius: semanticSpacing.radius.lg,
    },
    userBubble: {
      backgroundColor: colors.primary[500],
      borderBottomRightRadius: semanticSpacing.radius.sm,
    },
    sellerBubble: {
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      borderBottomLeftRadius: semanticSpacing.radius.sm,
    },
    messageText: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.fontSize * lineHeights.normal,
    },
    userMessageText: {
      color: colors.background.light,
    },
    sellerMessageText: {
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    timestamp: {
      fontSize: typography.caption.fontSize,
      marginTop: semanticSpacing.xs,
    },
    userTimestamp: {
      color: colors.background.light,
      opacity: 0.8,
    },
    sellerTimestamp: {
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border.light : colors.border.light,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      borderRadius: semanticSpacing.radius.lg,
      paddingHorizontal: semanticSpacing.md,
      marginRight: semanticSpacing.sm,
    },
    textInput: {
      flex: 1,
      paddingVertical: semanticSpacing.sm,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
      maxHeight: 100,
    },
    attachmentButton: {
      padding: semanticSpacing.sm,
      marginRight: semanticSpacing.sm,
    },
    sendButton: {
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.sm,
    },
  });

  if (isLoading && messages.length === 0) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
        <ThemedText>{t('common.loading')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? colors.gray[400] : colors.gray[600]} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image source={{ uri: conversation.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{conversation.name}</Text>
            <Text style={styles.onlineStatus}>
              {conversation.isOnline ? t('chat.online') : t('chat.offline', 'Offline')}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons 
              name="call-outline" 
              size={24} 
              color={isDark ? colors.gray[400] : colors.gray[600]} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons 
              name="videocam-outline" 
              size={24} 
              color={isDark ? colors.gray[400] : colors.gray[600]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          style={styles.messagesContainer}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: semanticSpacing.sm }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chat.typeMessage')}
              placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.attachmentButton} onPress={handleSendImage}>
              <Ionicons 
                name="image-outline" 
                size={20} 
                color={isDark ? colors.gray[400] : colors.gray[500]} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={handleSendFile}>
              <Ionicons 
                name="attach-outline" 
                size={20} 
                color={isDark ? colors.gray[400] : colors.gray[500]} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={colors.background.light} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
