# Frontend Migration Guide
# User Model Migration - Frontend Updates

## Overview

This guide covers the frontend changes required to work with the new unified User model in the B2B Marketplace application. The migration maintains backward compatibility while enabling new features.

## What Changed

### 1. User Model Changes
- **Unified User Model**: Single user model replacing separate Seller/Buyer models
- **New User ID Format**: Users now have UUID-based IDs with format `USR-XXXXXXXXXXXX`
- **Capability-Based Access**: Role-based access control using capabilities instead of separate models
- **Badge System**: Users have badges (`user`, `seller`, `buyer`, `seller/buyer`) indicating their capabilities

### 2. API Endpoint Changes
- **New Endpoints**: Unified auth and user management endpoints
- **Legacy Compatibility**: All old endpoints continue to work via adapter layer
- **Enhanced Features**: New offers, analytics, gamification, and AI endpoints

### 3. Authentication Changes
- **New Auth Flow**: Updated authentication endpoints
- **User ID Format**: Authentication now returns new user ID format
- **Capability-Based**: Access control based on user capabilities

## Frontend Migration Steps

### Step 1: Update Authentication

#### Old Authentication Flow
```javascript
// OLD: Separate seller/buyer authentication
const sellerAuth = await api.post('/auth/seller/login', credentials);
const buyerAuth = await api.post('/auth/buyer/login', credentials);
```

#### New Authentication Flow
```javascript
// NEW: Unified authentication
const auth = await api.post('/auth/login', credentials);
const user = auth.data.user;

// Check user capabilities
const canSell = user.capabilities.includes('can_post_offers');
const canBuy = user.capabilities.includes('can_browse_products');
```

#### Updated Auth Components
```javascript
// AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [capabilities, setCapabilities] = useState([]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, capabilities } = response.data;
    
    setUser(user);
    setCapabilities(capabilities);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('capabilities', JSON.stringify(capabilities));
  };

  const hasCapability = (capability) => {
    return capabilities.includes(capability);
  };

  const isSeller = () => {
    return user?.badge === 'seller' || user?.badge === 'seller/buyer';
  };

  const isBuyer = () => {
    return user?.badge === 'buyer' || user?.badge === 'seller/buyer';
  };

  return (
    <AuthContext.Provider value={{
      user,
      capabilities,
      login,
      hasCapability,
      isSeller,
      isBuyer
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 2: Update User Profile Components

#### Old User Profile
```javascript
// OLD: Separate seller/buyer profiles
const SellerProfile = ({ seller }) => (
  <div>
    <h1>{seller.business_name}</h1>
    <p>{seller.business_description}</p>
    <p>Rating: {seller.rating}</p>
  </div>
);

const BuyerProfile = ({ buyer }) => (
  <div>
    <h1>{buyer.first_name} {buyer.last_name}</h1>
    <p>Email: {buyer.email}</p>
  </div>
);
```

#### New Unified User Profile
```javascript
// NEW: Unified user profile
const UserProfile = ({ user }) => (
  <div>
    <h1>{user.name} {user.last_name}</h1>
    <p>Email: {user.email}</p>
    <p>Badge: {user.badge}</p>
    <p>Rating: {user.rating}</p>
    
    {/* Show business info if seller */}
    {user.badge === 'seller' || user.badge === 'seller/buyer' ? (
      <div>
        <h2>Business Information</h2>
        <p>Business Name: {user.business_name}</p>
        <p>Business Description: {user.business_description}</p>
      </div>
    ) : null}
  </div>
);
```

### Step 3: Update API Calls

#### Old API Calls
```javascript
// OLD: Separate seller/buyer API calls
const getSellerProducts = async (sellerId) => {
  return await api.get(`/sellers/${sellerId}/products`);
};

const getBuyerOrders = async (buyerId) => {
  return await api.get(`/buyers/${buyerId}/orders`);
};
```

#### New API Calls
```javascript
// NEW: Unified API calls
const getUserProducts = async (userId) => {
  return await api.get(`/users/${userId}/products`);
};

const getUserOrders = async (userId) => {
  return await api.get(`/users/${userId}/orders`);
};

// Or use the new offers endpoint
const getOffers = async () => {
  return await api.get('/offers');
};
```

### Step 4: Update Navigation and Access Control

#### Old Navigation
```javascript
// OLD: Role-based navigation
const Navigation = () => {
  const { user } = useAuth();
  
  return (
    <nav>
      {user.role === 'seller' && (
        <Link to="/seller/dashboard">Seller Dashboard</Link>
      )}
      {user.role === 'buyer' && (
        <Link to="/buyer/dashboard">Buyer Dashboard</Link>
      )}
    </nav>
  );
};
```

#### New Capability-Based Navigation
```javascript
// NEW: Capability-based navigation
const Navigation = () => {
  const { user, hasCapability } = useAuth();
  
  return (
    <nav>
      {hasCapability('can_post_offers') && (
        <Link to="/seller/dashboard">Seller Dashboard</Link>
      )}
      {hasCapability('can_browse_products') && (
        <Link to="/buyer/dashboard">Buyer Dashboard</Link>
      )}
      {hasCapability('can_view_analytics') && (
        <Link to="/analytics">Analytics</Link>
      )}
    </nav>
  );
};
```

### Step 5: Update Forms and Components

#### Old User Registration
```javascript
// OLD: Separate registration forms
const SellerRegistration = () => (
  <form onSubmit={handleSellerRegistration}>
    <input name="business_name" placeholder="Business Name" />
    <input name="business_description" placeholder="Business Description" />
    <button type="submit">Register as Seller</button>
  </form>
);

const BuyerRegistration = () => (
  <form onSubmit={handleBuyerRegistration}>
    <input name="first_name" placeholder="First Name" />
    <input name="last_name" placeholder="Last Name" />
    <button type="submit">Register as Buyer</button>
  </form>
);
```

#### New Unified Registration
```javascript
// NEW: Unified registration with capability selection
const UserRegistration = () => {
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  
  const handleRegistration = async (formData) => {
    const registrationData = {
      ...formData,
      capabilities: selectedCapabilities
    };
    
    await api.post('/auth/signup', registrationData);
  };
  
  return (
    <form onSubmit={handleRegistration}>
      <input name="name" placeholder="First Name" required />
      <input name="last_name" placeholder="Last Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="mobile_number" placeholder="Mobile Number" required />
      
      <div>
        <h3>Select Your Capabilities:</h3>
        <label>
          <input 
            type="checkbox" 
            value="can_browse_products"
            onChange={handleCapabilityChange}
          />
          I want to browse and buy products
        </label>
        <label>
          <input 
            type="checkbox" 
            value="can_post_offers"
            onChange={handleCapabilityChange}
          />
          I want to sell products
        </label>
      </div>
      
      <button type="submit">Register</button>
    </form>
  );
};
```

### Step 6: Update State Management

#### Old State Management
```javascript
// OLD: Separate state for sellers/buyers
const useSellerState = () => {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  return { seller, products, orders, setSeller, setProducts, setOrders };
};

const useBuyerState = () => {
  const [buyer, setBuyer] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  return { buyer, cart, orders, setBuyer, setCart, setOrders };
};
```

#### New Unified State Management
```javascript
// NEW: Unified state management
const useUserState = () => {
  const [user, setUser] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  
  const canSell = capabilities.includes('can_post_offers');
  const canBuy = capabilities.includes('can_browse_products');
  
  return { 
    user, 
    capabilities, 
    offers, 
    orders, 
    cart, 
    canSell, 
    canBuy,
    setUser, 
    setCapabilities, 
    setOffers, 
    setOrders, 
    setCart 
  };
};
```

## API Endpoint Changes

### New Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/v1/auth/signup` | User registration | None |
| POST | `/api/v1/auth/login` | User login | None |
| GET | `/api/v1/users/{unique_id}` | Public user profile | Optional |
| GET | `/api/v1/users/me/profile` | Private user profile | Required |
| PATCH | `/api/v1/users/me/profile` | Update profile | Required |
| POST | `/api/v1/offers/` | Create offer | Required |
| GET | `/api/v1/offers/` | List offers | Optional |
| POST | `/api/v1/ai/summarize` | Summarize text | Required |
| GET | `/api/v1/ai/recommendations` | Get recommendations | Required |

### Legacy Endpoints (Deprecated)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/v1/legacy/sellers/{id}` | Get seller (mapped) | Deprecated |
| GET | `/api/v1/legacy/buyers/{id}` | Get buyer (mapped) | Deprecated |
| GET | `/api/v1/legacy/users/{id}` | Get user (mapped) | Deprecated |

### Updated Plugin Endpoints

| Method | Endpoint | Description | Changes |
|--------|----------|-------------|---------|
| POST | `/api/v1/analytics/events` | Track analytics event | Now uses new user IDs |
| GET | `/api/v1/analytics/events` | Get analytics events | Now uses new user IDs |
| POST | `/api/v1/gamification/points` | Award points | Now uses new user IDs |
| GET | `/api/v1/gamification/points/{user_id}` | Get user points | Now uses new user IDs |
| POST | `/api/v1/gamification/badges` | Assign badge | Now uses new user IDs |
| GET | `/api/v1/gamification/badges/{user_id}` | Get user badges | Now uses new user IDs |

## User Capabilities

### Available Capabilities

#### Seller Capabilities
- `can_post_offers`: Create and manage product offers
- `can_view_analytics`: View seller analytics dashboard
- `can_manage_inventory`: Manage product inventory
- `can_process_orders`: Process and fulfill orders
- `can_manage_store`: Manage store settings and policies

#### Buyer Capabilities
- `can_browse_products`: Browse and search products
- `can_create_orders`: Create and place orders
- `can_view_order_history`: View order history
- `can_leave_reviews`: Leave product reviews and ratings
- `can_save_products`: Save products to wishlist

#### Shared Capabilities
- `can_send_messages`: Send messages to other users
- `can_view_profiles`: View other user profiles
- `can_participate_forums`: Participate in community forums
- `can_access_support`: Access customer support

### Badge to Capability Mapping

- **seller**: All seller + shared capabilities
- **buyer**: All buyer + shared capabilities  
- **seller/buyer**: All capabilities

## Migration Checklist

### Phase 1: Preparation
- [ ] Update authentication system to use new user model
- [ ] Update user profile components
- [ ] Update navigation and access control
- [ ] Test authentication flow

### Phase 2: API Updates
- [ ] Update all API calls to use new endpoints
- [ ] Update state management for unified user model
- [ ] Update forms and components
- [ ] Test all API integrations

### Phase 3: Feature Updates
- [ ] Implement capability-based access control
- [ ] Update user registration flow
- [ ] Update user profile management
- [ ] Test all user flows

### Phase 4: Testing and Deployment
- [ ] Test all functionality with new user model
- [ ] Test legacy compatibility
- [ ] Deploy to staging environment
- [ ] Deploy to production environment

## Common Issues and Solutions

### Issue 1: User ID Format Changes
**Problem**: Old code expects integer user IDs, new system uses UUID format.

**Solution**: Update all user ID handling to use the new format:
```javascript
// OLD
const userId = user.id; // integer

// NEW
const userId = user.unique_id; // "USR-XXXXXXXXXXXX"
```

### Issue 2: Role-Based Access Control
**Problem**: Old code uses role-based access, new system uses capabilities.

**Solution**: Replace role checks with capability checks:
```javascript
// OLD
if (user.role === 'seller') {
  // show seller features
}

// NEW
if (hasCapability('can_post_offers')) {
  // show seller features
}
```

### Issue 3: Separate Seller/Buyer Components
**Problem**: Old code has separate components for sellers and buyers.

**Solution**: Create unified components with capability-based rendering:
```javascript
// OLD
const SellerDashboard = () => { /* seller features */ };
const BuyerDashboard = () => { /* buyer features */ };

// NEW
const UserDashboard = () => {
  const { hasCapability } = useAuth();
  
  return (
    <div>
      {hasCapability('can_post_offers') && <SellerFeatures />}
      {hasCapability('can_browse_products') && <BuyerFeatures />}
    </div>
  );
};
```

## Testing

### Unit Tests
```javascript
// Test capability-based access control
describe('User Capabilities', () => {
  it('should allow seller capabilities for seller badge', () => {
    const user = { badge: 'seller', capabilities: ['can_post_offers'] };
    expect(hasCapability('can_post_offers')).toBe(true);
  });
  
  it('should allow buyer capabilities for buyer badge', () => {
    const user = { badge: 'buyer', capabilities: ['can_browse_products'] };
    expect(hasCapability('can_browse_products')).toBe(true);
  });
});
```

### Integration Tests
```javascript
// Test API integration
describe('API Integration', () => {
  it('should authenticate with new user model', async () => {
    const response = await api.post('/auth/login', credentials);
    expect(response.data.user.unique_id).toMatch(/^USR-/);
  });
  
  it('should create offers with new user model', async () => {
    const offer = await api.post('/offers', offerData);
    expect(offer.data.user_id).toMatch(/^USR-/);
  });
});
```

## Support

For issues or questions:
1. Check the migration guide
2. Review API documentation
3. Test with staging environment
4. Contact the development team

## Changelog

### Version 1.0.0 - User Model Migration
- ✅ Unified User model implementation
- ✅ Capability-based access control
- ✅ New authentication endpoints
- ✅ Enhanced user profile management
- ✅ New feature endpoints (offers, analytics, gamification, AI)
- ✅ Backward compatibility with legacy endpoints
- ✅ Comprehensive migration guide
