# 📚 LocalBridge Documentation - Part 2: Authentication & Tunnel Management

## 🎯 What We Just Built

We've created the **core backend API** with:
- ✅ User authentication (register/login with JWT)
- ✅ Tunnel management (create/list/delete tunnels)
- ✅ Database models for Users and Tunnels
- ✅ Middleware for auth, rate limiting, and logging
- ✅ Complete Express server with all routes

---

## 📁 New File Structure

```
tunnel-server/src/
├── server.js                    # Main entry point
├── config/
│   ├── database.js              # PostgreSQL connection
│   └── redis.js                 # Redis connection
├── models/
│   ├── User.js                  # User database operations
│   └── Tunnel.js                # Tunnel database operations
├── controllers/
│   ├── authController.js        # Auth logic (register/login)
│   └── tunnelController.js      # Tunnel logic (CRUD)
├── services/
│   └── tunnelService.js         # Tunnel business logic
├── routes/
│   ├── auth.js                  # Auth endpoints
│   └── tunnels.js               # Tunnel endpoints
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── rateLimit.js             # Rate limiting
│   └── logger.js                # Request logging
└── utils/
    └── logger.js                # Winston logger
```

---

## 🔐 Authentication System

### How It Works

```
1. User registers → Password hashed with bcrypt → Stored in database
2. User logs in → Password verified → JWT token generated
3. User makes request → Token sent in header → Middleware verifies → Request proceeds
```

### User Model (`models/User.js`)

**Key Functions**:

#### `createUser(email, password)`
```javascript
// Hashes password and creates user
const user = await User.createUser('test@example.com', 'password123');
// Returns: { id, email, created_at }
```

**What it does**:
1. Hashes password with bcrypt (10 rounds)
2. Inserts into database
3. Returns user (without password!)

#### `findUserByEmail(email)`
```javascript
// Find user for login
const user = await User.findUserByEmail('test@example.com');
// Returns: { id, email, password_hash, created_at } or null
```

#### `verifyPassword(plainPassword, hashedPassword)`
```javascript
// Check if password is correct
const isValid = await User.verifyPassword('password123', user.password_hash);
// Returns: true or false
```

**Security Note**: Passwords are NEVER stored in plain text. We use bcrypt which:
- Hashes passwords (one-way encryption)
- Adds salt (random data to prevent rainbow table attacks)
- Takes time to compute (prevents brute force)

---

### Auth Controller (`controllers/authController.js`)

#### POST /auth/register

**Request**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "createdAt": "2026-02-12T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**What happens**:
1. Validates input (email format, password length ≥ 6)
2. Creates user (password is hashed)
3. Generates JWT token
4. Returns user + token

#### POST /auth/login

**Request**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "createdAt": "2026-02-12T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**What happens**:
1. Validates input
2. Finds user by email
3. Verifies password
4. Generates JWT token
5. Returns user + token

#### GET /auth/me (Protected)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "createdAt": "2026-02-12T12:00:00Z"
    }
  }
}
```

---

### JWT Tokens Explained

**What is JWT?**
- JSON Web Token - a secure way to transmit information
- Contains user data (id, email) + expiration
- Signed with secret key (can't be tampered with)

**Token Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← Header
eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBl...  ← Payload (user data)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_a...  ← Signature
```

**How to use**:
```bash
# Include in Authorization header
Authorization: Bearer <token>
```

**Token Expiration**: 7 days (configurable in `.env`)

---

### Auth Middleware (`middleware/auth.js`)

**Purpose**: Protect routes that require authentication

**How it works**:
```javascript
// 1. Extract token from header
const token = req.headers.authorization.split(' ')[1];

// 2. Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. Attach user to request
req.user = { id: decoded.userId, email: decoded.email };

// 4. Continue to next middleware/controller
next();
```

**Usage in routes**:
```javascript
router.get('/tunnels', authMiddleware, tunnelController.getTunnels);
//                     ↑ This runs first, adds req.user
```

---

## 🚇 Tunnel Management System

### How It Works

```
1. User creates tunnel → Generate unique ID → Generate public URL → Store in DB + Redis
2. User lists tunnels → Query database → Return all user's tunnels
3. User deletes tunnel → Remove from DB + Redis → Cleanup connections
```

### Tunnel Model (`models/Tunnel.js`)

**Key Functions**:

#### `createTunnel(id, userId, publicUrl)`
```javascript
const tunnel = await Tunnel.createTunnel('abc123xyz', 1, 'https://abc123xyz.localbridge.dev');
// Returns: { id, user_id, public_url, status, created_at, updated_at }
```

#### `findTunnelsByUserId(userId)`
```javascript
const tunnels = await Tunnel.findTunnelsByUserId(1);
// Returns: Array of all user's tunnels
```

#### `deleteTunnelByUser(userId, tunnelId)`
```javascript
const deleted = await Tunnel.deleteTunnelByUser(1, 'abc123xyz');
// Returns: true if deleted, false if not found
```

---

### Tunnel Service (`services/tunnelService.js`)

**Business logic layer** - sits between controller and model

#### `generateTunnelId()`
```javascript
const id = generateTunnelId();
// Returns: "abc123xyz" (10 random characters using nanoid)
```

**Why nanoid?**
- Fast and secure random ID generation
- URL-safe characters
- Collision-resistant (very unlikely to generate same ID twice)

#### `generatePublicUrl(tunnelId)`
```javascript
const url = generatePublicUrl('abc123xyz');
// Returns: "https://abc123xyz.localbridge.dev"
```

#### `createTunnel(userId)`
```javascript
const tunnel = await tunnelService.createTunnel(1);
// Returns: { id, user_id, public_url, status, created_at, updated_at }
```

**What it does**:
1. Generates unique tunnel ID
2. Generates public URL
3. Saves to PostgreSQL (persistent)
4. Saves to Redis (fast lookup)
5. Returns tunnel object

**Why both PostgreSQL and Redis?**
- **PostgreSQL**: Permanent storage, survives restarts
- **Redis**: Fast in-memory lookup for active tunnels

---

### Tunnel Controller (`controllers/tunnelController.js`)

#### POST /tunnels/create (Protected)

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tunnel": {
      "id": "abc123xyz",
      "publicUrl": "https://abc123xyz.localbridge.dev",
      "status": "active",
      "createdAt": "2026-02-12T12:00:00Z"
    }
  }
}
```

#### GET /tunnels (Protected)

**Query Parameters**:
- `active=true` - Only return active tunnels

**Response**:
```json
{
  "success": true,
  "data": {
    "tunnels": [
      {
        "id": "abc123xyz",
        "publicUrl": "https://abc123xyz.localbridge.dev",
        "status": "active",
        "createdAt": "2026-02-12T12:00:00Z",
        "updatedAt": "2026-02-12T12:00:00Z"
      }
    ]
  }
}
```

#### GET /tunnels/:id (Protected)

**Response**:
```json
{
  "success": true,
  "data": {
    "tunnel": {
      "id": "abc123xyz",
      "publicUrl": "https://abc123xyz.localbridge.dev",
      "status": "active",
      "createdAt": "2026-02-12T12:00:00Z",
      "updatedAt": "2026-02-12T12:00:00Z"
    }
  }
}
```

**Authorization**: Only the tunnel owner can view it

#### DELETE /tunnels/:id (Protected)

**Response**:
```json
{
  "success": true,
  "message": "Tunnel deleted successfully"
}
```

**What it does**:
1. Verifies user owns the tunnel
2. Deletes from PostgreSQL
3. Deletes from Redis
4. Returns success message

---

## 🛡️ Middleware Explained

### Rate Limiting (`middleware/rateLimit.js`)

**Purpose**: Prevent abuse by limiting requests per time window

**How it works**:
```javascript
// Uses Redis to count requests
const count = await incrementRateLimit('ip:192.168.1.1', 900000);

if (count > 100) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

**Three Presets**:

| Preset | Window | Max Requests | Use Case |
|--------|--------|--------------|----------|
| `strictRateLimiter` | 15 min | 5 | Login, register |
| `standardRateLimiter` | 15 min | 100 | API endpoints |
| `lenientRateLimiter` | 15 min | 300 | Public endpoints |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707742800000
```

---

### Request Logging (`middleware/logger.js`)

**Purpose**: Log all requests for debugging and monitoring

**What it logs**:
```javascript
{
  method: 'POST',
  url: '/auth/login',
  status: 200,
  duration: '45ms',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
}
```

**Log Files**:
- `logs/combined.log` - All logs
- `logs/error.log` - Only errors

---

## 🖥️ Main Server (`server.js`)

### Middleware Stack (Order Matters!)

```javascript
1. helmet()           // Security headers
2. cors()             // Allow cross-origin requests
3. express.json()     // Parse JSON bodies
4. requestLogger      // Log all requests
5. Routes             // Handle endpoints
6. notFoundHandler    // 404 for unknown routes
7. errorHandler       // Catch all errors
```

### Startup Sequence

```javascript
1. Load environment variables (.env)
2. Connect to PostgreSQL
3. Connect to Redis
4. Start HTTP server on port 8080
5. (TODO) Start WebSocket server on port 8081
```

### Health Check Endpoint

**GET /health**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-12T12:00:00Z"
}
```

**Use case**: Check if server is alive (for monitoring, load balancers)

---

## 🔄 Complete Request Flow

### Example: Create Tunnel

```
1. Client sends request:
   POST /tunnels/create
   Headers: { Authorization: "Bearer <token>" }

2. Server receives request
   ↓
3. requestLogger middleware
   Logs: "POST /tunnels/create"
   ↓
4. authMiddleware
   Verifies JWT token
   Adds req.user = { id: 1, email: "test@example.com" }
   ↓
5. standardRateLimiter
   Checks Redis: user:1 → 45 requests (< 100)
   Increments counter
   ↓
6. tunnelController.createTunnel
   Calls tunnelService.createTunnel(1)
   ↓
7. tunnelService.createTunnel
   - Generates ID: "abc123xyz"
   - Generates URL: "https://abc123xyz.localbridge.dev"
   - Saves to PostgreSQL
   - Saves to Redis
   ↓
8. Response sent:
   {
     "success": true,
     "data": {
       "tunnel": { ... }
     }
   }
   ↓
9. requestLogger logs completion:
   "POST /tunnels/create 201 45ms"
```

---

## 🧪 Testing the API

### 1. Start Docker Services

```bash
# Make sure Docker Desktop is running!
docker-compose up -d

# Check status
docker-compose ps
```

You should see:
- `localbridge-postgres` - healthy
- `localbridge-redis` - healthy

### 2. Install Dependencies

```bash
cd tunnel-server
npm install
```

### 3. Start Server

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
✅ Redis client ready
✅ HTTP Server running on port 8080
```

### 4. Test Endpoints

#### Register User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "createdAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token!** You'll need it for other requests.

#### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Create Tunnel
```bash
curl -X POST http://localhost:8080/tunnels/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "tunnel": {
      "id": "abc123xyz",
      "publicUrl": "https://abc123xyz.localbridge.dev",
      "status": "active",
      "createdAt": "..."
    }
  }
}
```

#### List Tunnels
```bash
curl -X GET http://localhost:8080/tunnels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Delete Tunnel
```bash
curl -X DELETE http://localhost:8080/tunnels/abc123xyz \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Verification

### Check Users Table
```bash
# Connect to PostgreSQL
docker exec -it localbridge-postgres psql -U postgres -d localbridge

# Query users
SELECT * FROM users;

# Exit
\q
```

### Check Redis Data
```bash
# Connect to Redis
docker exec -it localbridge-redis redis-cli

# List all keys
KEYS *

# Get tunnel session
GET tunnel:abc123xyz

# Exit
exit
```

---

## 🔑 Key Concepts Learned

### 1. **MVC Architecture**
- **Model**: Database operations (`User.js`, `Tunnel.js`)
- **Controller**: Request handling (`authController.js`, `tunnelController.js`)
- **Service**: Business logic (`tunnelService.js`)
- **Routes**: URL mapping (`auth.js`, `tunnels.js`)

### 2. **Middleware Pattern**
- Functions that run before controllers
- Can modify request/response
- Can stop request (e.g., auth failure)
- Order matters!

### 3. **JWT Authentication**
- Stateless (no session storage needed)
- Token contains user data
- Verified with secret key
- Expires after set time

### 4. **Rate Limiting**
- Prevents abuse
- Uses Redis for distributed counting
- Different limits for different endpoints
- Returns 429 status when exceeded

### 5. **Input Validation**
- Use Joi schemas
- Validate before processing
- Return clear error messages
- Prevents invalid data in database

### 6. **Error Handling**
- Try/catch in all async functions
- Log errors for debugging
- Return user-friendly messages
- Don't leak sensitive info in production

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to PostgreSQL"
**Solution**: Make sure Docker is running and PostgreSQL container is healthy
```bash
docker-compose ps
docker-compose logs postgres
```

### Issue: "Cannot connect to Redis"
**Solution**: Check Redis container status
```bash
docker-compose logs redis
```

### Issue: "JWT secret not defined"
**Solution**: Check `.env` file has `JWT_SECRET`

### Issue: "Email already exists"
**Solution**: User already registered, use different email or login

### Issue: "Invalid token"
**Solution**: Token expired or malformed, login again to get new token

---

## 🎓 Next Steps

In the next part, we'll build the **WebSocket server** which is the core of the tunneling system!

**You'll learn**:
- How WebSocket connections work
- How to maintain persistent connections
- How to route HTTP requests through WebSockets
- How to serialize/deserialize request data
- How to handle client disconnections

Ready to continue? 🚀
