# 📚 LocalBridge Documentation - Part 1: Project Setup

## 🎯 What We Just Built

We've created the **foundation** of LocalBridge - the project structure, configuration files, and Docker infrastructure. This is like building the foundation of a house before adding walls and rooms.

---

## 📁 Project Structure

```
TunnelX/
├── .gitignore                    # Files to ignore in git
├── .env.example                  # Template for environment variables
├── package.json                  # Root package.json (monorepo)
├── docker-compose.yml            # Docker services configuration
│
└── tunnel-server/                # Backend server (we'll build this next)
    ├── package.json              # Server dependencies
    ├── schema.sql                # Database schema
    └── .env                      # Server environment variables
```

---

## 📄 File-by-File Explanation

### 1. `.gitignore`

**Purpose**: Tells Git which files to ignore (not track in version control)

**What it does**:
- Ignores `node_modules/` (dependencies - too large for git)
- Ignores `.env` files (contain secrets - never commit these!)
- Ignores build outputs and logs
- Ignores IDE-specific files

**Why it matters**: Keeps your repository clean and prevents accidentally committing secrets.

---

### 2. `.env.example`

**Purpose**: Template showing what environment variables are needed

**Key Variables**:

```env
PORT=8080              # HTTP API server port
WS_PORT=8081           # WebSocket server port
BASE_DOMAIN=localbridge.dev  # Your tunnel domain

DB_HOST=localhost      # PostgreSQL host
DB_NAME=localbridge    # Database name

REDIS_HOST=localhost   # Redis host

JWT_SECRET=...         # Secret key for JWT tokens
JWT_EXPIRES_IN=7d      # Token expiration time
```

**How to use**:
1. Copy `.env.example` to `.env`
2. Change values as needed (especially `JWT_SECRET` in production)
3. Never commit `.env` to git!

**Why it matters**: Separates configuration from code. Different environments (dev/prod) can have different settings.

---

### 3. `docker-compose.yml`

**Purpose**: Defines all the services (containers) our application needs

**Services Defined**:

#### PostgreSQL (Database)
```yaml
postgres:
  image: postgres:15-alpine    # Lightweight PostgreSQL image
  ports: "5432:5432"           # Expose on port 5432
  volumes:
    - postgres_data:/var/lib/postgresql/data  # Persist data
    - ./tunnel-server/schema.sql:/docker-entrypoint-initdb.d/schema.sql  # Auto-run schema
  healthcheck:                 # Check if database is ready
    test: ["CMD-SHELL", "pg_isready -U postgres"]
```

**What this does**:
- Starts a PostgreSQL database
- Automatically runs `schema.sql` on first startup
- Persists data even if container restarts
- Health check ensures it's ready before other services start

#### Redis (Cache/Session Store)
```yaml
redis:
  image: redis:7-alpine        # Lightweight Redis image
  ports: "6379:6379"           # Expose on port 6379
  volumes:
    - redis_data:/data         # Persist data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

**What this does**:
- Starts a Redis server
- Used for storing active tunnel sessions
- Used for rate limiting counters
- Fast in-memory data store

**How to use**:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Why it matters**: Docker makes it easy to run PostgreSQL and Redis without installing them directly on your machine.

---

### 4. `package.json` (Root)

**Purpose**: Defines the monorepo structure and convenience scripts

**Key Concepts**:

#### Workspaces
```json
"workspaces": [
  "tunnel-server",
  "cli-client",
  "dashboard"
]
```

**What this means**: npm will manage multiple packages in one repository. Each workspace has its own `package.json`.

#### Scripts
```json
"scripts": {
  "dev:server": "npm run dev --workspace=tunnel-server",
  "docker:up": "docker-compose up -d",
  "install:all": "npm install && npm install --workspaces"
}
```

**How to use**:
```bash
# Install all dependencies
npm run install:all

# Start Docker services
npm run docker:up

# Run server in dev mode
npm run dev:server
```

**Why it matters**: Monorepo lets us manage multiple related projects (server, CLI, dashboard) in one place.

---

### 5. `tunnel-server/package.json`

**Purpose**: Defines dependencies for the tunnel server

**Key Dependencies**:

| Package | Purpose | Example Use |
|---------|---------|-------------|
| `express` | Web framework | Create HTTP API endpoints |
| `ws` | WebSocket library | Persistent connections with CLI clients |
| `pg` | PostgreSQL client | Store users and tunnels |
| `redis` | Redis client | Store active sessions, rate limiting |
| `jsonwebtoken` | JWT tokens | User authentication |
| `bcrypt` | Password hashing | Secure password storage |
| `joi` | Input validation | Validate user inputs |
| `winston` | Logging | Log requests and errors |
| `nanoid` | ID generation | Generate unique tunnel IDs |
| `helmet` | Security headers | Protect against common attacks |
| `cors` | CORS handling | Allow cross-origin requests |

**Scripts**:
```json
"dev": "nodemon src/server.js"    // Auto-restart on file changes
"start": "node src/server.js"     // Production start
```

**Why it matters**: These are the building blocks we'll use to create the tunnel server.

---

### 6. `tunnel-server/schema.sql`

**Purpose**: Defines the database structure (tables, columns, relationships)

**Tables Created**:

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,           -- Auto-incrementing ID
  email VARCHAR(255) UNIQUE NOT NULL,  -- User email (must be unique)
  password_hash VARCHAR(255) NOT NULL, -- Hashed password (never store plain text!)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**What this stores**: User accounts for authentication

#### Tunnels Table
```sql
CREATE TABLE tunnels (
  id VARCHAR(50) PRIMARY KEY,      -- Tunnel ID (e.g., "abc123")
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- Owner
  public_url VARCHAR(255) UNIQUE NOT NULL,  -- Public URL
  status VARCHAR(20) DEFAULT 'active',      -- active/inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**What this stores**: Active and historical tunnels

**Key Concepts**:

- **PRIMARY KEY**: Unique identifier for each row
- **FOREIGN KEY** (`user_id REFERENCES users(id)`): Links tunnel to user
- **ON DELETE CASCADE**: If user is deleted, delete their tunnels too
- **UNIQUE**: No two rows can have same value (e.g., email, public_url)
- **INDEX**: Makes queries faster (like a book index)

#### Logs Table (Optional)
```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  tunnel_id VARCHAR(50) REFERENCES tunnels(id) ON DELETE CASCADE,
  method VARCHAR(10),              -- GET, POST, etc.
  url TEXT,                        -- Request URL
  status_code INTEGER,             -- 200, 404, etc.
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**What this stores**: Request history for analytics

**Automatic Timestamp Update**:
```sql
CREATE TRIGGER update_tunnels_updated_at 
  BEFORE UPDATE ON tunnels 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**What this does**: Automatically updates `updated_at` whenever a tunnel is modified.

**Why it matters**: Defines how data is organized and related. Good schema design is crucial for performance and data integrity.

---

### 7. `tunnel-server/.env`

**Purpose**: Actual environment variables for development

**Key Differences from `.env.example`**:
- This file has actual values
- This file is in `.gitignore` (never committed)
- `.env.example` is committed (shows what's needed)

**Why it matters**: Keeps secrets out of version control while documenting what's needed.

---

## 🔄 How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│  DOCKER COMPOSE                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  PostgreSQL  │  │    Redis     │                        │
│  │   :5432      │  │    :6379     │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
│         │                 │                                 │
│         │ schema.sql      │                                 │
│         │ (auto-run)      │                                 │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│  TUNNEL SERVER (we'll build next)                          │
│  - Reads .env for configuration                            │
│  - Connects to PostgreSQL for data storage                 │
│  - Connects to Redis for sessions                          │
│  - Uses dependencies from package.json                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 What's Next?

Now that we have the foundation, we'll build:

1. **Database Connection** - Connect to PostgreSQL and Redis
2. **Authentication System** - User registration and login
3. **WebSocket Server** - Accept connections from CLI clients
4. **Tunnel Management** - Create, list, delete tunnels
5. **Request Router** - Forward HTTP requests to correct client

---

## 🧪 Testing What We Built

Let's verify everything is set up correctly:

### Step 1: Install Dependencies
```bash
cd C:\TunnelX
npm install
cd tunnel-server
npm install
```

### Step 2: Start Docker Services
```bash
cd C:\TunnelX
docker-compose up -d
```

### Step 3: Verify Services are Running
```bash
# Check PostgreSQL
docker-compose logs postgres

# Check Redis
docker-compose logs redis

# Verify both are healthy
docker-compose ps
```

You should see both services as "healthy" (Up).

### Step 4: Test Database Connection
```bash
# Connect to PostgreSQL
docker exec -it localbridge-postgres psql -U postgres -d localbridge

# Inside psql, list tables:
\dt

# You should see: users, tunnels, logs
# Exit with:
\q
```

### Step 5: Test Redis Connection
```bash
# Connect to Redis
docker exec -it localbridge-redis redis-cli

# Test with:
PING
# Should respond: PONG

# Exit with:
exit
```

---

## 📝 Key Concepts Learned

### 1. **Monorepo Structure**
- Multiple related projects in one repository
- Shared dependencies and scripts
- Easier to maintain and develop

### 2. **Docker Compose**
- Define multi-container applications
- Services can depend on each other
- Easy to start/stop entire stack

### 3. **Environment Variables**
- Separate configuration from code
- Different values for dev/prod
- Keep secrets secure

### 4. **Database Schema**
- Define data structure upfront
- Use relationships (foreign keys)
- Add indexes for performance

### 5. **Package Management**
- npm workspaces for monorepos
- Separate dependencies per package
- Shared scripts in root

---

## ❓ Common Questions

**Q: Why use Docker?**
A: Makes it easy to run PostgreSQL and Redis without installing them. Everyone gets the same environment.

**Q: Why separate .env and .env.example?**
A: `.env` has secrets (never commit). `.env.example` shows what's needed (safe to commit).

**Q: What's the difference between PostgreSQL and Redis?**
A: PostgreSQL is a persistent database (data survives restarts). Redis is in-memory (super fast, for temporary data like sessions).

**Q: Why use a monorepo?**
A: Easier to share code, keep versions in sync, and develop multiple related packages together.

**Q: What's a foreign key?**
A: Links rows in different tables. Example: `user_id` in tunnels table links to `id` in users table.

---

## 🎓 Next Lesson

In the next part, we'll build the **database connection layer** and create our first API endpoints for user authentication!

**You'll learn**:
- How to connect to PostgreSQL from Node.js
- How to hash passwords securely
- How to generate and verify JWT tokens
- How to create REST API endpoints

Ready to continue? 🚀
