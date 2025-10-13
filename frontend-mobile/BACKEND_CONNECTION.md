# Backend Connection Setup

This document explains how to connect the React Native frontend to the B2B Marketplace backend.

## Prerequisites

1. **Backend Setup**: Ensure the backend is set up and running at `c:\b2b-marketplace`
2. **Docker**: Backend uses Docker Compose for services
3. **Node.js**: Frontend requires Node.js and npm/yarn

## Quick Start

### 1. Start the Backend

```bash
# Navigate to backend directory
cd c:\b2b-marketplace

# Start all services (API, Database, Redis, RabbitMQ)
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Verify Backend Health

```bash
# Test backend health endpoint
curl http://localhost:8000/health

# Or use the test script
npm run backend:test
```

### 3. Start the Frontend

```bash
# In the frontend directory
npm start

# Or start both backend and frontend
npm run dev:full
```

## Backend Services

The backend runs the following services:

- **API Server**: `http://localhost:8000` (FastAPI)
- **Database**: `localhost:5432` (PostgreSQL)
- **Redis**: `localhost:6380` (Caching & Sessions)
- **RabbitMQ**: `localhost:5672` (Message Queue)

## API Endpoints

### Authentication
- `POST /otp/request` - Send OTP to phone number
- `POST /otp/verify` - Verify OTP and get access token
- `GET /me` - Get current user info
- `GET /me/profile` - Get user profile
- `PATCH /me/profile` - Update user profile
- `POST /me/sessions/logout-all` - Logout from all sessions

### Products
- `GET /products` - List products
- `GET /products/{id}` - Get product details
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Guilds (Categories)
- `GET /guilds` - List guilds
- `GET /guilds/{id}` - Get guild details
- `GET /guilds/{id}/products` - Get products in guild

### RFQs
- `GET /rfqs` - List RFQs
- `GET /rfqs/{id}` - Get RFQ details
- `POST /rfqs` - Create RFQ
- `PUT /rfqs/{id}` - Update RFQ
- `DELETE /rfqs/{id}` - Delete RFQ

## Configuration

### Frontend Configuration

The frontend is configured to connect to the backend through:

1. **API Configuration** (`src/config/api.ts`):
   ```typescript
   export const API_CONFIG = {
     BASE_URL: __DEV__ 
       ? 'http://localhost:8000' 
       : 'https://api.b2b-marketplace.com',
     // ... other config
   };
   ```

2. **Environment Variables** (`.env.local`):
   ```
   BACKEND_URL=http://localhost:8000
   EXPO_PUBLIC_API_URL=http://localhost:8000
   ```

### Backend Configuration

The backend configuration is in `c:\b2b-marketplace\app\core\config.py`:

```python
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace"
    REDIS_URL: str = "redis://localhost:6379/0"
    # ... other settings
```

## Authentication Flow

1. **Send OTP**: User enters phone number, frontend calls `/otp/request`
2. **Verify OTP**: User enters OTP, frontend calls `/otp/verify`
3. **Get Token**: Backend returns access token
4. **Fetch Profile**: Frontend calls `/me` to get user profile
5. **Store Token**: Token is stored securely using Expo SecureStore

## CORS Configuration

The backend is configured to allow CORS from the frontend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else ["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Backend Not Accessible

1. **Check if backend is running**:
   ```bash
   docker-compose ps
   ```

2. **Check backend logs**:
   ```bash
   docker-compose logs api
   ```

3. **Restart backend services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### CORS Issues

If you encounter CORS errors:

1. Check if the backend CORS configuration allows your frontend URL
2. Ensure the frontend is making requests to the correct backend URL
3. Check browser developer tools for specific CORS error messages

### Authentication Issues

1. **Token not being sent**: Check if the token is stored in SecureStore
2. **Token expired**: The frontend should automatically refresh tokens
3. **Invalid token**: Check if the token format matches backend expectations

### Network Issues

1. **Connection refused**: Backend is not running or not accessible
2. **Timeout**: Check network connectivity and backend response times
3. **DNS issues**: Use IP address instead of localhost if needed

## Development Workflow

### Running Both Services

```bash
# Terminal 1: Start backend
cd c:\b2b-marketplace
docker-compose up -d

# Terminal 2: Start frontend
npm start

# Or use the combined command
npm run dev:full
```

### Testing Connection

```bash
# Test backend health
npm run backend:test

# Test specific endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/otp/request -H "Content-Type: application/json" -d '{"phone":"09123456789"}'
```

### Debugging

1. **Frontend**: Use React Native Debugger or Flipper
2. **Backend**: Check Docker logs and FastAPI docs at `http://localhost:8000/api/docs`
3. **Network**: Use browser developer tools or network monitoring tools

## Production Deployment

For production deployment:

1. **Update API URLs** in `src/config/api.ts`
2. **Set environment variables** for production backend URL
3. **Configure CORS** on backend for production domains
4. **Use HTTPS** for all API communications
5. **Set up proper authentication** and token management

## Support

If you encounter issues:

1. Check the logs for both frontend and backend
2. Verify all services are running correctly
3. Test API endpoints directly using curl or Postman
4. Check network connectivity and firewall settings
