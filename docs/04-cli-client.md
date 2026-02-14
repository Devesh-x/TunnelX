# 📚 LocalBridge Documentation - Part 4: CLI Client

## 🎯 What We Just Built

The **CLI client** that users install to expose their localhost!

- ✅ Terminal-based authentication (login/register)
- ✅ WebSocket connection to tunnel server
- ✅ HTTP request forwarding to localhost
- ✅ Response forwarding back to server
- ✅ Graceful shutdown handling
- ✅ Beautiful CLI interface with colors and spinners

---

## 📦 CLI Structure

```
cli-client/
├── bin/
│   └── localbridge.js          # Executable entry point
├── src/
│   ├── index.js                # Main CLI router
│   ├── commands/
│   │   ├── login.js            # Login command
│   │   ├── register.js         # Register command
│   │   ├── logout.js           # Logout command
│   │   ├── whoami.js           # Show current user
│   │   └── start.js            # Start tunnel
│   ├── api/
│   │   └── client.js           # HTTP API client
│   ├── config/
│   │   └── store.js            # Local config storage
│   └── tunnel/
│       └── client.js           # WebSocket tunnel client
└── package.json
```

---

## 🔧 How It Works

### 1. **User Installs CLI**

```bash
cd cli-client
npm install
npm link  # Makes 'localbridge' command available globally
```

### 2. **User Logs In**

```bash
$ localbridge login

🔐 LocalBridge Login

Email: test@example.com
Password: ********
✅ Login successful!
Logged in as: test@example.com
Token saved locally
```

**What happens**:
1. CLI prompts for email/password
2. Calls API: `POST /auth/login`
3. Receives JWT token
4. Saves token to `~/.config/localbridge/config.json`

### 3. **User Starts Tunnel**

```bash
$ localbridge start --port 3000

🚇 LocalBridge Tunnel

✅ Tunnel created!
Tunnel ID: abc123xyz
🌐 Public URL: https://abc123xyz.localbridge.dev
🔗 Forwarding to: http://localhost:3000

✅ Connected to tunnel server
✅ Tunnel registered: abc123xyz
✅ Tunnel is active!
Press Ctrl+C to stop

← GET /api/users
→ 200 OK
← POST /api/login
→ 201 Created
```

**What happens**:
1. CLI calls API: `POST /tunnels/create` (with token)
2. Gets tunnel ID and public URL
3. Connects WebSocket: `ws://server:8080/ws?token=...`
4. Registers tunnel ID
5. Waits for requests
6. Forwards requests to localhost
7. Sends responses back

---

## 📝 Code Breakdown

### Config Store (`config/store.js`)

Saves user credentials locally using the `conf` library:

```javascript
const Conf = require('conf');

const config = new Conf({
  projectName: 'localbridge',
  defaults: {
    token: null,
    email: null,
    serverUrl: 'http://localhost:8080',
  },
});

// Save token
config.set('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Get token
const token = config.get('token');
```

**Where it's stored**:
- Windows: `C:\Users\<user>\AppData\Roaming\localbridge\config.json`
- Mac: `~/Library/Preferences/localbridge/config.json`
- Linux: `~/.config/localbridge/config.json`

---

### API Client (`api/client.js`)

Makes HTTP requests to tunnel server:

```javascript
const axios = require('axios');

const createClient = () => {
  return axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Login
const login = async (email, password) => {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

// Create tunnel
const createTunnel = async () => {
  const response = await client.post('/tunnels/create');
  return response.data.data.tunnel;
};
```

---

### Login Command (`commands/login.js`)

Interactive login with validation:

```javascript
const prompts = require('prompts');
const chalk = require('chalk');
const ora = require('ora');

const loginCommand = async () => {
  // Prompt for credentials
  const response = await prompts([
    {
      type: 'text',
      name: 'email',
      message: 'Email:',
      validate: (value) => {
        if (!value.includes('@')) return 'Invalid email';
        return true;
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
    },
  ]);

  // Show spinner
  const spinner = ora('Authenticating...').start();

  // Login
  const data = await login(response.email, response.password);

  // Save token
  saveAuth(data.token, data.user.email);

  spinner.succeed('✅ Login successful!');
};
```

**Libraries used**:
- `prompts` - Interactive terminal prompts
- `chalk` - Colored terminal output
- `ora` - Loading spinners

---

### Tunnel Client (`tunnel/client.js`)

WebSocket client that forwards requests:

```javascript
class TunnelClient {
  constructor(tunnelId, localPort) {
    this.tunnelId = tunnelId;
    this.localPort = localPort;
    this.ws = null;
  }

  async connect() {
    // Connect to WebSocket
    const url = `ws://server:8080/ws?token=${token}`;
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      // Register tunnel
      this.send({
        type: 'register',
        tunnelId: this.tunnelId,
      });
    });

    this.ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      await this.handleMessage(message);
    });
  }

  async handleRequest(message) {
    const { requestId, method, url, headers, body } = message;

    // Forward to localhost
    const response = await axios({
      method,
      url: `http://localhost:${this.localPort}${url}`,
      headers,
      data: body,
    });

    // Send response back
    this.send({
      type: 'response',
      requestId,
      response: {
        statusCode: response.status,
        headers: response.headers,
        body: response.data,
      },
    });
  }
}
```

---

## 🔄 Complete Flow Example

### User wants to share their React app:

```bash
# 1. User has React app running
$ npm start
> App running on http://localhost:3000

# 2. User starts tunnel (in another terminal)
$ localbridge start --port 3000

🚇 LocalBridge Tunnel
✅ Tunnel created!
🌐 Public URL: https://abc123xyz.localbridge.dev
🔗 Forwarding to: http://localhost:3000
✅ Tunnel is active!

# 3. User shares URL with friend
"Check out my app: https://abc123xyz.localbridge.dev"

# 4. Friend visits URL
Browser → https://abc123xyz.localbridge.dev

# 5. Request flow:
Friend's Browser
  ↓ HTTPS request
Tunnel Server (receives request)
  ↓ Extracts tunnel ID: "abc123xyz"
  ↓ Forwards via WebSocket
CLI Client (receives request)
  ↓ Forwards to localhost:3000
React App (processes request)
  ↓ Returns HTML
CLI Client (receives response)
  ↓ Sends back via WebSocket
Tunnel Server (receives response)
  ↓ Sends HTTP response
Friend's Browser (displays app) ✅
```

---

## 🎨 CLI Commands

### `localbridge register`
Create a new account

### `localbridge login`
Login to your account

### `localbridge start --port <port>`
Start exposing localhost

### `localbridge whoami`
Show current logged-in user

### `localbridge logout`
Logout from account

### `localbridge --help`
Show help

---

## 🧪 Testing the CLI

### 1. Install CLI
```bash
cd cli-client
npm install
npm link
```

### 2. Make sure server is running
```bash
cd tunnel-server
npm run dev
```

### 3. Register account
```bash
localbridge register
Email: test@example.com
Password: password123
Confirm password: password123
✅ Account created!
```

### 4. Start a test server
```bash
# In another terminal
cd ~
mkdir test-app
cd test-app
echo '{"message":"Hello from localhost!"}' > index.html
npx http-server -p 3000
```

### 5. Start tunnel
```bash
localbridge start --port 3000
✅ Tunnel created!
🌐 https://abc123xyz.localbridge.dev
```

### 6. Test it
```bash
curl https://abc123xyz.localbridge.dev
# Should return: {"message":"Hello from localhost!"}
```

---

## 📋 Summary

### What We Built:

**CLI Client**:
- ✅ Terminal-based authentication
- ✅ Token storage (saved locally)
- ✅ WebSocket connection
- ✅ Request forwarding
- ✅ Beautiful CLI interface

### How It Works:

```
1. User logs in → Token saved
2. User runs start → Tunnel created
3. CLI connects WebSocket → Registers tunnel
4. Internet user visits URL → Request forwarded
5. CLI forwards to localhost → Gets response
6. Response sent back → User sees it
```

### Next Steps:

- [ ] Add list command (show active tunnels)
- [ ] Add stop command (stop specific tunnel)
- [ ] Add logs command (view request logs)
- [ ] Optional: Browser-based login
- [ ] Optional: Dashboard UI

The CLI is now **fully functional**! 🎉
