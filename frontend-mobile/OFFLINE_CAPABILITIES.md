# Offline Capabilities & Sync System

This document describes the offline capabilities and data synchronization system implemented in the B2B Marketplace frontend.

## Overview

The offline system provides:
- **Offline Data Storage**: Cache critical data locally for offline access
- **Sync Queue**: Queue operations for when connectivity returns
- **Conflict Resolution**: Handle data conflicts when syncing
- **Real-time Status**: Show sync status to users
- **Automatic Sync**: Sync data when connectivity returns
- **Manual Sync**: Allow users to force sync

## Architecture

### Core Services

1. **OfflineService** (`src/services/offlineService.ts`)
   - Manages offline data storage
   - Handles sync queue
   - Provides conflict resolution
   - Monitors network status

2. **Plugin-specific Offline APIs**
   - `chatOfflineApi.ts` - Chat offline capabilities
   - `walletOfflineApi.ts` - Wallet offline capabilities
   - `rfqOfflineApi.ts` - RFQ offline capabilities

### React Hooks

1. **useOffline** (`src/hooks/useOffline.ts`)
   - Offline status monitoring
   - Sync operations
   - Data caching
   - Queue management

### Components

1. **OfflineStatus** (`src/components/OfflineStatus.tsx`)
   - Shows sync status
   - Manual sync controls
   - Offline indicators

## Usage Examples

### Basic Offline Status

```tsx
import { useOffline } from '@/hooks/useOffline';

const MyComponent = () => {
  const { isOnline, isSyncing, pendingItems, sync } = useOffline();
  
  return (
    <View>
      {!isOnline && <Text>You're offline</Text>}
      {pendingItems > 0 && (
        <TouchableOpacity onPress={sync}>
          <Text>Sync {pendingItems} items</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Offline Data Caching

```tsx
import { useOfflineCache } from '@/hooks/useOffline';

const MyComponent = () => {
  const { data, loading, save } = useOfflineCache('conversation', 'conv_123');
  
  const handleSave = async (newData) => {
    await save(newData);
  };
  
  return (
    <View>
      {loading ? <Loading /> : <DataView data={data} />}
      <Button onPress={() => handleSave(updatedData)} title="Save" />
    </View>
  );
};
```

### Offline Operations

```tsx
import { useSyncQueue } from '@/hooks/useOffline';

const MyComponent = () => {
  const { add, remove, items } = useSyncQueue();
  
  const handleCreate = async (data) => {
    try {
      const queueId = await add('message', 'create', data);
      console.log('Queued for sync:', queueId);
    } catch (error) {
      console.error('Failed to queue:', error);
    }
  };
  
  return (
    <View>
      {items.map(item => (
        <View key={item.id}>
          <Text>{item.type} - {item.action}</Text>
          <Button onPress={() => remove(item.id)} title="Remove" />
        </View>
      ))}
    </View>
  );
};
```

## Data Storage

### Storage Structure

```
AsyncStorage:
├── offline_conversation_{id}     # Cached conversations
├── offline_message_{id}          # Cached messages
├── offline_wallet_{id}           # Cached wallets
├── offline_transaction_{id}      # Cached transactions
├── offline_rfq_{id}              # Cached RFQs
├── offline_quote_{id}            # Cached quotes
└── offline_sync_queue           # Sync queue
```

### Data Models

#### OfflineData
```typescript
interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
  conflicts?: any[];
}
```

#### SyncQueue
```typescript
interface SyncQueue {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}
```

## Plugin-specific Offline APIs

### Chat Offline API

```typescript
// Cache conversation
await cacheConversation(conversation);

// Get cached conversation
const conversation = await getCachedConversation(conversationId);

// Send message offline
const messageId = await sendMessageOffline(
  content,
  conversationId,
  senderId
);

// Create conversation offline
const conversationId = await createConversationOffline(
  name,
  participants,
  creatorId
);
```

### Wallet Offline API

```typescript
// Cache wallet
await cacheWallet(wallet);

// Get cached wallet
const wallet = await getCachedWallet(walletId);

// Process deposit offline
const transactionId = await processDepositOffline(
  walletId,
  amount,
  currency
);

// Process withdrawal offline
const transactionId = await processWithdrawalOffline(
  walletId,
  amount,
  currency
);

// Process transfer offline
const { fromTransactionId, toTransactionId } = await processTransferOffline(
  fromWalletId,
  toWalletId,
  amount,
  currency
);
```

### RFQ Offline API

```typescript
// Cache RFQ
await cacheRFQ(rfq);

// Get cached RFQ
const rfq = await getCachedRFQ(rfqId);

// Create RFQ offline
const rfqId = await createRFQOffline(
  title,
  description,
  category,
  quantity,
  unit,
  budget,
  currency,
  deadline,
  buyerId
);

// Create quote offline
const quoteId = await createQuoteOffline(
  rfqId,
  sellerId,
  price,
  currency,
  quantity,
  unit,
  deliveryTime,
  description
);
```

## Sync Process

### Automatic Sync

1. **Network Detection**: Monitor network status
2. **Queue Processing**: Process sync queue when online
3. **Retry Logic**: Retry failed operations with exponential backoff
4. **Conflict Resolution**: Handle data conflicts

### Manual Sync

1. **User Triggered**: User can force sync
2. **Status Display**: Show sync progress
3. **Error Handling**: Display sync errors
4. **Success Feedback**: Confirm successful sync

### Sync Queue Management

```typescript
// Add to sync queue
const queueId = await addToSyncQueue(
  'message',
  'create',
  messageData,
  3 // max retries
);

// Remove from sync queue
await removeFromSyncQueue(queueId);

// Process sync queue
await sync();
```

## Conflict Resolution

### Strategies

1. **Server Wins**: Use server data when conflicts occur
2. **Client Wins**: Use client data when conflicts occur
3. **Merge**: Combine client and server data
4. **Manual**: Let user choose resolution

### Implementation

```typescript
interface ConflictResolution {
  strategy: 'server' | 'client' | 'merge' | 'manual';
  resolution?: any;
}

// Handle conflict
const resolveConflict = (clientData: any, serverData: any, strategy: string) => {
  switch (strategy) {
    case 'server':
      return serverData;
    case 'client':
      return clientData;
    case 'merge':
      return { ...clientData, ...serverData };
    case 'manual':
      return promptUserForResolution(clientData, serverData);
  }
};
```

## Error Handling

### Network Errors

- **Timeout**: Retry with exponential backoff
- **Connection Lost**: Queue operations for later
- **Server Error**: Log error and retry

### Data Errors

- **Validation**: Validate data before caching
- **Corruption**: Clear corrupted data
- **Version Mismatch**: Handle version conflicts

### User Feedback

- **Loading States**: Show sync progress
- **Error Messages**: Display clear error messages
- **Success Notifications**: Confirm successful operations

## Performance Considerations

### Storage Optimization

- **Data Compression**: Compress large data before storage
- **Cleanup**: Remove old cached data
- **Size Limits**: Limit storage per data type

### Sync Optimization

- **Batch Operations**: Group related operations
- **Priority Queue**: Prioritize critical operations
- **Rate Limiting**: Limit sync frequency

### Memory Management

- **Lazy Loading**: Load data on demand
- **Cache Limits**: Limit memory usage
- **Cleanup**: Clear unused data

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useOffline } from '@/hooks/useOffline';

test('should return offline status', () => {
  const { result } = renderHook(() => useOffline());
  expect(result.current.isOnline).toBe(true);
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react-native';
import { OfflineStatus } from '@/components/OfflineStatus';

test('should show offline status', () => {
  render(<OfflineStatus showDetails={true} />);
  expect(screen.getByText('Offline')).toBeInTheDocument();
});
```

### E2E Tests

```typescript
// Test offline functionality
describe('Offline Capabilities', () => {
  it('should cache data when offline', async () => {
    // Simulate offline
    await device.setNetworkState('offline');
    
    // Perform operation
    await element(by.id('send-message')).tap();
    
    // Verify data is cached
    expect(await element(by.id('message-cached')).toBeVisible());
  });
});
```

## Best Practices

### Data Management

1. **Cache Critical Data**: Only cache essential data
2. **Regular Cleanup**: Remove old cached data
3. **Size Monitoring**: Monitor storage usage
4. **Validation**: Validate cached data

### Sync Management

1. **Batch Operations**: Group related operations
2. **Priority Order**: Sync critical data first
3. **Error Handling**: Handle sync failures gracefully
4. **User Feedback**: Show sync status clearly

### Performance

1. **Lazy Loading**: Load data on demand
2. **Compression**: Compress large data
3. **Cleanup**: Regular data cleanup
4. **Monitoring**: Monitor performance metrics

## Troubleshooting

### Common Issues

1. **Sync Failures**: Check network and retry
2. **Data Corruption**: Clear cache and resync
3. **Storage Full**: Clean up old data
4. **Performance Issues**: Optimize data structure

### Debug Tools

```typescript
// Debug offline status
const { isOnline, isSyncing, pendingItems } = useOffline();
console.log('Offline status:', { isOnline, isSyncing, pendingItems });

// Debug sync queue
const { items } = useSyncQueue();
console.log('Sync queue:', items);

// Debug cached data
const { data } = useOfflineCache('conversation', 'conv_123');
console.log('Cached data:', data);
```

## Security Considerations

### Data Protection

- **Encryption**: Encrypt sensitive cached data
- **Access Control**: Restrict access to cached data
- **Data Validation**: Validate cached data integrity
- **Secure Storage**: Use secure storage mechanisms

### Privacy

- **Data Minimization**: Cache only necessary data
- **User Consent**: Get user consent for data caching
- **Data Retention**: Implement data retention policies
- **Audit Logging**: Log data access and modifications

## Future Enhancements

### Advanced Features

- **Real-time Sync**: WebSocket-based sync
- **Conflict Resolution UI**: Visual conflict resolution
- **Sync Analytics**: Track sync performance
- **Offline Mode Toggle**: Allow users to disable offline mode
- **Data Export**: Export cached data
- **Sync Scheduling**: Schedule sync operations

### Performance Improvements

- **Incremental Sync**: Sync only changed data
- **Compression**: Better data compression
- **Caching Strategies**: Advanced caching algorithms
- **Background Sync**: Background sync processing

### User Experience

- **Sync Progress**: Detailed sync progress
- **Offline Indicators**: Clear offline status
- **Error Recovery**: Better error recovery
- **User Education**: Educate users about offline capabilities
