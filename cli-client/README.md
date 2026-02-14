# 🚀 TunnelX

**Expose your localhost to the internet in seconds.**

TunnelX is a professional, secure, and lightweight command-line tool that creates a secure tunnel from the public internet to your local machine. It's the perfect alternative to ngrok for testing webhooks, sharing demos, and developing locally.

![TunnelX Demo](https://tunnelx-frontend.vercel.app/demo-terminal.png)

## ✨ Features

- 🌐 **Instant Public URL**: Get a secure `https` URL for your localhost server immediately.
- 🔒 **Secure Tunnels**: All traffic is encrypted and securely forwarded.
- 🔄 **WebSocket Support**: Full support for real-time applications and WebSockets.
- 🕵️ **Request Inspection**: Real-time logging of incoming requests (Method, Path, Status).
- 🚀 **Zero Configuration**: Start a tunnel with a single command.
- 💻 **Cross-Platform**: Works on Windows, macOS, and Linux.
- 🆓 **Free to Use**: No credit card required.

## 📦 Installation

Install TunnelX globally using npm:

```bash
npm install -g tunnelx
```

Or run it directly with `npx`:

```bash
npx tunnelx start --port 3000
```

## ⚡ Quick Start

Follow this simple workflow to get started:

### 1. Register an Account
First time users need to create a free account.
```bash
tunnelx register
```

### 2. Login
Log in to your account securely.
```bash
tunnelx login
```

### 3. Start a Tunnel
Expose your local server (e.g., running on port 3000).
```bash
tunnelx start --port 3000
```

## 🖥️ Example Output

When you start a tunnel, you'll see a dashboard like this:

```bash
$ tunnelx start --port 3000

TunnelX Tunnel
==================================================

[Success] Tunnel created!
Tunnel ID:  abc123xyz
Public URL: https://abc123xyz.tunnelx.dev
Forwarding: https://abc123xyz.tunnelx.dev -> http://localhost:3000

[Success] Tunnel is active!
Press Ctrl+C to stop

[INFO]  GET  /api/users      200 OK
[INFO]  POST /webhooks/stripe 201 Created
```

## 🛠️ Commands

| Command | Description | Example |
|---------|-------------|---------|
| `tunnelx register` | Create a new TunnelX account | `tunnelx register` |
| `tunnelx login` | Login to your account | `tunnelx login` |
| `tunnelx start` | Start a tunnel on a specific port | `tunnelx start --port 8080` |
| `tunnelx whoami` | Check currently logged-in user | `tunnelx whoami` |
| `tunnelx logout` | Logout from the CLI | `tunnelx logout` |
| `tunnelx --help` | Show help and usage details | `tunnelx --help` |

## 🔍 How It Works

TunnelX creates a bridge between the public internet and your local machine:

1.  **Client**: The TunnelX CLI runs on your machine and connects to the TunnelX Server via a secure WebSocket connection.
2.  **Server**: The TunnelX Server (Reverse Proxy) receives public requests at `Your-Subdomain.tunnelx.dev`.
3.  **Forwarding**: The server forwards the request through the WebSocket to your CLI client.
4.  **Local Request**: The CLI client makes the actual request to your `localhost:<port>` and sends the response back through the tunnel.

## 🆚 Why TunnelX?

| Feature | TunnelX | ngrok (Free) | localtunnel |
|:--------|:-------:|:------------:|:-----------:|
| **Custom Subdomains** | ✅ | ❌ | ❌ (Unreliable) |
| **Persistent Identity** | ✅ | ❌ | ❌ |
| **Request Inspection** | ✅ | ✅ | ❌ |
| **Limits** | Generous | Restrictive | Unstable |
| **Open Source** | ✅ | ❌ | ✅ |

## 🏗️ Technical Stack

TunnelX is built with modern, high-performance technologies:
-   **Runtime**: Node.js & TypeScript
-   **Communication**: WebSockets (ws) for real-time duplex communication.
-   **Orchestration**: Redis (for session management and routing).
-   **CLI**: Commander.js for a robust command-line interface.

## ❓ Troubleshooting

**"Port already in use"**
Make sure no other instance of TunnelX is running.
`killall node` (macOS/Linux) or check Task Manager (Windows).

**"Connection refused"**
Ensure your local server (e.g., localhost:3000) is actually running before starting the tunnel.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
Repository: [github.com/Devesh-x/TunnelX](https://github.com/Devesh-x/TunnelX)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Devesh Rajput**
-   GitHub: [@Devesh-x](https://github.com/Devesh-x)
