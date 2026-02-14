# TunnelX

> **Expose your localhost to the internet** - Fast, secure, and simple tunneling solution

A modern localhost tunneling service built with Node.js, React, TypeScript, and Tailwind CSS.

## 📁 Project Structure

```
TunnelX/
├── backend/              # Node.js API server (formerly tunnel-server)
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, logging, rate limiting
│   │   └── server.js     # Entry point
│   └── package.json
│
├── frontend/             # React TypeScript dashboard (formerly dashboard-new)
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities & API client
│   │   └── App.tsx       # Main app
│   └── package.json
│
├── cli-client/           # CLI tool for creating tunnels
│   └── src/
│
├── docs/                 # Documentation
└── docker-compose.yml    # PostgreSQL + Redis
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Start Databases
```bash
docker-compose up -d
```

### 2. Start Backend
```bash
cd backend
npm install
node src/server.js
```
Backend runs on: `http://localhost:8080`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5174`

## 🎨 Frontend Stack

- **TypeScript** - Type safety
- **React 18** - UI library
- **Tailwind CSS v3** - Styling
- **shadcn/ui** - Component library
- **framer-motion** - Animations
- **React Router** - Routing
- **Vite** - Build tool

## 🔧 Backend Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Redis** - Caching & rate limiting
- **JWT** - Authentication
- **WebSocket** - Real-time tunneling

## 📖 Features

### Frontend
- ✨ Animated hero with word transitions
- 🔐 JWT authentication (login/register)
- 📊 Dashboard for tunnel management
- 🎨 Dark theme with Tailwind CSS
- 📱 Fully responsive design
- 🚀 Protected routes

### Backend
- 🔒 Secure JWT authentication
- 🚇 Tunnel creation & management
- 📡 WebSocket server for tunneling
- 🛡️ Rate limiting with Redis
- 📝 Request logging
- 💾 PostgreSQL data persistence

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Tunnels
- `POST /tunnels/create` - Create tunnel
- `GET /tunnels` - List user's tunnels
- `DELETE /tunnels/:id` - Delete tunnel

### Health
- `GET /health` - Server health check

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=8080
DATABASE_URL=postgresql://tunnelx:password@localhost:5432/tunnelx
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📝 Development

### Backend
```bash
cd backend
npm run dev    # Start with nodemon
```

### Frontend
```bash
cd frontend
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

## 🧪 Testing

Visit `http://localhost:5174` and:
1. Click "Get Started" to register
2. Login with your credentials
3. Create a tunnel from the dashboard
4. Copy the public URL

## 📦 Project Dependencies

### Frontend
- react-router-dom - Routing
- axios - HTTP client
- framer-motion - Animations
- lucide-react - Icons
- @radix-ui/react-slot - Primitives
- class-variance-authority - Component variants
- tailwind-merge - Tailwind utilities

### Backend
- express - Web framework
- pg - PostgreSQL client
- redis - Redis client
- jsonwebtoken - JWT auth
- bcrypt - Password hashing
- ws - WebSocket server
- helmet - Security headers

## 🏗️ Architecture

```
Client (Browser)
    ↓
Frontend (React)
    ↓ HTTP/REST
Backend (Express)
    ↓
PostgreSQL + Redis
    ↓
WebSocket Server
    ↓
Tunnel Connections
```

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---
