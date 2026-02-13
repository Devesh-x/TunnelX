# LocalBridge CLI

Command-line tool to expose your localhost to the internet.

## Installation

```bash
cd cli-client
npm install
npm link  # Makes 'localbridge' command available globally
```

## Usage

### 1. Register an account
```bash
localbridge register
```

### 2. Login
```bash
localbridge login
```

### 3. Start a tunnel
```bash
localbridge start --port 3000
```

### 4. Check who's logged in
```bash
localbridge whoami
```

### 5. Logout
```bash
localbridge logout
```

## Commands

- `localbridge register` - Create a new account
- `localbridge login` - Login to your account
- `localbridge start --port <port>` - Start exposing localhost
- `localbridge whoami` - Show current user
- `localbridge logout` - Logout from account
- `localbridge --help` - Show help

## Example

```bash
# Login
$ localbridge login
Email: test@example.com
Password: ********
✅ Login successful!

# Start tunnel
$ localbridge start --port 3000
🚇 LocalBridge Tunnel

✅ Tunnel created!
🌐 Public URL: https://abc123xyz.localbridge.dev
🔗 Forwarding to: http://localhost:3000

✅ Tunnel is active!
Press Ctrl+C to stop
```
