# Production Deployment Guide

This guide explains how to deploy the pre-built Docker images to your Raspberry Pi.

---

## Prerequisites

- Docker and Docker Compose installed on Raspberry Pi
- Anthropic API key
- Network access to GitHub Container Registry

---

## Deployment Steps

### 1. SSH into Raspberry Pi

```bash
ssh pi@your-pi-ip
```

### 2. Navigate to Project Directory

```bash
cd ~/docker/Translato  # Or wherever you cloned the repo
```

### 3. Pull Latest Changes

```bash
git pull origin main
```

This updates `docker-compose.prod.yml` with the latest configuration.

### 4. Create Environment File

```bash
nano .env
```

Add your API key:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

### 5. Pull Pre-Built Images

```bash
# Pull latest images from GitHub Container Registry
docker-compose -f docker-compose.prod.yml pull
```

**What this does**:
- Downloads pre-built backend image (~400 MB)
- Downloads pre-built frontend image (~7 MB)
- Much faster than building on Pi!

### 6. Start Services

```bash
# Stop old containers if running
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test backend
curl http://localhost:8000/health

# Test frontend
curl http://localhost:5175
```

### 8. Access Your App

Open browser to: `http://100.100.46.36:5175`

---

## Updating to Latest Version

When you push new code to GitHub:

```bash
# 1. Pull latest config
git pull origin main

# 2. Pull latest images (built automatically by GitHub Actions)
docker-compose -f docker-compose.prod.yml pull

# 3. Restart containers
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
docker-compose -f docker-compose.prod.yml logs -f
```

**That's it!** No building on the Pi needed.

---

## Rolling Back to Previous Version

If the new version has issues:

```bash
# Find previous image version (commit SHA)
# Go to: https://github.com/pieterjanesp/Translato/packages

# Pull specific version
docker pull ghcr.io/pieterjanesp/translato-backend:<commit-sha>
docker pull ghcr.io/pieterjanesp/translato-frontend:<commit-sha>

# Update docker-compose.prod.yml to use that SHA
# Then restart
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Images Won't Pull

**Error**: `unauthorized: unauthenticated`

**Solution**: Images are public, but you might need to authenticate:

```bash
# Log in to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u pieterjanesp --password-stdin
```

Get a token at: https://github.com/settings/tokens

### Old Images Taking Space

```bash
# Remove unused images
docker image prune -a

# See what's using space
docker system df
```

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Common issues:
# - Missing ANTHROPIC_API_KEY in .env
# - Port 8000 or 5175 already in use
```

---

## Development vs Production

### Development (docker-compose.yml)
- Builds images locally from source
- Mounts code volumes for hot reload
- Use for local development on your Mac

### Production (docker-compose.prod.yml)
- Pulls pre-built images from registry
- No code volumes
- Faster deployment
- Use on Raspberry Pi

---

## Auto-Deploy with GitHub Actions (Future Enhancement)

You can add automatic deployment to the CI/CD pipeline:

```yaml
# In .github/workflows/ci.yml (future)
deploy:
  needs: build-and-push
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Raspberry Pi
      run: |
        ssh pi@raspberry-pi "cd ~/docker/Translato && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
```

This would automatically deploy every time you push to `main`!

---

## Summary

**Current Workflow**:
1. You push code to GitHub
2. GitHub Actions builds Docker images
3. You SSH to Pi and pull images
4. Restart containers

**Future Workflow** (with auto-deploy):
1. You push code to GitHub
2. Everything else happens automatically!
