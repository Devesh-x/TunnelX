# 📚 LocalBridge Documentation - Part 3: WebSocket Server & Request Routing

## 🎯 What We Just Built

The **core tunneling magic**! This is what makes LocalBridge work:

- ✅ WebSocket server for persistent CLI connections
- ✅ JWT authentication for WebSocket connections
- ✅ Tunnel registration system
- ✅ Request routing from public URLs to CLI clients
- ✅ Response forwarding back to internet users
- ✅ Stats endpoint for monitoring

---

## 🌐 How Tunneling Works

### The Complete Flow:

```
1. User starts CLI client
   ↓
2. CLI connects to WebSocket server
   ↓
3. CLI registers tunnel ID
   ↓
4. Internet user visits public URL
   ↓
5. Server routes request to CLI via WebSocket
   ↓
6. CLI forwards to localhost
   ↓
7. Response sent back through tunnel
   ↓
8. Internet user receives response
```

---

## 🔌 WebSocket Server (`websocket/server.js`)

### What is WebSocket?

**HTTP** (normal web requests):
- Request → Response → Connection closes
- Like sending a letter

**WebSocket**:
- Connection stays open
- Two-way communication
- Like a phone call

### Why WebSocket for Tunneling?

```javascript
// HTTP (doesn't work for tunneling)
Client → Server: "Give me data"
Server → Client: "Here's data"
Connection closes ❌

// WebSocket (perfect for tunneling)
Client ←→ Server: Persistent connection
Server can send requests to Client anytime ✅
Client can send responses back ✅
```

---

## 📡 WebSocket Server Code Breakdown

### 1. **Initialize WebSocket Server**

```javascript
const initWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ 
    server,           // Attach to HTTP server
    path: '/ws',      // WebSocket endpoint
  });

  wss.on('connection', handleConnection);
  
  return wss;
};
```

**What this does**:
- Creates WebSocket server on same port as HTTP (8080)
- Listens at `ws://localhost:8080/ws`
- Calls `handleConnection` for each new client

---

### 2. **Handle New Connection**

```javascript
const handleConnection = async (ws, req) => {
  // Extract token from URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  if (!token) {
    ws.close(1008, 'Authentication required');
    return;
  }
  
  // Verify JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  userId = decoded.userId;
  
  // Connection authenticated!
};
```

**Connection URL**:
```
ws://localhost:8080/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      ↑ WebSocket path
                           ↑ JWT token in query string
```

**Why token in URL?**
- WebSocket doesn't support headers like HTTP
- Query string is the standard way to pass auth

---

### 3. **Tunnel Registration**

```javascript
ws.on('message', async (message) => {
  const data = JSON.parse(message.toString());
  
  if (data.type === 'register' && data.tunnelId) {
    tunnelId = data.tunnelId;
    
    // Store connection
    activeConnections.set(tunnelId, ws);
    
    // Store in Redis
    await setConnectionMapping(tunnelId, tunnelId);
    
    // Send confirmation
    ws.send(JSON.stringify({
      type: 'registered',
      tunnelId,
      message: 'Tunnel connected successfully',
    }));
  }
});
```

**Message Flow**:
```
CLI → Server:
{
  "type": "register",
  "tunnelId": "abc123xyz"
}

Server → CLI:
{
  "type": "registered",
  "tunnelId": "abc123xyz",
  "message": "Tunnel connected successfully"
}
```

---

### 4. **Forward Request to Client**

```javascript
const forwardRequest = (tunnelId, requestData) => {
  return new Promise((resolve, reject) => {
    const ws = getConnection(tunnelId);
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return reject(new Error('Tunnel not connected'));
    }
    
    // 30 second timeout
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);
    
    // Listen for response
    ws.on('tunnel-response', (data) => {
      if (data.requestId === requestData.requestId) {
        clearTimeout(timeout);
        resolve(data.response);
      }
    });
    
    // Send request
    ws.send(JSON.stringify({
      type: 'request',
      requestId: requestData.requestId,
      method: requestData.method,
      url: requestData.url,
      headers: requestData.headers,
      body: requestData.body,
    }));
  });
};
```

**What this does**:
1. Gets WebSocket connection for tunnel
2. Sets 30-second timeout
3. Sends request to CLI
4. Waits for response
5. Returns response or timeout error

---

## 🚦 Request Router (`websocket/requestRouter.js`)

### How It Works:

```
Internet User → https://abc123xyz.localbridge.dev/api/users
                ↓
Request Router extracts tunnel ID: "abc123xyz"
                ↓
Looks up WebSocket connection
                ↓
Forwards request via WebSocket
                ↓
CLI receives and processes
                ↓
Response sent back
```

---

### 1. **Extract Tunnel ID from Subdomain**

```javascript
const extractTunnelId = (host) => {
  // Input: "abc123xyz.localbridge.dev:8080"
  const hostname = host.split(':')[0];
  // Result: "abc123xyz.localbridge.dev"
  
  const parts = hostname.split('.');
  // Result: ["abc123xyz", "localbridge", "dev"]
  
  const tunnelId = parts[0];
  // Result: "abc123xyz"
  
  // Validate format (10 alphanumeric characters)
  if (!/^[a-zA-Z0-9_-]{10}$/.test(tunnelId)) {
    return null;
  }
  
  return tunnelId;
};
```

**Examples**:
```
"abc123xyz.localbridge.dev" → "abc123xyz" ✅
"def456uvw.localbridge.dev:8080" → "def456uvw" ✅
"localbridge.dev" → null ❌ (no subdomain)
"invalid.localbridge.dev" → null ❌ (wrong length)
```

---

### 2. **Route Request**

```javascript
const routeRequest = async (req, res) => {
  // 1. Extract tunnel ID
  const tunnelId = extractTunnelId(req.headers.host);
  
  // 2. Check if tunnel exists
  const tunnelSession = await getTunnelSession(tunnelId);
  
  if (!tunnelSession) {
    return res.status(404).json({ error: 'Tunnel not found' });
  }
  
  // 3. Generate unique request ID
  const requestId = nanoid(16);
  
  // 4. Prepare request data
  const requestData = {
    requestId,
    method: req.method,
    url: req.url,
    headers: sanitizeHeaders(req.headers),
    body: req.body,
  };
  
  // 5. Forward to CLI via WebSocket
  const response = await forwardRequest(tunnelId, requestData);
  
  // 6. Send response back
  res.status(response.statusCode || 200);
  res.send(response.body);
};
```

---

### 3. **Sanitize Headers**

```javascript
const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  
  // Remove headers that shouldn't be forwarded
  delete sanitized.host;
  delete sanitized.connection;
  delete sanitized['transfer-encoding'];
  delete sanitized['content-length'];
  
  return sanitized;
};
```

**Why remove these?**
- `host`: Will be `localhost:3000`, not the tunnel URL
- `connection`: WebSocket-specific
- `transfer-encoding`: Will be recalculated
- `content-length`: Will be recalculated

---

## 🔄 Complete Request Flow Example

### User visits: `https://abc123xyz.localbridge.dev/api/users`

```
1. DNS Resolution
   abc123xyz.localbridge.dev → 123.45.67.89 (server IP)

2. HTTPS Request to Server
   GET /api/users
   Host: abc123xyz.localbridge.dev

3. Tunnel Middleware (server.js)
   - Checks if request is for a tunnel
   - Calls routeRequest()

4. Request Router
   - Extracts tunnel ID: "abc123xyz"
   - Checks Redis: Tunnel exists? ✅
   - Generates request ID: "req_abc123xyz12345"

5. Forward via WebSocket
   Server → CLI:
   {
     "type": "request",
     "requestId": "req_abc123xyz12345",
     "method": "GET",
     "url": "/api/users",
     "headers": { ... },
     "body": null
   }

6. CLI Processes Request
   - Receives WebSocket message
   - Makes HTTP request to localhost:3000/api/users
   - Gets response: { "users": [...] }

7. CLI Sends Response
   CLI → Server:
   {
     "type": "response",
     "requestId": "req_abc123xyz12345",
     "response": {
       "statusCode": 200,
       "headers": { "content-type": "application/json" },
       "body": "{\"users\":[...]}"
     }
   }

8. Server Forwards Response
   - Matches request ID
   - Sends HTTP response to original requester

9. User Receives Response
   Status: 200 OK
   Body: {"users":[...]}
```

---

## 📊 Stats Endpoint

### GET /stats

```javascript
{
  "success": true,
  "data": {
    "server": {
      "uptime": 3600,  // seconds
      "environment": "development"
    },
    "connections": {
      "active": 3,  // 3 CLI clients connected
      "tunnelIds": ["abc123xyz", "def456uvw", "ghi789rst"]
    },
    "tunnels": {
      "active": 5,
      "inactive": 2,
      "total": 7
    }
  }
}
```

**Use cases**:
- Monitor server health
- See active tunnels
- Debug connection issues

---

## 🔑 Key Concepts

### 1. **WebSocket vs HTTP**

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Connection | Request/Response | Persistent |
| Direction | Client → Server | Bidirectional |
| Use case | Normal web pages | Real-time apps |
| Tunneling | ❌ Can't work | ✅ Perfect |

### 2. **Request ID**

Every request gets a unique ID:
```javascript
const requestId = nanoid(16);  // "req_abc123xyz12345"
```

**Why?**
- Match responses to requests
- Handle multiple concurrent requests
- Debug and logging

### 3. **Timeout Handling**

```javascript
const timeout = setTimeout(() => {
  reject(new Error('Request timeout'));
}, 30000);  // 30 seconds
```

**Why 30 seconds?**
- Prevents hanging requests
- Client might be slow or disconnected
- User gets clear error message

### 4. **Connection Registry**

```javascript
const activeConnections = new Map();
activeConnections.set(tunnelId, ws);
```

**Map structure**:
```
"abc123xyz" → WebSocket connection 1
"def456uvw" → WebSocket connection 2
"ghi789rst" → WebSocket connection 3
```

---

## 🧪 Testing the WebSocket Server

### 1. Start Server

```bash
cd tunnel-server
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
✅ HTTP Server running on port 8080
✅ WebSocket server running on port 8080 (path: /ws)
```

### 2. Test Stats Endpoint

```bash
curl http://localhost:8080/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "connections": {
      "active": 0
    },
    "tunnels": {
      "active": 0,
      "inactive": 0
    }
  }
}
```

### 3. Test WebSocket Connection (using wscat)

```bash
# Install wscat
npm install -g wscat

# Get a token first
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Connect to WebSocket
wscat -c "ws://localhost:8080/ws?token=YOUR_TOKEN_HERE"
```

---

## 📝 Summary

### What We Built:

**WebSocket Server**:
- Accepts CLI connections
- Authenticates with JWT
- Maintains persistent connections
- Forwards requests bidirectionally

**Request Router**:
- Extracts tunnel ID from subdomain
- Routes HTTP requests to correct tunnel
- Handles responses and errors
- 30-second timeout protection

**Stats Endpoint**:
- Monitor active connections
- Track tunnel usage
- Server health check

### Next Steps:

Now we need to build the **CLI Client** that:
- Connects to this WebSocket server
- Registers a tunnel
- Forwards requests to localhost
- Sends responses back

Ready for the CLI client? 🚀
