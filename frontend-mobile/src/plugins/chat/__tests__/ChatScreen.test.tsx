import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatScreen from '../ChatScreen';
import { mockConversation, mockMessage, mockUser } from '../../../test/utils/testUtils';

// Mock the chat hooks
jest.mock('../chatHooks', () => ({
  useChatHooks: () => ({
    conversations: [mockConversation],
    messages: [mockMessage],
    loading: false,
    error: null,
    sendMessage: jest.fn(),
    createConversation: jest.fn(),
    refreshConversations: jest.fn(),
    refreshMessages: jest.fn(),
    clearError: jest.fn(),
  }),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    conversationId: '1',
  },
};

describe('ChatScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders chat screen correctly', () => {
    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText('Chat')).toBeTruthy();
  });

  it('displays conversations list', () => {
    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText(mockConversation.name)).toBeTruthy();
  });

  it('displays messages in conversation', () => {
    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText(mockMessage.content)).toBeTruthy();
  });

  it('handles send message', async () => {
    const mockSendMessage = jest.fn();
    
    jest.doMock('../chatHooks', () => ({
      useChatHooks: () => ({
        conversations: [mockConversation],
        messages: [mockMessage],
        loading: false,
        error: null,
        sendMessage: mockSendMessage,
        createConversation: jest.fn(),
        refreshConversations: jest.fn(),
        refreshMessages: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('1', 'Test message');
    });
  });

  it('handles create conversation', async () => {
    const mockCreateConversation = jest.fn();
    
    jest.doMock('../chatHooks', () => ({
      useChatHooks: () => ({
        conversations: [mockConversation],
        messages: [mockMessage],
        loading: false,
        error: null,
        sendMessage: jest.fn(),
        createConversation: mockCreateConversation,
        refreshConversations: jest.fn(),
        refreshMessages: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    const createButton = screen.getByText('New Conversation');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockCreateConversation).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    jest.doMock('../chatHooks', () => ({
      useChatHooks: () => ({
        conversations: [],
        messages: [],
        loading: true,
        error: null,
        sendMessage: jest.fn(),
        createConversation: jest.fn(),
        refreshConversations: jest.fn(),
        refreshMessages: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText('Loading conversations...')).toBeTruthy();
  });

  it('displays error state', () => {
    jest.doMock('../chatHooks', () => ({
      useChatHooks: () => ({
        conversations: [],
        messages: [],
        loading: false,
        error: 'Test error',
        sendMessage: jest.fn(),
        createConversation: jest.fn(),
        refreshConversations: jest.fn(),
        refreshMessages: jest.fn(),
        clearError: jest.fn(),
      }),
    }));

    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('handles conversation selection', () => {
    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    const conversationItem = screen.getByText(mockConversation.name);
    fireEvent.press(conversationItem);

    // Should navigate to conversation detail
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ChatDetail', {
      conversationId: mockConversation.id,
    });
  });

  it('handles back navigation', () => {
    renderWithProviders(
      <ChatScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    const backButton = screen.getByText('← Back');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
