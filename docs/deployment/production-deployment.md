# Production Deployment Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Environment Preparation](#environment-preparation)
2. [Security Hardening](#security-hardening)
3. [Database Setup and Tuning](#database-setup-and-tuning)
4. [Redis Configuration](#redis-configuration)
5. [Storage Configuration](#storage-configuration)
6. [Load Balancing](#load-balancing)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup Configuration](#backup-configuration)

---

## Environment Preparation

### Infrastructure as Code

All production infrastructure should be managed through IaC. The project provides Terraform modules and Pulumi scripts in the `infrastructure/` directory.

### Network Architecture

```
Internet
    │
    ▼
CloudFront / CDN (TLS termination, caching)
    │
    ▼
WAF (rate limiting, IP filtering, SQL injection prevention)
    │
    ▼
Load Balancer (ALB / GCP HTTP LB / nginx)
    │
    ├── App Pods (private subnet)
    │   ├── 10.0.1.0/24 - us-east-1a
    │   ├── 10.0.2.0/24 - us-east-1b
    │   └── 10.0.3.0/24 - us-east-1c
    │
    ├── PostgreSQL (private subnet, multi-AZ)
    │   └── 10.0.10.0/24
    │
    └── Redis (private subnet, cluster mode)
        └── 10.0.20.0/24
```

### Instance Sizing

| Environment | Instance Type | vCPU | RAM | Disk | Min/Max Pods |
|---|---|---|---|---|---|
| Staging | `t3.large` | 2 | 8 GB | 50 GB gp3 | 1/2 |
| Production | `r6g.large` | 2 | 16 GB | 100 GB gp3 | 3/10 |
| Production (peak) | `r6g.xlarge` | 4 | 32 GB | 200 GB gp3 | 5/20 |

### Operating System Hardening

```bash
# Apply security updates
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH (restrict to bastion IP)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 80/tcp   # HTTP redirect
sudo ufw enable

# Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Set kernel parameters
cat <<EOF | sudo tee /etc/sysctl.d/99-perionyx.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
vm.swappiness = 10
vm.max_map_count = 262144
EOF
sudo sysctl -p /etc/sysctl.d/99-perionyx.conf
```

---

## Security Hardening

### Content Security Policy

Configure CSP headers in the application or at the reverse proxy level:

```nginx
# nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'strict-dynamic' 'nonce-${request_id}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.perionyx.com;
  connect-src 'self' https://api.perionyx.com wss://app.perionyx.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
" always;
```

### HTTP Security Headers

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "0" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### Secrets Management

| Secret | Storage | Rotation |
|---|---|---|
| `DATABASE_URL` | AWS Secrets Manager / Vault | Every 90 days |
| `AUTH_SECRET` | AWS Secrets Manager / Vault | Every 180 days |
| `ENCRYPTION_KEY` | AWS Secrets Manager / Vault | Every 180 days |
| `ENCRYPTION_KEY_PREVIOUS` | AWS Secrets Manager / Vault | During key rotation |
| AI API Keys | AWS Secrets Manager / Vault | Every 90 days |
| SMTP Credentials | AWS Secrets Manager / Vault | Every 90 days |

### Encryption at Rest

- **Database**: AWS RDS encryption at rest (AES-256)
- **Redis**: Encryption at rest (AES-256)
- **Object Storage**: Server-side encryption (SSE-S3 or SSE-KMS)
- **Application**: AES-256-GCM for sensitive fields (via `src/server/security/`)

### Encryption in Transit

- TLS 1.3 minimum for all external endpoints
- TLS 1.2 minimum for internal service communication
- mTLS between application pods (service mesh optional)
- VPC endpoints for AWS services

### Network Security

- All application pods in private subnets
- Database accessed only through private endpoint
- Redis accessed only through private endpoint
- Bastion host for SSH access (audited, temporary credentials)
- Security groups restrict traffic to minimum required ports
- AWS WAF or equivalent for L7 protection

### Rate Limiting

Configured in `src/server/security/rate-limit.ts`:

| Endpoint Category | Rate Limit | Burst |
|---|---|---|
| Authentication | 10 requests/min per IP | 20 |
| Password Reset | 3 requests/hour per email | 5 |
| API (authenticated) | 1000 requests/min per user | 2000 |
| AI endpoints | 30 requests/min per user | 50 |
| Public endpoints | 100 requests/min per IP | 200 |

### Audit Logging

All security-relevant events are logged to both the application audit log and a separate secure log stream:

```bash
# Audit log location
/var/log/perionyx/audit.log

# Included events
- Authentication (success, failure, lockout)
- Authorization (permission denied, role change)
- Data mutations (create, update, delete)
- Configuration changes
- Key rotation events
- Backup and restore operations
```

---

## Database Setup and Tuning

### PostgreSQL Configuration

Production `postgresql.conf` tuning parameters:

```ini
# Memory
shared_buffers = '4GB'                    # 25% of RAM
effective_cache_size = '12GB'             # 75% of RAM
work_mem = '64MB'                         # per-operation sort memory
maintenance_work_mem = '1GB'              # for VACUUM, index creation
wal_buffers = '64MB'

# Connections
max_connections = 200
superuser_reserved_connections = 10
statement_timeout = '30s'
idle_in_transaction_session_timeout = '5min'

# Write Ahead Log
wal_level = replica
wal_log_hints = on
wal_compression = zstd
min_wal_size = '4GB'
max_wal_size = '16GB'

# Query Planning
random_page_cost = 1.1                    # for SSD storage
effective_io_concurrency = 200
default_statistics_target = 500

# Autovacuum
autovacuum_vacuum_scale_factor = 0.01
autovacuum_analyze_scale_factor = 0.005
autovacuum_vacuum_cost_limit = 2000
autovacuum_naptime = '30s'

# Parallelism
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
parallel_tuple_cost = 0.01
parallel_setup_cost = 100

# Replication (if using streaming replica)
max_wal_senders = 10
max_replication_slots = 10
hot_standby = on
hot_standby_feedback = on
```

### Database Connection Pooling

Use PgBouncer for connection pooling in production:

```ini
[databases]
perionyx = host=localhost port=5432 dbname=perionyx

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 500
default_pool_size = 50
reserve_pool_size = 10
reserve_pool_timeout = 5.0
server_idle_timeout = 300
query_timeout = 30
```

### Read Replicas

For read-heavy workloads, configure read replicas:

```bash
# Prisma configuration (src/server/persistence/datasource.ts)
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")        # Primary (writes)
  directUrl  = env("DATABASE_URL_DIRECT") # Connection pooler
}

# Add replica URL
# DATABASE_REPLICA_URL = "postgresql://user:pass@replica-host:5432/perionyx"
```

### Migration Safety

```bash
# Deploy migrations (safe, only applies pending)
pnpm prisma migrate deploy

# Create a new migration (development only)
pnpm prisma migrate dev --name migration_name

# Check migration status
pnpm prisma migrate status
```

Migration best practices:
- Always test migrations on staging first
- Avoid `ALTER COLUMN ... TYPE` on large tables (use `USING` clause with index)
- Use `CONCURRENTLY` for index creation in production
- Run migrations during maintenance windows for schema changes
- Keep migrations small and reversible

---

## Redis Configuration

### Production Settings

```conf
# /etc/redis/redis.conf
port 6379
bind 0.0.0.0
protected-mode yes
requiremasterauth your-redis-password
requirepass your-redis-password

# Persistence
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes

# Memory management
maxmemory 4gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Networking
timeout 300
tcp-keepalive 300
tcp-backlog 511

# Replication (if using cluster)
replica-read-only yes
repl-diskless-sync yes
repl-backlog-size 100mb

# Security
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command SHUTDOWN "SHUTDOWN_PERIONYX"
```

### Redis Cluster (Multi-Node)

For high availability, use Redis Cluster with at least 3 master nodes:

```bash
# Create cluster (6 nodes: 3 masters, 3 replicas)
redis-cli --cluster create \
  10.0.20.10:6379 10.0.20.11:6379 10.0.20.12:6379 \
  10.0.20.20:6379 10.0.20.21:6379 10.0.20.22:6379 \
  --cluster-replicas 1
```

### Application Configuration

```env
# Cache configuration (src/server/persistence/config.ts)
CACHE_PROVIDER=redis
REDIS_HOST=10.0.20.10
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_CLUSTER_MODE=true
```

---

## Storage Configuration

### Object Storage (S3-Compatible)

```env
# Storage configuration
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET=perionyx-production
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
```

### Storage Buckets

| Bucket | Purpose | Retention | Encryption |
|---|---|---|---|
| `perionyx-{env}-exports` | Report exports, data dumps | 30 days | SSE-S3 |
| `perionyx-{env}-backups` | Database backups | 90 days | SSE-KMS |
| `perionyx-{env}-uploads` | User-uploaded files | Indefinite | SSE-KMS |
| `perionyx-{env}-logs` | Application logs | 30 days | SSE-S3 |

### Lifecycle Policies

```json
{
  "Rules": [
    {
      "Id": "expire-exports",
      "Status": "Enabled",
      "Prefix": "exports/",
      "Expiration": { "Days": 30 }
    },
    {
      "Id": "backup-tiering",
      "Status": "Enabled",
      "Prefix": "backups/daily/",
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}
```

### Local Storage (Fallback)

When object storage is unavailable, the application falls back to local disk:

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=/var/lib/perionyx/storage
```

---

## Load Balancing

### nginx Configuration (Self-Hosted)

```nginx
upstream perionyx_app {
    least_conn;
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name app.perionyx.com;

    ssl_certificate /etc/ssl/certs/perionyx.crt;
    ssl_certificate_key /etc/ssl/private/perionyx.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    gzip_min_length 1000;
    gzip_vary on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Application proxy
    location / {
        proxy_pass http://perionyx_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # Stale-while-revalidate for static assets
        location /_next/static {
            expires 365d;
            add_header Cache-Control "public, immutable, stale-while-revalidate=86400";
        }
    }

    # Health checks
    location /health {
        access_log off;
        return 200 "OK";
    }
}

server {
    listen 80;
    server_name app.perionyx.com;
    return 301 https://$host$request_uri;
}
```

### AWS ALB Configuration

```
Listener: HTTPS (443) → Forward to target group
Target Group: perionyx-app
  - Port: 3000
  - Protocol: HTTP
  - Health Check: /api/v1/enterprise/health
  - Healthy threshold: 2
  - Unhealthy threshold: 3
  - Interval: 30s
  - Timeout: 5s
Sticky Sessions: Off (stateless application)
```

### Health Check Endpoint

The application exposes an enhanced health endpoint:

```
GET /api/v1/enterprise/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "ok", "latency_ms": 3 },
    "redis": { "status": "ok", "latency_ms": 1 },
    "queue": { "status": "ok", "active_workers": 4 },
    "memory": { "status": "warning", "used_mb": 1536, "limit_mb": 2048 },
    "disk": { "status": "ok", "used_percent": 45 }
  },
  "uptime_seconds": 86400,
  "timestamp": "2026-07-12T10:00:00Z"
}
```

---

## SSL/TLS Setup

### Certificate Acquisition

```bash
# Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.perionyx.com

# Verify renewal
sudo certbot renew --dry-run
```

### AWS Certificate Manager (ACM)

For AWS deployments, use ACM provisioned certificates:

```bash
# Request certificate (via AWS CLI)
aws acm request-certificate \
  --domain-name app.perionyx.com \
  --validation-method DNS \
  --subject-alternative-names *.perionyx.com

# Check validation status
aws acm describe-certificate --certificate-arn arn:aws:acm:...
```

### Mutual TLS (mTLS)

For internal service-to-service communication:

```bash
# Generate CA and certificates
openssl req -new -x509 -days 3650 -nodes -out ca.crt -keyout ca.key
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
```

---

## Monitoring Setup

### Prometheus Metrics

The application exposes metrics at `/api/metrics`:

| Metric | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | method, path, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, path | Request latency |
| `db_query_duration_seconds` | Histogram | operation, table | Database query latency |
| `db_connections_active` | Gauge | pool | Active database connections |
| `redis_hit_ratio` | Gauge | — | Cache hit ratio (0-1) |
| `queue_jobs_total` | Counter | queue, status | Queue job count |
| `queue_active_workers` | Gauge | queue | Active queue workers |
| `memory_used_bytes` | Gauge | — | Process memory usage |
| `cpu_usage_percent` | Gauge | — | CPU usage percentage |

### Grafana Dashboards

Pre-built Grafana dashboards are available in `src/server/observability/dashboards/`:

| Dashboard | Description |
|---|---|
| `perionyx-overview.json` | High-level system overview |
| `perionyx-database.json` | Database performance metrics |
| `perionyx-queue.json` | Queue worker performance |
| `perionyx-cache.json` | Cache hit/miss ratios |
| `perionyx-business.json` | Business transaction metrics |

### Alert Rules

Configured in `src/server/observability/alerts/`:

| Alert Rule | Condition | Severity | Notification |
|---|---|---|---|
| `HighErrorRate` | Error rate > 5% over 5 minutes | Critical | PagerDuty + Slack |
| `HighLatency` | P95 latency > 2s over 5 minutes | Critical | PagerDuty + Slack |
| `DatabaseDown` | DB health check fails 3 consecutive attempts | Critical | PagerDuty + Slack |
| `RedisDown` | Redis health check fails (graceful) | Warning | Slack |
| `DiskSpaceLow` | Disk usage > 85% | Warning | Slack |
| `QueueBacklog` | Jobs waiting > 1000 for 5 minutes | Warning | Slack |
| `CertificateExpiring` | SSL cert expires in < 30 days | Warning | Email |

### Log Aggregation

```bash
# Application logs (structured JSON)
/var/log/perionyx/app.log
/var/log/perionyx/audit.log
/var/log/perionyx/access.log

# Shipping to log aggregator (fluentd config example)
<source>
  @type tail
  path /var/log/perionyx/*.log
  pos_file /var/log/td-agent/perionyx.log.pos
  tag perionyx.*
  format json
</source>

<match perionyx.**>
  @type s3
  s3_bucket perionyx-production-logs
  s3_region us-east-1
  path logs/
  buffer_path /var/log/td-agent/buffer
</match>
```

---

## Backup Configuration

### Database Backups

```bash
# /etc/cron.d/perionyx-backup

# Daily backup at 2 AM
0 2 * * * root /usr/local/bin/perionyx-backup daily

# Weekly full backup at 3 AM Sunday
0 3 * * 0 root /usr/local/bin/perionyx-backup weekly

# Monthly archive at 4 AM on 1st
0 4 1 * * root /usr/local/bin/perionyx-backup monthly
```

Backup script location: `scripts/backup.sh`

### Backup Retention

| Backup Type | Frequency | Retention | Storage |
|---|---|---|---|
| Daily | Every day | 30 days | S3 Standard |
| Weekly | Every Sunday | 12 weeks | S3 Standard-IA |
| Monthly | 1st of month | 12 months | S3 Glacier |
| Pre-upgrade | Before each deployment | Until next upgrade | S3 Standard |

### Application Configuration Backup

```bash
# Backup environment and config
tar czf /backups/config/perionyx-config-$(date +%Y%m%d).tar.gz \
  /etc/perionyx/ \
  /var/lib/perionyx/storage/ \
  --exclude='*.log'
```

### Verification

```bash
# List backups
aws s3 ls s3://perionyx-production-backups/backups/daily/

# Verify backup integrity
pg_restore --list s3://perionyx-production-backups/backups/daily/20260712.dump | head -20

# Test restore (staging environment)
/usr/local/bin/perionyx-restore --env staging --backup daily-20260712
```
