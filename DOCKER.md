# Docker Deployment Guide

This guide explains how to build and run the Translato application using Docker.

---

## Prerequisites

1. **Docker installed**: [Get Docker](https://docs.docker.com/get-docker/)
2. **Docker Compose installed**: Comes with Docker Desktop, or [install separately](https://docs.docker.com/compose/install/)
3. **API Key**: Anthropic API key in environment variable or `.env` file

---

## Quick Start

### 1. Set up environment variables

Create a `.env` file in the project root (where `docker-compose.yml` is):

```bash
# .env
ANTHROPIC_API_KEY=sk-your-api-key-here
```

**Important**: This `.env` file should be in `.gitignore` (it already is).

### 2. Build and run with one command

```bash
docker-compose up --build
```

**What this does**:
- Builds both images (frontend and backend)
- Creates containers
- Starts both services
- Shows logs from both in the terminal

### 3. Access the application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Stop the application

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

---

## Detailed Commands

### Build Images

Build both images:
```bash
docker-compose build
```

Build only backend:
```bash
docker-compose build backend
```

Build only frontend:
```bash
docker-compose build frontend
```

Build without cache (force rebuild):
```bash
docker-compose build --no-cache
```

### Run Containers

Run in foreground (see logs):
```bash
docker-compose up
```

Run in background (detached):
```bash
docker-compose up -d
```

Build and run:
```bash
docker-compose up --build
```

### View Logs

View all logs:
```bash
docker-compose logs
```

Follow logs (like `tail -f`):
```bash
docker-compose logs -f
```

View only backend logs:
```bash
docker-compose logs backend
```

View only frontend logs:
```bash
docker-compose logs frontend
```

### Stop and Remove

Stop containers (keep images and volumes):
```bash
docker-compose stop
```

Stop and remove containers:
```bash
docker-compose down
```

Stop, remove containers, and remove images:
```bash
docker-compose down --rmi all
```

Stop, remove containers, and remove volumes:
```bash
docker-compose down -v
```

### Execute Commands in Running Containers

Open bash in backend container:
```bash
docker-compose exec backend bash
```

Open bash in frontend container (uses sh, not bash):
```bash
docker-compose exec frontend sh
```

Run a command in backend:
```bash
docker-compose exec backend python -c "print('Hello')"
```

### View Running Containers

```bash
docker-compose ps
```

### Restart Services

Restart all:
```bash
docker-compose restart
```

Restart only backend:
```bash
docker-compose restart backend
```

---

## Understanding the Architecture

### What Gets Built

**Backend Image**:
```
translato-backend:latest
├─ Python 3.11 slim (base)
├─ FastAPI + dependencies (from requirements.txt)
└─ Application code (backend/app/)
Total: ~400 MB
```

**Frontend Image**:
```
translato-frontend:latest
├─ nginx:alpine (5 MB)
└─ Built React app (dist/ - 2 MB)
Total: ~7 MB
```

### Container Communication

Docker Compose creates a network where containers can talk to each other using service names:

```
┌─────────────────────────────────────┐
│  frontend container                 │
│  - Can access backend via:          │
│    http://backend:8000              │
│  - Exposed on host: localhost:80    │
└─────────────────────────────────────┘
              │
              │ Internal network
              ▼
┌─────────────────────────────────────┐
│  backend container                  │
│  - Can be accessed via:             │
│    http://backend:8000 (internal)   │
│    http://localhost:8000 (host)     │
└─────────────────────────────────────┘
```

---

## Development Workflow

### Option 1: Hot Reload with Volumes (Recommended for Development)

Edit `docker-compose.yml` to add volume mounts:

```yaml
services:
  backend:
    volumes:
      - ./backend/app:/app/app  # Mount code directory
```

Now code changes reflect immediately without rebuild!

### Option 2: Rebuild on Changes

```bash
# Make code changes
# Rebuild and restart
docker-compose up --build
```

---

## Production Deployment

### On Your Raspberry Pi

1. **SSH into your Raspberry Pi**:
```bash
ssh pi@your-pi-ip
```

2. **Install Docker** (if not installed):
```bash
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
```

3. **Clone your repository**:
```bash
git clone https://github.com/pieterjanesp/Translato.git
cd Translato
```

4. **Create `.env` file**:
```bash
nano .env
# Add: ANTHROPIC_API_KEY=sk-your-key
```

5. **Run the application**:
```bash
docker-compose up -d
```

6. **Access from your network**:
```
http://raspberry-pi-ip
```

### Environment-Specific Configuration

Create different compose files for different environments:

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    restart: always  # Always restart in production

  frontend:
    build:
      context: ./frontend
    ports:
      - "80:80"
    restart: always
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Port Already in Use

If port 80 or 8000 is already in use:

**Option 1**: Stop the service using that port
**Option 2**: Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Frontend now on localhost:3000
  - "8080:8000"  # Backend now on localhost:8080
```

### Backend Can't Find API Key

**Check**:
```bash
docker-compose exec backend env | grep ANTHROPIC
```

Should show your API key. If not:
1. Ensure `.env` file exists in project root
2. Ensure it contains `ANTHROPIC_API_KEY=sk-...`
3. Restart containers: `docker-compose restart`

### Frontend Shows 404

**Cause**: nginx can't find built files.

**Fix**:
1. Rebuild frontend: `docker-compose build frontend`
2. Check nginx config is copied: `docker-compose exec frontend ls /etc/nginx/conf.d/`

### Can't Connect to Backend from Frontend

**Check backend is running**:
```bash
docker-compose ps
```

Both should show "Up".

**Check network**:
```bash
docker-compose exec frontend ping backend
```

Should respond. If not, recreate network:
```bash
docker-compose down
docker-compose up
```

### Out of Disk Space

**Check Docker disk usage**:
```bash
docker system df
```

**Clean up**:
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything not in use
docker system prune -a
```

---

## Advanced: Multi-Stage Build Inspection

### See Image Layers

```bash
docker history translato-frontend:latest
```

Shows each layer and its size.

### Dive into Image

```bash
# Install dive
brew install dive  # macOS
# or download from: https://github.com/wagoodman/dive

# Inspect image
dive translato-frontend:latest
```

Interactive tool to explore image layers and file changes.

---

## Next Steps

### Add Database (PostgreSQL)

Add to `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: translato
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/translato

volumes:
  postgres-data:
```

### Add Redis (for job queue)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Add Reverse Proxy (nginx)

For production, add an nginx reverse proxy to handle:
- SSL/TLS termination
- Load balancing
- Rate limiting
- Caching

---

## Summary

| Command | Purpose |
|---------|---------|
| `docker-compose build` | Build images |
| `docker-compose up` | Start containers |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | Follow logs |
| `docker-compose ps` | List running containers |
| `docker-compose exec <service> bash` | Open shell in container |

Your application is now containerized and ready to deploy anywhere Docker runs!
