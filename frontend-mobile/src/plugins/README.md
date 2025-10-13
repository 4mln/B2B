# Plugin System Documentation

This document describes the modular plugin-based architecture for the B2B Marketplace frontend application.

## Overview

The plugin system allows for modular, feature-based organization of the frontend codebase. Each plugin is self-contained and can be easily added, removed, or modified without affecting other parts of the application.

## Architecture

### Core Components

1. **Plugin Registry** (`registry.ts`) - Manages plugin registration and configuration
2. **Plugin Loader** (`loader.ts`) - Handles dynamic loading of plugin components
3. **Plugin Types** (`types.ts`) - TypeScript interfaces for plugin metadata
4. **Navigation System** (`../navigation/PluginNavigation.tsx`) - Dynamic route generation

### Plugin Structure

Each plugin follows a standardized structure:

```
plugins/
├── {plugin-name}/
│   ├── {PluginName}Screen.tsx    # Main component
│   ├── {pluginName}Api.ts        # API service
│   ├── {pluginName}Hooks.ts      # React hooks
│   ├── {pluginName}Styles.ts     # StyleSheet
│   ├── types.ts                  # TypeScript interfaces
│   └── index.ts                  # Plugin metadata export
```

## Plugin Development

### Creating a New Plugin

1. **Create the plugin directory structure**
2. **Implement the required files**:
   - Screen component
   - API service
   - React hooks
   - Styles
   - Types
   - Index file with plugin metadata

3. **Register the plugin** in `plugins/index.ts`

### Plugin Metadata

Each plugin must export a `PluginMetadata` object:

```typescript
export const plugin: PluginMetadata = {
  name: 'plugin-name',
  version: '1.0.0',
  route: '/plugin-route',
  component: PluginScreen,
  permissions: ['permission:read', 'permission:write'],
  dependencies: ['auth'],
  description: 'Plugin description',
  icon: '🔧',
  category: 'feature',
};
```

### API Integration

Plugins should align with backend endpoints:

- **Chat Plugin**: `/messaging/*` endpoints
- **Products Plugin**: `/products/*` endpoints
- **Auth Plugin**: `/auth/*` endpoints
- **Wallet Plugin**: `/wallet/*` endpoints

### State Management

Each plugin manages its own state using:

- **React Query** for server state
- **Zustand** for client state
- **Custom hooks** for business logic

### Styling

Plugins use consistent styling patterns:

- **StyleSheet** for component styles
- **Theme-aware** colors and typography
- **Responsive** design principles

## Available Plugins

### Chat Plugin

**Route**: `/chat`
**Permissions**: `chat:read`, `chat:write`
**Dependencies**: `auth`

Features:
- Real-time messaging
- Conversation management
- File attachments
- Message status tracking

**Backend Endpoints**:
- `GET /messaging/chats` - List conversations
- `POST /messaging/chats` - Create conversation
- `GET /messaging/chats/{id}/messages` - Get messages
- `POST /messaging/chats/{id}/messages` - Send message

### Products Plugin

**Route**: `/products`
**Permissions**: `products:read`, `products:write`
**Dependencies**: `auth`

Features:
- Product catalog
- Search and filtering
- Category management
- Product reviews

**Backend Endpoints**:
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/{id}` - Get product details
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

## Navigation System

The navigation system automatically generates routes from plugin metadata:

### Tab Navigation
Core plugins appear in the bottom tab navigator:
- Chat
- Products
- Wallet
- RFQ

### Stack Navigation
Feature plugins appear as stack screens:
- Product details
- Chat conversations
- Settings

### Modal Navigation
Integration plugins appear as modals:
- Payment forms
- File uploads
- Third-party services

## Plugin Lifecycle

### Initialization
1. **App starts** → `initializePlugins()`
2. **Register plugins** → `registerPlugins()`
3. **Load plugin system** → `initializePluginSystem()`
4. **Generate navigation** → `PluginNavigation`

### Runtime
1. **User navigates** → Route resolution
2. **Plugin loading** → `PluginLoader`
3. **Component rendering** → Plugin screen
4. **State management** → Plugin hooks

### Cleanup
1. **Plugin unload** → Cleanup resources
2. **State cleanup** → Clear plugin state
3. **Memory cleanup** → Remove references

## Best Practices

### Plugin Development
- **Single Responsibility**: Each plugin should handle one feature
- **Loose Coupling**: Minimize dependencies between plugins
- **Error Handling**: Implement proper error boundaries
- **Performance**: Use lazy loading and code splitting

### API Design
- **Consistent Patterns**: Follow established API patterns
- **Error Handling**: Implement proper error responses
- **Type Safety**: Use TypeScript interfaces
- **Documentation**: Document API endpoints

### State Management
- **Local State**: Use React hooks for component state
- **Server State**: Use React Query for API data
- **Global State**: Use Zustand for app-wide state
- **Persistence**: Use AsyncStorage for persistence

### Styling
- **Consistent Design**: Follow design system guidelines
- **Responsive**: Support different screen sizes
- **Accessibility**: Implement accessibility features
- **Performance**: Optimize for rendering performance

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check plugin registration
   - Verify plugin metadata
   - Check console for errors

2. **Navigation issues**
   - Verify route configuration
   - Check plugin permissions
   - Ensure plugin is enabled

3. **API errors**
   - Check backend endpoint alignment
   - Verify authentication
   - Check network connectivity

4. **State management issues**
   - Check hook dependencies
   - Verify state updates
   - Check for memory leaks

### Debugging

1. **Enable debug logging**
2. **Check plugin registry state**
3. **Verify navigation structure**
4. **Test plugin isolation**

## Future Enhancements

### Planned Features
- **Plugin hot reloading**
- **Dynamic plugin loading**
- **Plugin marketplace**
- **Advanced permissions**
- **Plugin analytics**

### Integration Opportunities
- **Micro-frontend architecture**
- **Plugin versioning**
- **A/B testing**
- **Feature flags**
- **Plugin dependencies**

## Contributing

### Adding New Plugins
1. Follow the plugin structure
2. Implement required interfaces
3. Add to plugin registry
4. Update documentation
5. Test thoroughly

### Modifying Existing Plugins
1. Maintain backward compatibility
2. Update version numbers
3. Test all functionality
4. Update documentation

### Plugin Removal
1. Remove from registry
2. Clean up dependencies
3. Update navigation
4. Remove unused code

## Support

For questions or issues with the plugin system:

1. Check this documentation
2. Review plugin examples
3. Check console logs
4. Contact the development team

---

*This documentation is maintained alongside the plugin system. Please update it when making changes to the architecture.*
