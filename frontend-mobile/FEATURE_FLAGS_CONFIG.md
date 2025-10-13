# Feature Flags & Configuration System

This document describes the dynamic configuration and feature flags system implemented in the B2B Marketplace frontend.

## Overview

The system provides:
- **Dynamic Configuration**: Enable/disable plugins and features without app updates
- **Feature Flags**: Toggle features on/off for different user segments
- **Real-time Updates**: Configuration changes take effect immediately
- **User Context**: Different configurations based on user role, platform, etc.
- **Caching**: Offline support with local storage fallback

## Architecture

### Core Services

1. **ConfigService** (`src/services/configService.ts`)
   - Manages app-wide configuration
   - Plugin enable/disable
   - Theme settings
   - API configuration
   - Analytics settings

2. **FeatureFlagsService** (`src/services/featureFlags.ts`)
   - Manages feature toggles
   - A/B testing support
   - Percentage rollouts
   - User segmentation

### React Hooks

1. **useConfig** (`src/hooks/useConfig.ts`)
   - Plugin configuration
   - App settings
   - Theme configuration
   - Real-time updates

2. **useFeatureFlag** (`src/hooks/useFeatureFlag.ts`)
   - Feature flag state
   - Metadata access
   - User availability
   - Change subscriptions

### Components

1. **FeatureFlag** (`src/components/FeatureFlag.tsx`)
   - Conditional rendering
   - Loading states
   - Error handling

2. **PluginGate** (`src/components/PluginGate.tsx`)
   - Plugin-based rendering
   - Access control
   - Fallback content

## Usage Examples

### Basic Feature Flag

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const MyComponent = () => {
  const { enabled, loading, error } = useFeatureFlag('new_feature');
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return enabled ? <NewFeature /> : <OldFeature />;
};
```

### Conditional Plugin Rendering

```tsx
import { PluginGate } from '@/components/PluginGate';

const App = () => {
  return (
    <PluginGate plugin="wallet" fallback={<ComingSoon />}>
      <WalletScreen />
    </PluginGate>
  );
};
```

### Multiple Feature Flags

```tsx
import { useAnyFeatureFlag } from '@/hooks/useFeatureFlag';

const MyComponent = () => {
  const { enabled, enabledFlags } = useAnyFeatureFlag([
    'feature_a',
    'feature_b',
    'feature_c'
  ]);
  
  return enabled ? <AdvancedUI /> : <BasicUI />;
};
```

### Plugin Configuration

```tsx
import { usePluginEnabled } from '@/hooks/useConfig';

const Navigation = () => {
  const { value: walletEnabled } = usePluginEnabled('wallet');
  
  return (
    <Tab.Navigator>
      {walletEnabled && (
        <Tab.Screen name="Wallet" component={WalletScreen} />
      )}
    </Tab.Navigator>
  );
};
```

## Configuration Structure

### App Configuration

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00Z",
  "plugins": {
    "wallet": {
      "name": "wallet",
      "enabled": true,
      "version": "1.0.0",
      "permissions": ["user"],
      "category": "core",
      "priority": 1,
      "metadata": {
        "description": "Digital wallet functionality"
      },
      "conditions": {
        "platform": ["ios", "android"],
        "userRole": ["user", "premium"],
        "percentage": 100
      }
    }
  },
  "features": {
    "analytics": true,
    "monitoring": true,
    "dark_mode": false
  },
  "settings": {
    "api_timeout": 30000,
    "retry_attempts": 3
  },
  "theme": {
    "primaryColor": "#007AFF",
    "secondaryColor": "#5856D6",
    "backgroundColor": "#FFFFFF",
    "textColor": "#000000",
    "darkMode": false
  },
  "api": {
    "baseUrl": "https://api.example.com",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "analytics": {
    "enabled": true,
    "trackingId": "GA-XXXXXXXXX",
    "events": ["page_view", "button_click", "form_submit"]
  },
  "monitoring": {
    "enabled": true,
    "dsn": "https://sentry.io/...",
    "environment": "production"
  }
}
```

### Feature Flags

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00Z",
  "flags": {
    "new_checkout": {
      "name": "new_checkout",
      "enabled": true,
      "description": "New checkout flow",
      "conditions": {
        "platform": ["ios", "android"],
        "userRole": ["user", "premium"],
        "percentage": 50
      },
      "metadata": {
        "experiment": "checkout_v2",
        "startDate": "2024-01-01"
      }
    }
  }
}
```

## Backend Integration

### API Endpoints

The system expects these backend endpoints:

```
GET /api/config - Get app configuration
GET /api/feature-flags - Get feature flags
PUT /api/config/plugins/{name} - Update plugin config
PUT /api/feature-flags/{name} - Update feature flag
PUT /api/config/settings/{key} - Update setting
PUT /api/config/theme - Update theme
```

### Example Backend Implementation

```python
# FastAPI backend example
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PluginConfig(BaseModel):
    enabled: bool
    version: str
    permissions: list[str]
    category: str
    priority: int
    metadata: dict
    conditions: dict

@app.get("/api/config")
async def get_config():
    return {
        "version": "1.0.0",
        "lastUpdated": "2024-01-01T00:00:00Z",
        "plugins": {
            "wallet": PluginConfig(
                enabled=True,
                version="1.0.0",
                permissions=["user"],
                category="core",
                priority=1,
                metadata={"description": "Digital wallet"},
                conditions={"platform": ["ios", "android"]}
            )
        },
        "features": {
            "analytics": True,
            "monitoring": True
        },
        "settings": {
            "api_timeout": 30000,
            "retry_attempts": 3
        }
    }
```

## Advanced Features

### A/B Testing

```tsx
const MyComponent = () => {
  const { enabled: variantA } = useFeatureFlag('checkout_variant_a');
  const { enabled: variantB } = useFeatureFlag('checkout_variant_b');
  
  if (variantA) return <CheckoutVariantA />;
  if (variantB) return <CheckoutVariantB />;
  return <DefaultCheckout />;
};
```

### Percentage Rollouts

```json
{
  "flags": {
    "new_feature": {
      "enabled": true,
      "conditions": {
        "percentage": 25  // 25% of users
      }
    }
  }
}
```

### User Segmentation

```json
{
  "flags": {
    "premium_feature": {
      "enabled": true,
      "conditions": {
        "userRole": ["premium", "enterprise"]
      }
    }
  }
}
```

### Platform-Specific Features

```json
{
  "flags": {
    "ios_feature": {
      "enabled": true,
      "conditions": {
        "platform": ["ios"]
      }
    }
  }
}
```

## Caching & Offline Support

- **Local Storage**: Configuration cached in AsyncStorage
- **Periodic Updates**: Automatic refresh every 5-10 minutes
- **Offline Fallback**: Uses cached config when offline
- **Manual Refresh**: User can force refresh configuration

## Error Handling

- **Graceful Degradation**: Falls back to default values
- **Error Boundaries**: Prevents crashes from config errors
- **Retry Logic**: Automatic retry on network failures
- **User Feedback**: Clear error messages and retry options

## Performance Considerations

- **Lazy Loading**: Configuration loaded on demand
- **Memoization**: Hooks use React.memo for optimization
- **Debouncing**: Prevents excessive API calls
- **Caching**: Reduces network requests

## Testing

### Unit Tests

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

test('should return feature flag state', () => {
  const { result } = renderHook(() => useFeatureFlag('test_flag'));
  expect(result.current.enabled).toBe(false);
});
```

### Integration Tests

```tsx
import { render, screen } from '@testing-library/react-native';
import { FeatureFlag } from '@/components/FeatureFlag';

test('should render content when flag is enabled', () => {
  render(
    <FeatureFlag flag="test_flag">
      <TestComponent />
    </FeatureFlag>
  );
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});
```

## Best Practices

1. **Naming**: Use descriptive flag names (e.g., `new_checkout_flow`)
2. **Documentation**: Document all flags and their purpose
3. **Cleanup**: Remove unused flags regularly
4. **Testing**: Test both enabled and disabled states
5. **Monitoring**: Track flag usage and performance impact
6. **Gradual Rollout**: Start with small percentages
7. **Fallbacks**: Always provide fallback content
8. **Error Handling**: Handle loading and error states gracefully

## Migration Guide

### From Static to Dynamic

1. **Identify Static Features**: Find hardcoded feature toggles
2. **Create Feature Flags**: Add flags for each feature
3. **Update Components**: Replace static checks with hooks
4. **Test Thoroughly**: Ensure all states work correctly
5. **Deploy Gradually**: Start with non-critical features

### Example Migration

```tsx
// Before (static)
const MyComponent = () => {
  const showNewFeature = process.env.NODE_ENV === 'production';
  return showNewFeature ? <NewFeature /> : <OldFeature />;
};

// After (dynamic)
const MyComponent = () => {
  const { enabled } = useFeatureFlag('new_feature');
  return enabled ? <NewFeature /> : <OldFeature />;
};
```

## Troubleshooting

### Common Issues

1. **Flag Not Working**: Check flag name and conditions
2. **Loading Forever**: Verify API endpoint and network
3. **Wrong Values**: Check user context and permissions
4. **Not Updating**: Verify subscription and refresh logic

### Debug Tools

```tsx
// Debug feature flags
const { enabled, flag, metadata } = useFeatureFlag('debug_flag');
console.log('Flag state:', { enabled, flag, metadata });

// Debug configuration
const { value: config } = useConfig('plugins');
console.log('Plugin config:', config);
```

## Security Considerations

- **Permission Checks**: Verify user permissions before enabling features
- **Data Validation**: Validate configuration data from backend
- **Rate Limiting**: Prevent excessive configuration requests
- **Audit Logging**: Log all configuration changes
- **Access Control**: Restrict configuration access to authorized users

## Future Enhancements

- **Real-time Updates**: WebSocket-based configuration updates
- **Advanced Segmentation**: More sophisticated user targeting
- **Analytics Integration**: Track flag performance and usage
- **Visual Editor**: UI for managing configuration
- **Version Control**: Track configuration changes over time
- **Rollback Support**: Quick rollback of problematic changes
