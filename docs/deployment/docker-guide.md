# Docker Deployment Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Development Docker Setup](#development-docker-setup)
2. [Production Docker Setup](#production-docker-setup)
3. [Docker Compose Configuration](#docker-compose-configuration)
4. [Health Checks](#health-checks)
5. [Volume Management](#volume-management)
6. [Environment Variables](#environment-variables)
7. [Multi-Stage Builds](#multi-stage-builds)

---

## Development Docker Setup

### Prerequisites

- Docker Engine 24+
- Docker Compose v2 (included with Docker Desktop)
- Git

### Quick Start

```bash
# Clone and enter directory
git clone https://github.com/organization/perionyx.git
cd perionyx

# Copy environment template
cp .env.example .env.local

# Generate development secrets
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env.local

# Start development environment
docker compose -f docker/development/docker-compose.yml up -d

# View logs
docker compose -f docker/development/docker-compose.yml logs -f app

# Access at http://localhost:3000
```

### Development Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  App        │  │  PostgreSQL │  │  Redis      │
│  :3000      │  │  :5432      │  │  :6379      │
│  hot-reload │  │  data       │  │  data       │
└─────────────┘  └─────────────┘  └─────────────┘
     ▲                 ▲               ▲
     └─────────────────┴───────────────┘
                 Docker Network
```

### Development Dockerfile

```dockerfile
# docker/development/Dockerfile
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --dev
RUN pnpm install --offline --frozen-lockfile

FROM node:22-alpine AS dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "dev"]
```

### Development docker-compose.yml

```yaml
# docker/development/docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: ../..
      dockerfile: docker/development/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://perionyx:perionyx@db:5432/perionyx
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
    env_file:
      - ../../.env.local
    volumes:
      - ../../src:/app/src
      - ../../public:/app/public
      - /app/node_modules
      - /app/.next
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=perionyx
      - POSTGRES_PASSWORD=perionyx
      - POSTGRES_DB=perionyx
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U perionyx"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

---

## Production Docker Setup

### Production Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  App        │  │  App        │  │  App        │
│  :3000      │  │  :3000      │  │  :3000      │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
               ┌────────▼────────┐
               │  Load Balancer  │
               │  (nginx/ALB)    │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │   External      │
               │   Network       │
               └─────────────────┘
```

### Production Dockerfile

```dockerfile
# Dockerfile (root level — used for production builds)
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --prod
RUN pnpm install --offline --frozen-lockfile

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm prisma generate
RUN pnpm build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 perionyx
RUN adduser --system --uid 1001 perionyx

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

RUN chown -R perionyx:perionyx /app

USER perionyx
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/enterprise/health || exit 1

CMD ["node", "server.js"]
```

### Production docker-compose.yml

```yaml
# docker-compose.yml (root level)
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: ghcr.io/organization/perionyx:${VERSION:-latest}
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DATABASE_URL_DIRECT=${DATABASE_URL_DIRECT}
      - AUTH_SECRET=${AUTH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - REDIS_URL=${REDIS_URL:-redis://redis:6379}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: "4G"
        reservations:
          cpus: "0.5"
          memory: "1G"

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=perionyx
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=perionyx
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U perionyx"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: "2G"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
    driver: local
    driver_opts:
      type: none
      device: /data/perionyx/postgres
      o: bind
  redisdata:
    driver: local
    driver_opts:
      type: none
      device: /data/perionyx/redis
      o: bind
```

### Production Entrypoint Script

```bash
#!/bin/sh
# docker-entrypoint.sh

set -e

echo "=== Perionyx Production Entrypoint ==="

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting application..."
exec node server.js
```

---

## Docker Compose Configuration

### Service Dependencies

```
app → db (healthy) → PostgreSQL ready
app → redis (started) → Redis available
```

### Network Configuration

```yaml
networks:
  perionyx:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Resource Constraints

| Service | CPU Limit | Memory Limit | CPU Reservation | Memory Reservation |
|---|---|---|---|---|
| app | 2 cores | 4 GB | 0.5 cores | 1 GB |
| db | 2 cores | 2 GB | 0.5 cores | 1 GB |
| redis | 1 core | 512 MB | 0.25 cores | 256 MB |

### Logging Configuration

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # Rotate at 10MB
    max-file: "3"      # Keep 3 rotated files
    tag: "{{.Name}}/{{.ID}}"
```

### Restart Policy

```yaml
restart: unless-stopped  # Always restart unless manually stopped
```

---

## Health Checks

### Application Health

The production Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/enterprise/health || exit 1
```

### Database Health

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U perionyx"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

### Redis Health

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 3s
  retries: 5
```

### Custom Health Check Script

```bash
#!/bin/bash
# healthcheck.sh — Comprehensive container health check

check_db() {
  pg_isready -h db -U perionyx -q
  return $?
}

check_redis() {
  redis-cli -h redis ping > /dev/null 2>&1
  return $?
}

check_app() {
  curl -sf http://localhost:3000/api/v1/enterprise/health > /dev/null 2>&1
  return $?
}

# Run all checks
check_db || exit 1
check_redis || exit 1
check_app || exit 1

echo "All health checks passed"
exit 0
```

---

## Volume Management

### Named Volumes

```yaml
volumes:
  pgdata:
    driver: local
    driver_opts:
      type: none
      device: /data/perionyx/postgres
      o: bind

  redisdata:
    driver: local
    driver_opts:
      type: none
      device: /data/perionyx/redis
      o: bind
```

### Bind Mounts (Development)

```yaml
volumes:
  - ../../src:/app/src            # Live code reload
  - ../../public:/app/public      # Static assets
  - /app/node_modules             # Anonymous volume (prevents overwrite)
  - /app/.next                    # Anonymous volume (prevents overwrite)
```

### Volume Backup

```bash
#!/bin/bash
# backup-volumes.sh

BACKUP_DIR="/backups/volumes"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL data
docker run --rm \
  -v perionyx_pgdata:/source:ro \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/pgdata-${TIMESTAMP}.tar.gz -C /source .

# Backup Redis data
docker run --rm \
  -v perionyx_redisdata:/source:ro \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/redisdata-${TIMESTAMP}.tar.gz -C /source .

echo "Volumes backed up to ${BACKUP_DIR}"
```

### Volume Restore

```bash
#!/bin/bash
# restore-volume.sh

BACKUP_FILE=$1
VOLUME_NAME=$2

docker run --rm \
  -v ${VOLUME_NAME}:/target \
  -v $(dirname ${BACKUP_FILE}):/backup:ro \
  alpine tar xzf /backup/$(basename ${BACKUP_FILE}) -C /target

echo "Volume ${VOLUME_NAME} restored from ${BACKUP_FILE}"
```

### Cleanup Unused Volumes

```bash
# Remove unused volumes (Docker)
docker volume prune -f

# Remove specific volume
docker volume rm perionyx_pgdata
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db:5432/perionyx` |
| `DATABASE_URL_DIRECT` | Direct connection (bypass pooler) | `postgresql://user:pass@db:5432/perionyx?direct=true` |
| `AUTH_SECRET` | NextAuth.js secret | `base64-64-char-string` |
| `ENCRYPTION_KEY` | AES-256 encryption key | `hex-64-char-string` |
| `NEXTAUTH_URL` | Public-facing URL | `https://app.perionyx.com` |

### Optional Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://redis:6379` | Redis connection |
| `LOG_LEVEL` | `info` | Logging level (trace/debug/info/warn/error) |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |
| `PORT` | `3000` | Application port |
| `HOSTNAME` | `0.0.0.0` | Application bind address |
| `SENTRY_DSN` | — | Sentry error tracking DSN |
| `SMTP_HOST` | — | SMTP server for email |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password |

### .env.production Example

```env
# Database
DATABASE_URL=postgresql://perionyx:${DB_PASSWORD}@db:5432/perionyx
DATABASE_URL_DIRECT=postgresql://perionyx:${DB_PASSWORD}@db:5432/perionyx

# Authentication
AUTH_SECRET=${AUTH_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
NEXTAUTH_URL=https://app.perionyx.com

# Cache
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=${SENTRY_DSN}

# Email
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
```

### Secrets via Docker Secrets

```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - db_password
      - auth_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  auth_secret:
    file: ./secrets/auth_secret.txt
```

---

## Multi-Stage Builds

### Build Stages

```
Stage 1: deps
  - Base: node:22-alpine
  - Install production dependencies
  - Output: /app/node_modules

Stage 2: builder
  - Base: node:22-alpine
  - Copy node_modules from deps
  - Build application (prisma generate + next build)
  - Output: /app/.next/standalone, /app/public

Stage 3: runner
  - Base: node:22-alpine (distroless-like)
  - Copy build output from builder
  - Create non-root user
  - Run application
  - Output: Running container
```

### Build Commands

```bash
# Development build
docker compose -f docker/development/docker-compose.yml build

# Production build
docker build -t ghcr.io/organization/perionyx:latest .

# Build with specific version tag
docker build -t ghcr.io/organization/perionyx:v1.0.0 .

# Build without cache
docker build --no-cache -t ghcr.io/organization/perionyx:latest .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/organization/perionyx:latest \
  --push .
```

### Build Optimization

```dockerfile
# .dockerignore
node_modules
.next
.git
.gitignore
.env
.env.*
*.md
coverage
test
tests
e2e
docker
k8s
docs
*.log
.DS_Store
```

### Image Size Targets

| Stage | Target Size | Current Size |
|---|---|---|
| deps | < 500 MB | 420 MB |
| builder | < 2 GB | 1.5 GB |
| runner | < 200 MB | 185 MB |

### Security Scanning

```bash
# Scan built image
docker scan ghcr.io/organization/perionyx:latest

# Trivy scan (CI/CD)
trivy image ghcr.io/organization/perionyx:latest \
  --severity HIGH,CRITICAL \
  --exit-code 1 \
  --ignore-unfixed
```

### Image Publishing

```bash
# Tag and push to registry
docker tag perionyx:latest ghcr.io/organization/perionyx:v1.0.0
docker push ghcr.io/organization/perionyx:v1.0.0

# Push multiple tags
docker tag perionyx:latest ghcr.io/organization/perionyx:latest
docker push ghcr.io/organization/perionyx:latest
docker push ghcr.io/organization/perionyx:v1.0.0
```
