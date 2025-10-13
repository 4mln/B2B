# Frontend Migration Guide - Updated for Unified User Model & Stores Plugin

## 🎯 **Overview**

This guide provides comprehensive instructions for updating the frontend to work with the new unified user model and the integrated stores plugin system. The backend has been migrated from separate Seller/Buyer models to a unified User model with capability-based access control.

## 📋 **Major Changes Summary**

### 1. **User Model Unification**
- **Before**: Separate `Seller` and `Buyer` models
- **After**: Single `User` model with capabilities
- **Impact**: All user-related API calls need updating

### 2. **New Stores Plugin Integration**
- **New Feature**: Visual stores for users with "seller" capability
- **Integration**: Works with existing products system
- **Impact**: New store management and product association features

### 3. **Capability-Based Access Control**
- **Before**: Role-based (seller/buyer)
- **After**: Capability-based (can_manage_store, can_purchase, etc.)
- **Impact**: Authentication and authorization logic changes

## 🔄 **API Changes**

### User Authentication & Management

#### **Before (Legacy)**
```javascript
// Separate seller/buyer endpoints
POST /sellers/register
POST /buyers/register
GET /sellers/profile
GET /buyers/profile
```

#### **After (Unified)**
```javascript
// Unified user endpoints
POST /users/register
GET /users/profile
GET /users/capabilities
PATCH /users/capabilities
```

#### **Updated User Object Structure**
```javascript
// New unified user object
{
  "id": "USR-12345678-1234-1234-1234-123456789012",
  "unique_id": "USR-12345678-1234-1234-1234-123456789012",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John",
  "last_name": "Doe",
  "is_active": true,
  "capabilities": [
    "can_manage_store",
    "can_purchase",
    "can_sell"
  ],
  "business_name": "John's Business",
  "business_description": "Quality products",
  "rating": 4.5,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Store Management (New Feature)

#### **Store Endpoints**
```javascript
// Store management
GET /stores/                          // List all stores
GET /stores/{store_id}                // Get store details
POST /stores/create                   // Create store (seller only)
PUT /stores/{store_id}/update         // Update store
PATCH /stores/{store_id}/activate     // Activate/deactivate store
GET /stores/{store_id}/stats          // Get store statistics

// Store products (integrated with existing products)
GET /stores/{store_id}/products       // List products in store
GET /stores/{store_id}/products/{product_id}  // Get product in store
POST /stores/{store_id}/products/{product_id}/add    // Add product to store
DELETE /stores/{store_id}/products/{product_id}/remove  // Remove product from store

// Store product images
GET /stores/{store_id}/products/{product_id}/images
POST /stores/{store_id}/products/{product_id}/images
PATCH /stores/{store_id}/products/{product_id}/images/{image_id}/primary
DELETE /stores/{store_id}/products/{product_id}/images/{image_id}
```

#### **Store Object Structure**
```javascript
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "USR-12345678-1234-1234-1234-123456789012",
  "name": "My Awesome Store",
  "address": "123 Business Street, City, Country",
  "banner": "/uploads/stores/banner.jpg",
  "subscription_type": "free", // "free", "silver", "gold"
  "is_active": true,
  "rating": 4.5,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "products": [] // Array of products in store
}
```

### Product Integration Changes

#### **Updated Product Endpoints**
```javascript
// Products now support store association
GET /products/                        // List all products
GET /products/{product_id}            // Get product details
POST /products/                       // Create product (seller only)
PUT /products/{product_id}            // Update product
DELETE /products/{product_id}         // Delete product

// New store-product association
GET /products?store_id={store_id}     // Filter products by store
```

#### **Updated Product Object Structure**
```javascript
{
  "id": 123,
  "seller_id": 456, // Legacy seller ID
  "store_id": "550e8400-e29b-41d4-a716-446655440000", // New store association
  "name": "Amazing Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "status": "approved",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## 🛠️ **Frontend Implementation Guide**

### 1. **Update Authentication System**

#### **User Registration**
```javascript
// Before
const registerSeller = async (sellerData) => {
  const response = await fetch('/sellers/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sellerData)
  });
  return response.json();
};

// After
const registerUser = async (userData) => {
  const response = await fetch('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userData,
      capabilities: ['can_purchase'] // Default capability
    })
  });
  return response.json();
};
```

#### **User Login & Profile**
```javascript
// Updated user profile fetching
const getUserProfile = async () => {
  const response = await fetch('/users/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Check user capabilities
const hasCapability = (user, capability) => {
  return user.capabilities && user.capabilities.includes(capability);
};

// Usage examples
const canManageStore = hasCapability(user, 'can_manage_store');
const canPurchase = hasCapability(user, 'can_purchase');
const canSell = hasCapability(user, 'can_sell');
```

### 2. **Implement Store Management**

#### **Store Creation**
```javascript
const createStore = async (storeData) => {
  // Check if user has seller capability
  if (!hasCapability(user, 'can_manage_store')) {
    throw new Error('User does not have permission to create stores');
  }

  const response = await fetch('/stores/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(storeData)
  });
  return response.json();
};
```

#### **Store Management Interface**
```javascript
// Store dashboard component
const StoreDashboard = () => {
  const [stores, setStores] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      const response = await fetch('/stores/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStores(data.stores);
    };

    fetchStores();
  }, []);

  const canManageStores = hasCapability(user, 'can_manage_store');

  return (
    <div>
      {canManageStores && (
        <button onClick={createStore}>
          Create New Store
        </button>
      )}
      
      {stores.map(store => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
```

### 3. **Update Product Management**

#### **Product-Store Association**
```javascript
// Add product to store
const addProductToStore = async (productId, storeId) => {
  const response = await fetch(`/stores/${storeId}/products/${productId}/add`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Remove product from store
const removeProductFromStore = async (productId, storeId) => {
  const response = await fetch(`/stores/${storeId}/products/${productId}/remove`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// List products in store
const getStoreProducts = async (storeId, page = 1, pageSize = 10) => {
  const response = await fetch(`/stores/${storeId}/products?page=${page}&page_size=${pageSize}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

#### **Product Management Interface**
```javascript
// Product management with store association
const ProductManagement = ({ product, stores }) => {
  const [selectedStore, setSelectedStore] = useState(null);

  const handleAddToStore = async () => {
    if (selectedStore) {
      await addProductToStore(product.id, selectedStore.id);
      // Refresh product data
    }
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <p>Price: ${product.price}</p>
      
      {product.store_id && (
        <p>Currently in store: {product.store_id}</p>
      )}
      
      <select onChange={(e) => setSelectedStore(JSON.parse(e.target.value))}>
        <option value="">Select Store</option>
        {stores.map(store => (
          <option key={store.id} value={JSON.stringify(store)}>
            {store.name}
          </option>
        ))}
      </select>
      
      <button onClick={handleAddToStore}>
        Add to Store
      </button>
    </div>
  );
};
```

### 4. **Update Navigation & UI**

#### **Navigation Updates**
```javascript
// Updated navigation based on user capabilities
const Navigation = ({ user }) => {
  const canManageStore = hasCapability(user, 'can_manage_store');
  const canPurchase = hasCapability(user, 'can_purchase');
  const canSell = hasCapability(user, 'can_sell');

  return (
    <nav>
      <Link to="/">Home</Link>
      
      {canPurchase && (
        <Link to="/products">Browse Products</Link>
      )}
      
      {canSell && (
        <Link to="/my-products">My Products</Link>
      )}
      
      {canManageStore && (
        <>
          <Link to="/my-stores">My Stores</Link>
          <Link to="/create-store">Create Store</Link>
        </>
      )}
      
      <Link to="/profile">Profile</Link>
    </nav>
  );
};
```

#### **User Profile Updates**
```javascript
// Updated user profile component
const UserProfile = ({ user }) => {
  const [capabilities, setCapabilities] = useState(user.capabilities || []);

  const updateCapabilities = async (newCapabilities) => {
    const response = await fetch('/users/capabilities', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ capabilities: newCapabilities })
    });
    
    if (response.ok) {
      setCapabilities(newCapabilities);
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.name} {user.last_name}</p>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>
      
      <h3>Capabilities</h3>
      <ul>
        {capabilities.map(capability => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
      
      {user.business_name && (
        <div>
          <h3>Business Information</h3>
          <p>Business Name: {user.business_name}</p>
          <p>Description: {user.business_description}</p>
        </div>
      )}
    </div>
  );
};
```

### 5. **Error Handling Updates**

#### **Updated Error Handling**
```javascript
// Handle new error responses
const handleApiError = (error) => {
  if (error.status === 403) {
    // Capability-based permission denied
    return 'You do not have permission to perform this action';
  } else if (error.status === 404) {
    return 'Resource not found';
  } else if (error.status === 400) {
    return error.message || 'Invalid request';
  }
  return 'An error occurred';
};

// Usage in API calls
const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(handleApiError(error));
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## 🧪 **Testing Updates**

### 1. **Unit Test Updates**
```javascript
// Updated user tests
describe('User Management', () => {
  test('should register user with capabilities', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test',
      capabilities: ['can_purchase']
    };
    
    const result = await registerUser(userData);
    expect(result.capabilities).toContain('can_purchase');
  });

  test('should check user capabilities', () => {
    const user = { capabilities: ['can_manage_store'] };
    expect(hasCapability(user, 'can_manage_store')).toBe(true);
    expect(hasCapability(user, 'can_purchase')).toBe(false);
  });
});
```

### 2. **Integration Test Updates**
```javascript
// Store management tests
describe('Store Management', () => {
  test('should create store for user with capability', async () => {
    const user = { capabilities: ['can_manage_store'] };
    const storeData = {
      name: 'Test Store',
      address: '123 Test St',
      banner: '/uploads/banner.jpg'
    };
    
    const result = await createStore(storeData);
    expect(result.name).toBe('Test Store');
  });

  test('should prevent store creation without capability', async () => {
    const user = { capabilities: ['can_purchase'] };
    
    await expect(createStore(storeData)).rejects.toThrow(
      'User does not have permission to create stores'
    );
  });
});
```

## 📱 **Mobile App Updates**

### 1. **React Native Updates**
```javascript
// Updated user context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const userData = await response.json();
    setUser(userData);
    return userData;
  };

  const hasCapability = (capability) => {
    return user?.capabilities?.includes(capability);
  };

  return (
    <UserContext.Provider value={{ user, login, hasCapability }}>
      {children}
    </UserContext.Provider>
  );
};
```

### 2. **Flutter Updates**
```dart
// Updated user model
class User {
  final String id;
  final String uniqueId;
  final String email;
  final String name;
  final String lastName;
  final List<String> capabilities;
  final String? businessName;
  final double rating;

  User({
    required this.id,
    required this.uniqueId,
    required this.email,
    required this.name,
    required this.lastName,
    required this.capabilities,
    this.businessName,
    required this.rating,
  });

  bool hasCapability(String capability) {
    return capabilities.contains(capability);
  }
}
```

## 🚀 **Migration Checklist**

### Phase 1: Core Updates
- [ ] Update authentication system to use unified user model
- [ ] Implement capability-based access control
- [ ] Update user profile management
- [ ] Update navigation based on capabilities

### Phase 2: Store Integration
- [ ] Implement store management interface
- [ ] Add store creation and management
- [ ] Implement product-store association
- [ ] Add store product management

### Phase 3: Product Updates
- [ ] Update product management for store association
- [ ] Implement store-specific product views
- [ ] Add product image management for stores
- [ ] Update product filtering and search

### Phase 4: Testing & Optimization
- [ ] Update unit tests for new models
- [ ] Update integration tests
- [ ] Test capability-based access control
- [ ] Test store management functionality
- [ ] Performance optimization

## 🔧 **Configuration Updates**

### 1. **Environment Variables**
```bash
# Updated API endpoints
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_STORES_ENABLED=true
REACT_APP_CAPABILITY_BASED_AUTH=true
```

### 2. **API Client Configuration**
```javascript
// Updated API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add capability checking interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📊 **Performance Considerations**

### 1. **Caching Strategy**
```javascript
// Cache user capabilities
const useUserCapabilities = () => {
  const [capabilities, setCapabilities] = useState([]);
  
  useEffect(() => {
    const cached = localStorage.getItem('user_capabilities');
    if (cached) {
      setCapabilities(JSON.parse(cached));
    }
  }, []);

  return capabilities;
};
```

### 2. **Lazy Loading**
```javascript
// Lazy load store management components
const StoreManagement = lazy(() => import('./components/StoreManagement'));
const ProductManagement = lazy(() => import('./components/ProductManagement'));

// Conditional rendering based on capabilities
{hasCapability(user, 'can_manage_store') && (
  <Suspense fallback={<div>Loading...</div>}>
    <StoreManagement />
  </Suspense>
)}
```

## 🎯 **Success Metrics**

### 1. **User Experience**
- [ ] Seamless user registration and login
- [ ] Intuitive store management interface
- [ ] Smooth product-store association
- [ ] Responsive design across devices

### 2. **Performance**
- [ ] Fast page load times
- [ ] Efficient API calls
- [ ] Smooth navigation
- [ ] Minimal memory usage

### 3. **Functionality**
- [ ] All store management features working
- [ ] Product association working correctly
- [ ] Image upload and management working
- [ ] Capability-based access control working

## 🆘 **Troubleshooting**

### Common Issues

1. **Capability Check Failures**
   - Ensure user object has capabilities array
   - Check capability names match backend exactly
   - Verify user is logged in

2. **Store Creation Failures**
   - Check user has 'can_manage_store' capability
   - Verify store data format matches schema
   - Check banner image upload

3. **Product Association Issues**
   - Verify product ID is integer (not UUID)
   - Check store ID is valid UUID
   - Ensure user owns the store

### Debug Tools
```javascript
// Debug user capabilities
const debugUser = (user) => {
  console.log('User:', user);
  console.log('Capabilities:', user.capabilities);
  console.log('Can manage store:', hasCapability(user, 'can_manage_store'));
};
```

## 📚 **Additional Resources**

- [Backend API Documentation](./API_DOCUMENTATION.md)
- [Database Schema Changes](./DATABASE_SCHEMA_CHANGES.md)
- [Migration Complete Summary](./MIGRATION_COMPLETE_SUMMARY.md)
- [Stores Plugin Documentation](./plugins/stores/README.md)

---

**This guide provides comprehensive instructions for updating your frontend to work with the new unified user model and stores plugin integration. Follow the phases systematically to ensure a smooth migration.**
