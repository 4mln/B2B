# Services Layer

This folder contains all the API service modules for the B2B Marketplace application. Each service is responsible for handling API communication for specific features.

## Structure

```
services/
├── api.ts              # Axios instance with base configuration
├── auth.ts             # Authentication services
├── chat.ts             # Chat and messaging services
├── product.ts          # Product management services
├── rfq.ts              # Request for Quote services
├── wallet.ts           # Wallet and payment services
├── index.ts            # Centralized exports
└── README.md           # This file
```

## API Client (`api.ts`)

The central Axios instance configured with:
- Base URL from environment configuration
- Request/response interceptors for authentication
- Automatic token refresh on 401 errors
- Error handling and logging

## Service Modules

### Auth Service (`auth.ts`)
- `sendOTP()` - Send OTP to phone number
- `verifyOTP()` - Verify OTP and get tokens
- `refreshToken()` - Refresh access token
- `getProfile()` - Get user profile
- `getCurrentUser()` - Get current user info
- `updateProfile()` - Update user profile
- `logout()` - Logout user

### Chat Service (`chat.ts`)
- `getConversations()` - Get all conversations
- `getMessages()` - Get messages for a conversation
- `sendMessage()` - Send a message
- `createConversation()` - Create new conversation
- `markAsRead()` - Mark messages as read
- `deleteMessage()` - Delete a message
- `uploadAttachment()` - Upload file attachments

### Product Service (`product.ts`)
- `getProducts()` - Get products with filters
- `getProductById()` - Get specific product
- `createProduct()` - Create new product
- `updateProduct()` - Update existing product
- `deleteProduct()` - Delete product
- `searchProducts()` - Search products
- `getProductsByCategory()` - Get products by category
- `getUserProducts()` - Get user's products
- `uploadImages()` - Upload product images
- `getCategories()` - Get product categories

### RFQ Service (`rfq.ts`)
- `getRFQs()` - Get RFQs with filters
- `getRFQById()` - Get specific RFQ
- `createRFQ()` - Create new RFQ
- `updateRFQ()` - Update existing RFQ
- `deleteRFQ()` - Delete RFQ
- `searchRFQs()` - Search RFQs
- `getUserRFQs()` - Get user's RFQs
- `submitQuote()` - Submit quote for RFQ
- `getRFQQuotes()` - Get quotes for RFQ
- `acceptQuote()` - Accept a quote
- `rejectQuote()` - Reject a quote
- `getUserQuotes()` - Get user's quotes
- `uploadAttachments()` - Upload RFQ attachments

### Wallet Service (`wallet.ts`)
- `getBalance()` - Get wallet balance
- `getTransactions()` - Get transaction history
- `topUp()` - Top up wallet
- `withdraw()` - Withdraw funds
- `getTransaction()` - Get specific transaction
- `getPaymentMethods()` - Get payment methods
- `addPaymentMethod()` - Add payment method
- `removePaymentMethod()` - Remove payment method
- `getStatistics()` - Get wallet statistics

## Usage

### Import Services
```typescript
import { authService, productService, chatService } from '@/services';
```

### Using Services in Components
```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { productService } from '@/services';

// In a React component
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await productService.getProducts();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error);
  },
});

const createProductMutation = useMutation({
  mutationFn: productService.createProduct,
  onSuccess: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

### Direct Service Usage
```typescript
import { authService } from '@/services';

// Direct usage (not recommended in React components)
const handleLogin = async () => {
  const response = await authService.sendOTP({ phone: '+989123456789' });
  if (response.success) {
    console.log('OTP sent successfully');
  } else {
    console.error('Error:', response.error);
  }
};
```

## Response Format

All services return a standardized response format:

```typescript
interface ApiResponse<T> {
  data?: T;           // Response data on success
  error?: string;     // Error message on failure
  success: boolean;   // Success flag
}
```

## Error Handling

- All services include try/catch blocks
- Errors are standardized and user-friendly
- Network errors are handled gracefully
- Authentication errors trigger token refresh

## TypeScript Support

- Full TypeScript support with strict typing
- Request/response interfaces for all endpoints
- Type-safe service functions
- IntelliSense support in IDEs

## Best Practices

1. **Use React Query**: Always use React Query hooks for data fetching in components
2. **Error Handling**: Always check the `success` flag before using `data`
3. **Type Safety**: Use the provided TypeScript interfaces
4. **Consistent Naming**: Follow the established naming conventions
5. **Documentation**: Keep this README updated when adding new services

## Adding New Services

1. Create a new service file (e.g., `notifications.ts`)
2. Define TypeScript interfaces for requests/responses
3. Implement service functions with error handling
4. Export the service from `index.ts`
5. Update this README with the new service documentation










