import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChatHooks } from '../chatHooks';
import { chatApi } from '../chatApi';
import { mockConversation, mockMessage } from '../../../test/utils/testUtils';

// Mock the chat API
jest.mock('../chatApi', () => ({
  chatApi: {
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    createConversation: jest.fn(),
    markAsRead: jest.fn(),
    deleteMessage: jest.fn(),
    uploadAttachment: jest.fn(),
  },
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe('useChatHooks', () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch conversations on mount', async () => {
    (chatApi.getConversations as jest.Mock).mockResolvedValue({
      data: [mockConversation],
      success: true,
    });

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.conversations).toEqual([mockConversation]);
    });

    expect(chatApi.getConversations).toHaveBeenCalled();
  });

  it('should handle send message', async () => {
    (chatApi.sendMessage as jest.Mock).mockResolvedValue({
      data: mockMessage,
      success: true,
    });

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await result.current.sendMessage('1', 'Test message');

    expect(chatApi.sendMessage).toHaveBeenCalledWith('1', 'Test message');
  });

  it('should handle create conversation', async () => {
    (chatApi.createConversation as jest.Mock).mockResolvedValue({
      data: mockConversation,
      success: true,
    });

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await result.current.createConversation({
      name: 'Test Conversation',
      participants: ['1', '2'],
    });

    expect(chatApi.createConversation).toHaveBeenCalledWith({
      name: 'Test Conversation',
      participants: ['1', '2'],
    });
  });

  it('should handle API errors', async () => {
    (chatApi.getConversations as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should refresh conversations', async () => {
    (chatApi.getConversations as jest.Mock).mockResolvedValue({
      data: [mockConversation],
      success: true,
    });

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await result.current.refreshConversations();

    expect(chatApi.getConversations).toHaveBeenCalledTimes(2);
  });

  it('should refresh messages', async () => {
    (chatApi.getMessages as jest.Mock).mockResolvedValue({
      data: [mockMessage],
      success: true,
    });

    const { result } = renderHook(() => useChatHooks(), { wrapper });

    await result.current.refreshMessages('1');

    expect(chatApi.getMessages).toHaveBeenCalledWith('1');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useChatHooks(), { wrapper });

    result.current.clearError();

    expect(result.current.error).toBeNull();
  });
});
