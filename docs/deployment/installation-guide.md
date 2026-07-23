# Installation Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Fresh Installation](#fresh-installation)
4. [Upgrade Installation](#upgrade-installation)
5. [Repair Installation](#repair-installation)
6. [Validation-Only Mode](#validation-only-mode)
7. [Installation Wizard Walkthrough](#installation-wizard-walkthrough)
8. [CLI Installation](#cli-installation)
9. [Post-Installation Verification](#post-installation-verification)

---

## System Requirements

### Minimum Requirements (Development)

| Resource | Requirement |
|---|---|
| CPU | 2 cores, 2.0 GHz |
| RAM | 4 GB |
| Disk | 20 GB SSD |
| OS | macOS 14+, Ubuntu 22.04+, Windows 11+ (WSL2) |
| Node.js | 20.x LTS |
| Package Manager | pnpm 9.x |
| Database | PostgreSQL 16 |
| Cache (optional) | Redis 7.x |

### Recommended Requirements (Production)

| Resource | Requirement |
|---|---|
| CPU | 8+ cores, 3.0 GHz |
| RAM | 16 GB minimum, 32 GB recommended |
| Disk | 100 GB SSD (gp3 or better) |
| OS | Ubuntu 24.04 LTS or RHEL 9 |
| Node.js | 22.x LTS (current) |
| Package Manager | pnpm 9.x |
| Database | PostgreSQL 16 with 2+ read replicas |
| Cache | Redis 7.x (cluster mode for HA) |
| Storage | S3-compatible object storage |
| Network | 1 Gbps internal, TLS 1.3 external |

### Supported Browsers

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

---

## Prerequisites

### 1. System Packages

```bash
# Ubuntu / Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential postgresql-16 redis-server

# RHEL / Rocky / Alma
sudo dnf install -y curl git gcc-c++ make postgresql16-server redis

# macOS (Homebrew)
brew install node@22 pnpm postgresql@16 redis
```

### 2. Node.js

```bash
# Install using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm alias default 22
node --version  # v22.x.x
```

### 3. pnpm

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm --version  # 9.x.x
```

### 4. PostgreSQL 16

```bash
# Verify installation
psql --version  # psql (PostgreSQL) 16.x

# Create database and user
sudo -u postgres psql -c "CREATE USER perionyx WITH PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "CREATE DATABASE perionyx OWNER perionyx;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE perionyx TO perionyx;"
```

### 5. Redis 7

```bash
# Verify installation
redis-server --version  # Redis server v=7.x

# Start Redis
sudo systemctl enable --now redis-server
redis-cli ping  # PONG
```

### 6. Environment Variables

```bash
# Clone the repository
git clone https://github.com/organization/perionyx.git
cd perionyx

# Copy environment template
cp .env.example .env.local

# Generate required secrets
openssl rand -base64 32  # AUTH_SECRET
openssl rand -hex 32     # ENCRYPTION_KEY
```

Key environment variables:

| Variable | Required | Description | Default |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://perionyx:pass@localhost:5432/perionyx` |
| `AUTH_SECRET` | Yes | NextAuth.js secret (64 chars base64) | — |
| `ENCRYPTION_KEY` | Yes | AES-256 encryption key (64 hex chars) | — |
| `NEXTAUTH_URL` | Yes | Public-facing app URL | `http://localhost:3000` |
| `REDIS_URL` | No | Redis connection string | `redis://localhost:6379` |
| `LOG_LEVEL` | No | Logging verbosity | `info` |

### 7. Verify All Prerequisites

```bash
# Run the built-in validator
node scripts/validate-prerequisites.js

# Manual verification
echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "Postgres: $(psql --version)"
echo "Redis: $(redis-server --version)"
echo "Git: $(git --version)"
```

---

## Fresh Installation

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Generate Prisma Client

```bash
pnpm prisma generate
```

### Step 3: Run Database Migrations

```bash
pnpm prisma migrate deploy
```

### Step 4: Seed Initial Data (Optional)

```bash
pnpm prisma db seed
```

The seed script creates:
- Default admin user (email: admin@perionyx.com, password set via `ADMIN_SEED_PASSWORD`)
- Default organization
- Base permissions and roles
- Sample treasury data (in development mode)

### Step 5: Build the Application

```bash
pnpm build
```

### Step 6: Start the Application

```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

### Step 7: Verify Installation

```bash
curl http://localhost:3000/api/v1/enterprise/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "ok", "latency_ms": 3 },
    "redis": { "status": "ok", "latency_ms": 1 },
    "queue": { "status": "ok", "active_workers": 4 },
    "memory": { "status": "ok", "used_mb": 128 }
  }
}
```

---

## Upgrade Installation

See the [Upgrade Guide](./upgrade-guide.md) for detailed upgrade procedures. A condensed summary:

```bash
# 1. Backup current database
pg_dump -Fc perionyx > backups/pre-upgrade-$(date +%Y%m%d).dump

# 2. Backup .env.local
cp .env.local .env.local.backup-$(date +%Y%m%d)

# 3. Pull latest code
git fetch origin
git checkout v1.1.0  # target version tag

# 4. Install new dependencies
pnpm install

# 5. Run new migrations
pnpm prisma migrate deploy

# 6. Rebuild
pnpm build

# 7. Restart
pnpm start
```

---

## Repair Installation

Use the repair installation when the application is in an inconsistent state but the database is intact.

### Step 1: Verify File Integrity

```bash
# Check for missing or corrupted files
git status
git fsck --full

# Restore any missing files
git checkout -- .
```

### Step 2: Reinstall Dependencies

```bash
rm -rf node_modules
pnpm store prune
pnpm install
```

### Step 3: Regenerate Prisma Client

```bash
pnpm prisma generate
pnpm prisma validate
```

### Step 4: Verify Database Schema

```bash
# Ensure migrations match the database
pnpm prisma migrate status

# If migrations are out of sync:
pnpm prisma migrate deploy
```

### Step 5: Rebuild and Restart

```bash
rm -rf .next
pnpm build
pnpm start
```

### When Repair Is Not Enough

If the repair installation fails:
1. Perform a [full fresh installation](#fresh-installation) with data restoration
2. See the [Disaster Recovery](./disaster-recovery.md) guide
3. Contact support with the output of `pnpm run diagnose`

---

## Validation-Only Mode

Validation-only mode checks all system components without modifying any state. It is useful for pre-flight checks before installation, upgrades, or maintenance windows.

### Invocation

```bash
# Full validation
pnpm run validate

# Specific component validation
pnpm run validate:env
pnpm run validate:database
pnpm run validate:redis
pnpm run validate:queue
pnpm run validate:storage
```

### What Validation Checks

| Check | Description | Failure Action |
|---|---|---|
| Environment Variables | All required vars present, valid format | Halt with error message |
| Database Connectivity | TCP connection, auth, schema version | Warning if optional; halt if required |
| Redis Connectivity | TCP connection, ping response | Warning only; graceful fallback |
| Queue Worker | PgBoss schema exists, worker initializes | Warning; queues fall back to in-memory |
| Storage | Object storage endpoint reachable | Warning; exports fall back to local |
| File Permissions | `.next/`, `node_modules/`, `public/` writable | Halt |
| Disk Space | Available space > 1 GB | Warning |
| Memory | Available RAM > 512 MB | Warning |
| Node Version | >= 20.x | Halt |
| Prisma Schema | Migrations up to date | Halt |

### Exit Codes

| Code | Meaning |
|---|---|
| 0 | All checks passed |
| 1 | Critical check failed — do not proceed |
| 2 | Warning(s) only — proceed with caution |
| 3 | Configuration error — check `.env.local` |

---

## Installation Wizard Walkthrough

The installation wizard provides an interactive CLI experience for guided setup.

### Starting the Wizard

```bash
pnpm run install:wizard
```

### Wizard Steps

#### Step 1: Welcome & Prerequisites Check
- Displays system information
- Runs automated prerequisite validation
- Highlights any missing requirements with resolution instructions

#### Step 2: Database Configuration
- Prompts for PostgreSQL connection details
- Tests connectivity with provided credentials
- Offers to create the database if it does not exist
- Runs initial migration

#### Step 3: Redis Configuration
- Prompts for Redis connection details (or skip for in-memory only)
- Tests connectivity
- Configures cache TTL tiers

#### Step 4: Encryption Keys
- Generates `AUTH_SECRET` and `ENCRYPTION_KEY`
- Saves to `.env.local`
- Prompts for backup of generated keys

#### Step 5: Admin Account Setup
- Prompts for admin email and password
- Validates password strength (minimum 12 characters, complexity requirements)
- Creates initial admin user

#### Step 6: Organization Setup
- Prompts for organization name, tax ID, currency
- Configures default fiscal year

#### Step 7: Feature Selection
- Enables/disables optional modules (AI, advanced analytics, connectors)
- Configures rate limits and throttle thresholds

#### Step 8: Summary & Installation
- Displays configuration summary
- Confirms to proceed
- Runs full installation (deps, build, migrate, seed)
- Reports success or failure details

#### Step 9: Post-Install Checklist
- Guides through verification steps
- Opens health dashboard
- Provides next steps documentation links

### Wizard Configuration File

The wizard can be automated using a configuration file:

```bash
pnpm run install:wizard --config ./install-config.json
```

Example `install-config.json`:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "perionyx",
    "user": "perionyx",
    "password": "${DB_PASSWORD_ENV}"
  },
  "redis": {
    "host": "localhost",
    "port": 6379
  },
  "admin": {
    "email": "admin@company.com",
    "password": "${ADMIN_PASSWORD_ENV}"
  },
  "organization": {
    "name": "Acme Corp",
    "currency": "USD",
    "fiscalYearStart": "2026-01-01"
  },
  "features": {
    "ai": true,
    "analytics": true,
    "connectors": true
  }
}
```

---

## CLI Installation

The CLI installation is designed for automated and scripted deployments (CI/CD, infrastructure-as-code).

### Non-Interactive Mode

```bash
# Environment-based installation
export DATABASE_URL="postgresql://perionyx:pass@db:5432/perionyx"
export AUTH_SECRET="$(openssl rand -base64 32)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"

pnpm run install:cli -- --non-interactive \
  --admin-email admin@company.com \
  --admin-password "$ADMIN_PASSWORD" \
  --org-name "Acme Corp" \
  --org-currency USD
```

### Available CLI Flags

| Flag | Description | Default |
|---|---|---|
| `--non-interactive` | Skip all prompts | `false` |
| `--admin-email` | Admin user email | — |
| `--admin-password` | Admin user password | — |
| `--org-name` | Organization name | — |
| `--org-currency` | Base currency | `USD` |
| `--db-host` | Database host | `localhost` |
| `--db-port` | Database port | `5432` |
| `--db-name` | Database name | `perionyx` |
| `--db-user` | Database user | `perionyx` |
| `--db-password` | Database password | — |
| `--redis-host` | Redis host | `localhost` |
| `--redis-port` | Redis port | `6379` |
| `--skip-redis` | Skip Redis configuration | `false` |
| `--skip-seed` | Skip data seeding | `false` |
| `--env-file` | Path to environment file | `.env.local` |
| `--config` | Path to JSON config file | — |
| `--verbose` | Verbose output | `false` |

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml (excerpt)
- name: Install Perionyx
  run: |
    pnpm run install:cli --non-interactive \
      --db-host ${{ secrets.DB_HOST }} \
      --db-password ${{ secrets.DB_PASSWORD }} \
      --admin-password ${{ secrets.ADMIN_PASSWORD }}
```

---

## Post-Installation Verification

### Health Check Endpoint

```bash
curl -s https://app.perionyx.com/api/v1/enterprise/health | jq .
```

### Component Verification

| Component | Verification Command | Expected Result |
|---|---|---|
| Application | `curl -s -o /dev/null -w "%{http_code}" https://app.perionyx.com` | `200` |
| Database | `psql -c "SELECT 1" -d perionyx` | `1 row` |
| Redis | `redis-cli ping` | `PONG` |
| Queue | `curl -s https://app.perionyx.com/api/metrics \| grep queue_active` | numeric value > 0 |
| Auth | `curl -s -X POST https://app.perionyx.com/api/auth/signin \| grep -i csrf` | CSRF token present |
| API | `curl -s https://app.perionyx.com/api/v1/enterprise/health \| jq .status` | `"healthy"` |

### Log Verification

```bash
# Check application logs for startup completion
tail -f .next/server/apps/logs/app.log
# Expected: "Perionyx v1.0.0 started successfully"

# Check for errors
grep -i error .next/server/apps/logs/app.log
```

### Browser Verification

1. Navigate to `https://app.perionyx.com`
2. Verify login page loads without errors
3. Sign in with admin credentials
4. Verify dashboard renders with correct data
5. Test key workflows:
   - Create a transaction
   - View approval queue
   - Generate a report
   - Verify user management

### Automated Smoke Tests

```bash
# Run post-installation smoke tests
pnpm run test:smoke

# Run end-to-end tests
pnpm run test:e2e
```

### Performance Baseline

Record baseline metrics for future comparison:

```bash
# API response times
curl -w "Connect: %{time_connect}s, TTFB: %{time_starttransfer}s, Total: %{time_total}s\n" \
  -o /dev/null -s https://app.perionyx.com/api/v1/enterprise/health

# Page load time (Chrome DevTools Protocol)
pnpm run perf:baseline
```

### Certificate of Installation Completion

After successful installation, generate a completion certificate:

```bash
pnpm run install:certificate
```

This produces `installation-certificate-v1.0.0.json` containing:
- Install timestamp
- Version deployed
- Environment details
- Component checksums
- Health check results
- Operator signature
