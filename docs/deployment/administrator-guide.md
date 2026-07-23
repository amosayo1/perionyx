# Administrator Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [User Management](#user-management)
2. [Role-Based Access](#role-based-access)
3. [Security Configuration](#security-configuration)
4. [Audit Logging](#audit-logging)
5. [System Configuration](#system-configuration)
6. [Feature Flags](#feature-flags)
7. [Maintenance Tasks](#maintenance-tasks)

---

## User Management

### User Lifecycle

```
Provisioning → Active → Suspended → Terminated
                    ↓
               Password Reset
                    ↓
               Role Change
```

### Creating Users

```bash
# Create user via CLI
pnpm run admin:user:create \
  --email "user@company.com" \
  --name "John Doe" \
  --role "treasurer" \
  --organization "Acme Corp"

# Create user via API
curl -X POST https://app.perionyx.com/api/v1/admin/users \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "name": "John Doe",
    "role": "treasurer",
    "organizationId": "org_abc123"
  }'
```

### User Invitation Flow

```bash
# Invite a new user
pnpm run admin:user:invite \
  --email "newuser@company.com" \
  --role "analyst" \
  --message "Welcome to Perionyx — please complete your account setup"

# Check invitation status
pnpm run admin:user:invitation-status --email "newuser@company.com"

# Resend invitation
pnpm run admin:user:resend-invite --email "newuser@company.com"
```

### Bulk User Operations

```bash
# Import users from CSV
pnpm run admin:user:import --file users.csv

# CSV format:
# email,name,role,organization
# user1@co.com,User One,treasurer,Acme Corp
# user2@co.com,User Two,controller,Acme Corp

# Export users to CSV
pnpm run admin:user:export --format csv --output users-export.csv

# Deactivate expired users
pnpm run admin:user:deactivate-expired --days-inactive 90
```

### User Status Management

```bash
# Suspend user
pnpm run admin:user:suspend --user-id usr_abc123 --reason "Security concern"

# Reactivate user
pnpm run admin:user:reactivate --user-id usr_abc123

# Terminate user
pnpm run admin:user:terminate --user-id usr_abc123 --reason "Employee departed"
```

### Password Policies

Configured in `src/server/security/password-policy.ts`:

| Policy | Default | Description |
|---|---|---|
| Minimum length | 12 characters | Minimum password length |
| Complexity | uppercase + lowercase + digit + special | Required character types |
| History | 5 passwords | Prevent password reuse |
| Max age | 90 days | Force periodic rotation |
| Lockout threshold | 5 attempts | Lock account after failed attempts |
| Lockout duration | 30 minutes | Auto-unlock after duration |

```bash
# Reset user password
pnpm run admin:user:reset-password --user-id usr_abc123

# Force password change on next login
pnpm run admin:user:force-password-change --user-id usr_abc123

# Unlock user account
pnpm run admin:user:unlock --user-id usr_abc123
```

---

## Role-Based Access

### Built-in Roles

| Role | Scope | Description |
|---|---|---|
| `super_admin` | Global | Full system access, configuration, user management |
| `admin` | Organization | Organization-level administration |
| `cfo` | Organization | All financial data, reports, approvals |
| `treasurer` | Organization | Treasury operations, payments, cash management |
| `controller` | Organization | Financial controls, reconciliations, audit trails |
| `analyst` | Organization | Read-only access to data and reports |
| `auditor` | Organization | Read-only access with audit trail export |
| `viewer` | Organization | Dashboard and summary view only |

### Custom Roles

Roles are defined in `src/modules/iam/roles.ts`:

```typescript
// Example custom role definition
{
  name: "compliance_officer",
  displayName: "Compliance Officer",
  description: "Access to compliance and regulatory data",
  permissions: [
    "audit:read",
    "compliance:read",
    "reports:read",
    "alerts:read"
  ],
  inheritsFrom: ["viewer"]
}
```

```bash
# Create custom role
pnpm run admin:role:create \
  --name "compliance_officer" \
  --display-name "Compliance Officer" \
  --permissions "audit:read,compliance:read,reports:read"

# List all roles
pnpm run admin:role:list

# Assign role to user
pnpm run admin:role:assign --user-id usr_abc123 --role "compliance_officer"

# Remove role from user
pnpm run admin:role:remove --user-id usr_abc123 --role "compliance_officer"

# Clone role
pnpm run admin:role:clone --source-role "analyst" --new-role "senior_analyst"
```

### Permission Registry

Permissions are registered in `PermissionRegistry`:

| Permission | Description | Default Role |
|---|---|---|
| `users:read` | List and view users | admin, super_admin |
| `users:create` | Create new users | admin, super_admin |
| `users:update` | Modify user details | admin, super_admin |
| `users:delete` | Remove users | super_admin only |
| `roles:manage` | Create and modify roles | super_admin only |
| `treasury:read` | View treasury data | cfo, treasurer, controller, analyst |
| `treasury:write` | Create/edit treasury transactions | treasurer |
| `treasury:approve` | Approve treasury transactions | cfo, treasurer |
| `payments:read` | View payments | cfo, treasurer, controller |
| `payments:write` | Initiate payments | treasurer |
| `payments:approve` | Approve payments | cfo |
| `reports:read` | View reports | cfo, controller, analyst, auditor |
| `reports:export` | Export reports | cfo, auditor |
| `audit:read` | View audit logs | auditor, super_admin |
| `audit:export` | Export audit logs | auditor, super_admin |
| `settings:read` | View system settings | admin, super_admin |
| `settings:write` | Modify system settings | super_admin only |
| `connectors:manage` | Configure integrations | admin, super_admin |

### Permission Check Commands

```bash
# Check user permissions
pnpm run admin:user:permissions --user-id usr_abc123

# Check if user has specific permission
pnpm run admin:user:check-permission \
  --user-id usr_abc123 \
  --permission "treasury:approve"

# Audit trail of permission changes
pnpm run admin:audit:permission-changes --days 30
```

---

## Security Configuration

### Authentication Configuration

Configured in `src/server/security/auth.ts`:

```env
# Authentication settings
AUTH_PROVIDER=next-auth
AUTH_SESSION_MAX_AGE=86400           # 24 hours
AUTH_SESSION_UPDATE_AGE=3600         # Update session every hour
AUTH_CSRF_TOKEN_EXPIRY=3600          # CSRF token expiry

# Multi-factor authentication
MFA_ENABLED=true
MFA_ISSUER=Perionyx
MFA_ALGORITHM=TOTP
MFA_PERIOD=30                        # TOTP time step (seconds)

# Session configuration
SESSION_COOKIE_NAME=perionyx.session
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=lax
SESSION_COOKIE_HTTP_ONLY=true
```

### Multi-Factor Authentication

```bash
# Enable MFA for user
pnpm run admin:mfa:enable --user-id usr_abc123

# Disable MFA for user
pnpm run admin:mfa:disable --user-id usr_abc123

# Reset MFA device
pnpm run admin:mfa:reset --user-id usr_abc123

# Generate backup codes
pnpm run admin:mfa:backup-codes --user-id usr_abc123 --count 10
```

### SSO/SAML Configuration

```bash
# Configure SAML identity provider
pnpm run admin:saml:configure \
  --idp-metadata-url "https://company.okta.com/app/metadata" \
  --idp-entity-id "http://www.okta.com/entity-id" \
  --attribute-mapping "email=email,firstName=givenName,lastName=sn"

# Test SAML configuration
pnpm run admin:saml:test

# List SAML sessions
pnpm run admin:saml:sessions

# Force SAML re-authentication
pnpm run admin:saml:force-reauth --user-id usr_abc123
```

### IP Allowlisting

```bash
# Add IP to allowlist
pnpm run admin:security:allowlist-add \
  --cidr "10.0.0.0/8" \
  --description "Corporate VPN"

# Remove IP from allowlist
pnpm run admin:security:allowlist-remove \
  --cidr "10.0.0.0/8"

# List allowlist
pnpm run admin:security:allowlist-list

# Enable/disable allowlist enforcement
pnpm run admin:security:allowlist-enforce --enable true
```

### API Key Management

```bash
# Generate API key
pnpm run admin:api-key:generate \
  --name "Automation Service" \
  --permissions "treasury:read,payments:read" \
  --expires-in 365

# Output:
# API Key: pex_abc123def456...
# Secret: pex_sec_xyz789...

# List API keys
pnpm run admin:api-key:list

# Revoke API key
pnpm run admin:api-key:revoke --key-id key_abc123

# Rotate API key
pnpm run admin:api-key:rotate --key-id key_abc123
```

---

## Audit Logging

### Audit Log Configuration

Configured in `src/server/security/audit.ts`:

```env
# Audit logging configuration
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=365
AUDIT_LOG_SHIPPING_ENABLED=true
AUDIT_LOG_SHIPPING_ENDPOINT=https://logs.perionyx.com/audit
AUDIT_LOG_CONSOLE_OUTPUT=false
```

### Audit Events

| Category | Events | Retention |
|---|---|---|
| Authentication | login, logout, login_failed, mfa_enabled, mfa_disabled | 1 year |
| User Management | user_created, user_updated, user_deleted, role_assigned, role_removed | 1 year |
| Data Access | record_viewed, report_generated, data_exported | 90 days |
| Data Mutation | record_created, record_updated, record_deleted | 1 year |
| Configuration | settings_changed, feature_flag_toggled, security_config_updated | 1 year |
| Security | permission_changed, api_key_created, api_key_revoked, ip_blocked | 1 year |
| Financial | payment_initiated, payment_approved, payment_rejected, transfer_completed | 7 years |

### Querying Audit Logs

```bash
# Search audit logs (CLI)
pnpm run admin:audit:search \
  --event "user_created" \
  --from "2026-06-01" \
  --to "2026-07-12" \
  --limit 50

# Search audit logs (API)
curl -s "https://app.perionyx.com/api/v1/admin/audit-logs" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -G \
  --data-urlencode "event=payment_approved" \
  --data-urlencode "from=2026-06-01" \
  --data-urlencode "to=2026-07-12" \
  --data-urlencode "limit=100" | jq .

# View audit trail for specific record
pnpm run admin:audit:record-trail \
  --record-type "transaction" \
  --record-id "txn_abc123"

# Export audit logs
pnpm run admin:audit:export \
  --format csv \
  --from "2026-01-01" \
  --to "2026-07-12" \
  --output audit-export-2026.csv
```

### Audit Log Integrity

```bash
# Verify audit log integrity (check for tampering)
pnpm run admin:audit:verify-integrity \
  --from "2026-01-01" \
  --to "2026-07-12"

# Generate audit log hash chain report
pnpm run admin:audit:hash-chain \
  --date "2026-07-12"

# Archive audit logs
pnpm run admin:audit:archive \
  --before "2025-07-12" \
  --destination "s3://perionyx-audit-archive/"
```

### Compliance Reports

```bash
# Generate SOC 2 audit report
pnpm run admin:compliance:report --standard soc2 --period Q2-2026

# Generate GDPR data access report
pnpm run admin:compliance:gdpr-report --user-id usr_abc123

# Export all user data (GDPR data portability)
pnpm run admin:compliance:export-user-data --user-id usr_abc123
```

---

## System Configuration

### Configuration Management

System settings are stored in the database and can be managed via:

```bash
# List all configuration settings
pnpm run admin:config:list

# Get specific setting
pnpm run admin:config:get --key "treasury.default_currency"

# Set configuration value
pnpm run admin:config:set \
  --key "treasury.default_currency" \
  --value "EUR"

# Reset configuration to default
pnpm run admin:config:reset --key "treasury.default_currency"

# Export all configuration
pnpm run admin:config:export --output config-export.json

# Import configuration
pnpm run admin:config:import --file config-export.json
```

### Configuration Categories

| Category | Key Prefix | Example | Description |
|---|---|---|---|
| General | `general.*` | `general.platform_name` | Platform-wide settings |
| Treasury | `treasury.*` | `treasury.default_currency` | Treasury module defaults |
| Payments | `payments.*` | `payments.max_amount` | Payment limits and rules |
| Approvals | `approvals.*` | `approvals.auto_approve_limit` | Approval workflow config |
| Reports | `reports.*` | `reports.max_export_rows` | Report generation limits |
| Security | `security.*` | `security.password_min_length` | Security policy settings |
| Notifications | `notifications.*` | `notifications.email_from` | Email/Slack notification config |
| Integrations | `integrations.*` | `integrations.webhook_retry_count` | Third-party integration config |

### Configuration Change Workflow

```bash
# 1. Preview configuration change
pnpm run admin:config:preview \
  --key "payments.max_amount" \
  --value "1000000"

# 2. Review impact analysis (shows affected users/policies)
pnpm run admin:config:impact \
  --key "payments.max_amount" \
  --value "1000000"

# 3. Schedule configuration change
pnpm run admin:config:schedule \
  --key "payments.max_amount" \
  --value "1000000" \
  --at "2026-07-15T02:00:00Z"

# 4. Apply immediately with audit record
pnpm run admin:config:set \
  --key "payments.max_amount" \
  --value "1000000" \
  --reason "Increased limit for new enterprise customer"
```

### Environment-Specific Configuration

```env
# Production overrides
production:
  general.log_level: "warn"
  security.rate_limit_enabled: true
  security.rate_limit_requests: 1000
  reports.max_export_rows: 100000

# Staging overrides
staging:
  general.log_level: "debug"
  security.rate_limit_enabled: false
  integrations.webhook_endpoint: "https://webhook.staging.perionyx.com"
```

---

## Feature Flags

### Feature Flag Management

```bash
# List all feature flags
pnpm run admin:feature:list

# Enable a feature flag
pnpm run admin:feature:enable \
  --flag "new_approval_flow" \
  --reason "Rolling out to all users after successful beta"

# Disable a feature flag
pnpm run admin:feature:disable \
  --flag "new_approval_flow" \
  --reason "Reverting due to performance concerns"

# Enable for specific users/orgs (canary)
pnpm run admin:feature:enable-for \
  --flag "new_approval_flow" \
  --org-id "org_abc123"
```

### Feature Flag Definitions

```typescript
// src/modules/feature-flags/flags.ts
export const FEATURE_FLAGS = {
  new_approval_flow: {
    name: "New Approval Flow",
    description: "Enhanced approval workflow with parallel approvals",
    category: "workflow",
    owner: "engineering-approvals",
    defaultState: false,
    rolloutPercentage: 0,
    dependencies: [],
    expiresAt: "2026-10-01",
  },
  ai_powered_insights: {
    name: "AI-Powered Insights",
    description: "AI-driven financial insights and recommendations",
    category: "analytics",
    owner: "engineering-ai",
    defaultState: false,
    rolloutPercentage: 10,
    dependencies: ["analytics_enhancements"],
    expiresAt: null,
  },
  analytics_enhancements: {
    name: "Analytics Enhancements",
    description: "Enhanced analytics dashboard with drill-down",
    category: "analytics",
    owner: "engineering-analytics",
    defaultState: true,
    rolloutPercentage: 100,
    dependencies: [],
    expiresAt: null,
  },
  international_payments: {
    name: "International Payments",
    description: "SWIFT and cross-border payment support",
    category: "payments",
    owner: "engineering-payments",
    defaultState: false,
    rolloutPercentage: 0,
    dependencies: ["fx_module"],
    expiresAt: null,
  },
};
```

### Feature Flag States

| State | Description | Criteria |
|---|---|---|
| `disabled` | Feature completely off | Default for new features |
| `internal` | Available to internal users only | Testing in production |
| `beta` | Available to opted-in users | Limited rollout |
| `canary` | Available to specific orgs/users | Gradual rollout |
| `enabled` | Available to all users | General availability |
| `deprecated` | Scheduled for removal | Migration period |
| `removed` | Feature code cleaned up | No longer available |

### Canary Rollout Procedure

```bash
# 1. Enable for internal users
pnpm run admin:feature:enable-for \
  --flag "new_approval_flow" \
  --user-group "internal"

# 2. Monitor for 24 hours
pnpm run admin:feature:metrics --flag "new_approval_flow"

# 3. Enable for 10% of users
pnpm run admin:feature:rollout \
  --flag "new_approval_flow" \
  --percentage 10

# 4. Monitor for 48 hours, check if metrics meet goals

# 5. Gradual increase: 25% → 50% → 100%

# 6. Full enablement
pnpm run admin:feature:enable \
  --flag "new_approval_flow" \
  --reason "Full rollout completed"
```

### Feature Flag Metrics

```bash
# Get adoption metrics for a feature flag
pnpm run admin:feature:metrics --flag "new_approval_flow"
# Output:
# Total users exposed: 1,234
# Active users: 456 (37%)
# Usage count (7d): 12,345
# Error rate: 0.02%
# Avg completion time: 2.3s
# User satisfaction score: 4.5/5

# Compare metrics between enabled and disabled groups
pnpm run admin:feature:a-b-test \
  --flag "new_approval_flow" \
  --metric "approval_completion_time"
```

---

## Maintenance Tasks

### Scheduled Maintenance

| Task | Frequency | Duration | Impact | Procedure |
|---|---|---|---|---|
| Database VACUUM | Weekly (off-peak) | 5-30 min | Minimal | `pnpm run db:vacuum` |
| Database ANALYZE | Weekly (off-peak) | 1-5 min | None | `pnpm run db:analyze` |
| Index maintenance | Monthly | 10-60 min | Read-only degredation | `pnpm run db:reindex` |
| Log rotation | Daily | < 1 min | None | logrotate (automatic) |
| SSL renewal | Every 90 days | 5 min | None | certbot renew |
| OS security patches | Monthly | Reboot required | Downtime window | vendor tooling |
| Cache warmup | On deploy | 5-10 min | None | `pnpm run cache:warm` |
| Data archiving | Quarterly | 30-60 min | Minimal | `pnpm run db:archive` |

### Database Maintenance

```bash
# Vacuum (reclaim storage)
pnpm run db:vacuum

# Analyze (update statistics)
pnpm run db:analyze

# Reindex (rebuild indexes)
pnpm run db:reindex --concurrently

# Check table bloat
pnpm run db:bloat-report

# Archive old data (move to archive tables)
pnpm run db:archive \
  --table "audit_logs" \
  --before "2025-07-12" \
  --archive-table "audit_logs_archive"

# Generate database health report
pnpm run db:health-report
```

### Cache Management

```bash
# Clear entire cache
pnpm run cache:clear

# Invalidate specific cache namespace
pnpm run cache:invalidate --namespace treasury

# Warm critical caches
pnpm run cache:warm

# View cache statistics
pnpm run cache:stats
# Output:
# Cache Provider: redis (primary), memory (fallback)
# Hit ratio: 94.2%
# Memory usage: 1.2 GB / 4 GB
# Keys: 12,345
# Evictions (24h): 5
```

### Queue Management

```bash
# Check queue status
pnpm run queue:status
# Output:
# Queue: default — 0 waiting, 2 active, 0 failed
# Queue: notifications — 45 waiting, 1 active, 3 failed
# Queue: sync — 0 waiting, 0 active, 0 failed

# View failed jobs
pnpm run queue:failed --queue notifications

# Retry failed jobs
pnpm run queue:retry --queue notifications --limit 50

# Purge completed jobs
pnpm run queue:purge --queue notifications --before "2026-06-12"

# Pause/resume queue
pnpm run queue:pause --queue sync
pnpm run queue:resume --queue sync

# Add maintenance job
pnpm run queue:schedule \
  --queue maintenance \
  --task "db:vacuum" \
  --cron "0 2 * * 0"
```

### SSL/TLS Certificate Management

```bash
# Check certificate expiration
pnpm run cert:check
# Output:
# app.perionyx.com: expires 2026-10-10 (90 days remaining)
# api.perionyx.com: expires 2026-10-10 (90 days remaining)

# Renew certificates (Let's Encrypt)
pnpm run cert:renew

# Verify certificate chain
pnpm run cert:verify --domain app.perionyx.com

# Upload custom certificate
pnpm run cert:upload \
  --domain app.perionyx.com \
  --cert /path/to/cert.pem \
  --key /path/to/key.pem \
  --chain /path/to/chain.pem
```

### Health Check & Diagnostics

```bash
# Full system diagnostic
pnpm run admin:diagnostic:full

# Network diagnostic
pnpm run admin:diagnostic:network

# Database diagnostic
pnpm run admin:diagnostic:database

# Performance diagnostic
pnpm run admin:diagnostic:performance

# Generate diagnostic report
pnpm run admin:diagnostic:report --output /tmp/diagnostic-report.json
```

### Maintenance Mode

```bash
# Enable maintenance mode
pnpm run admin:maintenance:enable \
  --message "System upgrade in progress — expected downtime: 15 minutes" \
  --estimated-duration 15

# Check if maintenance mode is active
pnpm run admin:maintenance:status

# Schedule maintenance window
pnpm run admin:maintenance:schedule \
  --at "2026-07-15T02:00:00Z" \
  --duration 30 \
  --message "Quarterly database maintenance"

# Disable maintenance mode
pnpm run admin:maintenance:disable
```

### Release Management

```bash
# View pending releases
pnpm run admin:release:pending

# Schedule a release
pnpm run admin:release:schedule \
  --version "v1.1.0" \
  --at "2026-07-20T02:00:00Z" \
  --notes "See CHANGELOG.md for details"

# Approve a release
pnpm run admin:release:approve --version "v1.1.0"

# Rollback a release
pnpm run admin:release:rollback --version "v1.1.0"

# View release history
pnpm run admin:release:history --limit 10
```

### Operational Reporting

```bash
# Generate weekly operations report
pnpm run admin:report:weekly

# Generate monthly uptime report
pnpm run admin:report:uptime --month 2026-06

# Generate SLA compliance report
pnpm run admin:report:sla --period "2026-Q2"

# Generate audit summary
pnpm run admin:report:audit-summary --period "2026-Q2"

# Email report to stakeholders
pnpm run admin:report:email \
  --report weekly \
  --recipients "ops-team@company.com,cfo@company.com"
```
