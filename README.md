TunnelX

Expose your localhost to the internet — fast, secure, and developer-friendly tunneling.

TunnelX is a modern tunneling solution that lets you share your local server with a public URL in seconds. It includes a CLI client, dashboard UI, and backend tunnel server.

🚀 Install & Use (Recommended)
1️⃣ Install TunnelX CLI

Install globally from npm:

npm install -g tunnelx


✅ Requires Node.js 18+

2️⃣ Login to TunnelX

Authenticate with your TunnelX account:

tunnelx login

3️⃣ Start a Tunnel

Expose your local server by specifying the port.

Example (React app on port 5173):

tunnelx start --port 5173

Example Output
TunnelX Tunnel
[Success] Connected to tunnel server
Public URL: https://tunnelx-backend.onrender.com/t/abc123xyz/
Forwarding to: http://localhost:5173


Now your local app is accessible from anywhere 🌍

💡 Pro Tip

For frameworks like React, Next.js, Vue, build the app before tunneling:

npm run build && npm run preview


This prevents issues with absolute paths in development servers.

🧰 Features

✅ Public URL for localhost
✅ Secure JWT authentication
✅ WebSocket-based tunneling
✅ Fast CLI workflow
✅ Tunnel dashboard UI
✅ Rate limiting & security
✅ Real-time tunnel management

📦 Project Architecture

TunnelX consists of three main parts:

TunnelX/
├── backend/      # Node.js tunnel server + API
├── frontend/     # React dashboard
├── cli-client/   # TunnelX CLI (published to npm)
├── docs/
└── docker-compose.yml

🖥️ Local Development (Contributors Only)

If you want to run the full platform locally.

Prerequisites

Node.js 18+

Docker & Docker Compose

1. Start Databases
docker-compose up -d

2. Start Backend
cd backend
npm install
npm run dev


Runs on:

http://localhost:8080

3. Start Frontend Dashboard
cd frontend
npm install
npm run dev


Runs on:

http://localhost:5174

🎨 Tech Stack
Frontend

React 18

TypeScript

Tailwind CSS

shadcn/ui

Vite

framer-motion

Backend

Node.js

Express

PostgreSQL

Redis

JWT Authentication

WebSocket

CLI

Node.js

WebSocket client

HTTP API integration

🌐 API Endpoints
Authentication

POST /auth/register

POST /auth/login

GET /auth/me

Tunnels

POST /tunnels/create

GET /tunnels

DELETE /tunnels/:id

🔐 Environment Variables (Backend)
PORT=8080
DATABASE_URL=postgresql://tunnelx:password@localhost:5432/tunnelx
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development

🤝 Contributing

Fork repository

Create feature branch

Commit changes

Push branch

Open PR
