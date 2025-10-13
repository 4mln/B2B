// Consolidated service exports without duplication
export { default as apiClient } from './api';
export { authService } from './auth';
export { chatService } from './chat';
export { productService } from './product';
export { rfqService } from './rfq';
export { walletService } from './wallet';
export { default as sellerService } from './seller';

// Re-export types explicitly from source modules
export type { AuthUser, AuthTokens } from './auth';
export type { ChatMessage, Conversation } from './chat';
export type {
  Product,
  ProductSpecification,
  Seller,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductSearchResponse,
  ApiResponse,
} from './product';
export type { RFQ, RFQCreateRequest } from './rfq';
export type { Wallet, Transaction } from './wallet';

