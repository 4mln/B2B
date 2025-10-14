# Wallet Service Integration

## Backend-Frontend Alignment

The wallet service has been aligned with the backend FastAPI plugin endpoints. All wallet-related API calls should use the unified wallet service (`unifiedWalletService.ts`).

### Endpoint Mapping

Frontend endpoints now exactly match backend routes (prefixed with `/api/v1`):

```
GET    /wallet/me                    Get current user's wallets
GET    /wallet/{wallet_id}          Get specific wallet
POST   /wallet/                     Create new wallet
GET    /wallet/{wallet_id}/transactions  Get wallet transactions
POST   /wallet/deposit              Deposit funds (formerly top-up)
POST   /wallet/withdraw             Withdraw funds
POST   /wallet/transfer             Transfer between wallets
GET    /wallet/user/{user_id}       Get user's wallets (admin)
```

### Key Changes

1. Renamed endpoints:
   - `/wallet/top-up` → `/wallet/deposit`
   - `/wallet/balance` → `/wallet/me` (gets all wallets)
   - `/wallet/transactions` → `/wallet/{wallet_id}/transactions`

2. Consolidated types in `src/types/wallet.ts`

3. Created unified service that matches backend exactly

### Usage Example

```typescript
import { walletService } from '@/services/unifiedWalletService';

// Get user's wallets
const { data: wallets } = await walletService.getMyWallets();

// Get specific wallet
const { data: wallet } = await walletService.getWallet(walletId);

// Get transactions
const { data: txns } = await walletService.getTransactions(walletId, {
  type: 'credit',
  status: 'completed'
});

// Deposit funds
const { data: tx } = await walletService.deposit({
  wallet_id: walletId,
  amount: 100,
  currency: 'USD'
});
```

## Migration Guide

1. Replace imports from old wallet services:
   ```typescript
   // Before
   import { walletService } from '@/services/wallet';
   // After
   import { walletService } from '@/services/unifiedWalletService';
   ```

2. Update endpoint usage:
   - Use `getMyWallets()` instead of `getBalance()`
   - Pass `walletId` to `getTransactions()`
   - Use `deposit()` instead of `topUp()`

3. Use new type definitions from `@/types/wallet`