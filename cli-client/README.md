# TunnelX CLI

**Expose your localhost to the internet.**

A professional, secure, and lightweight tunneling solution for developers.

## Installation

```bash
npm install -g tunnelx
```

## Quick Start

### 1. Register an account
```bash
tunnelx register
```

### 2. Login
```bash
tunnelx login
```

### 3. Start a tunnel
```bash
tunnelx start --port 3000
```
*(Replace 3000 with your local server port)*

## Commands

- `tunnelx register` - Create a new account
- `tunnelx login` - Login to your account
- `tunnelx start --port <port>` - Start exposing localhost
- `tunnelx whoami` - Show current user info
- `tunnelx logout` - Logout from account
- `tunnelx --help` - Show help

## Example Usage

```bash
# Login
$ tunnelx login
Email: test@example.com
Password: ********
[Success] Login successful!

# Start tunnel
$ tunnelx start --port 3000
TunnelX Tunnel

[Success] Tunnel created!
Tunnel ID: abc123xyz
Public URL: https://tunnelx-backend.onrender.com/t/abc123xyz/
Forwarding to: http://localhost:3000

[Success] Tunnel is active!
Press Ctrl+C to stop
```

---
