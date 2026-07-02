# Perionyx

**Enterprise Treasury Operating System** — multi-tenant treasury and financial operations infrastructure with ledger-backed wallets, bank connectivity, policy engine, risk monitoring, and notifications.

## Quick Start (Docker)

```bash
docker compose up -d
```

Open **http://localhost:3000**, create an account, and start managing treasury operations. The demo mode seeds realistic data without needing a real bank connection.

## Features

| Area | Capabilities |
|---|---|
| **Treasury Accounts** | Multi-currency accounts with controls, deposits, internal transfers |
| **Bank Connectivity** | Plaid integration for linking real bank accounts, syncing balances & transactions |
| **Wallets & Ledger** | Double-entry accounting with DEBIT/CREDIT per transaction |
| **Reconciliation** | Run reconciliation, track exceptions, generate reports |
| **Policy Engine** | Configurable approval rules, compliance checks, test results |
| **Risk Monitoring** | Automated alerts, incident tracking, severity-based triage |
| **Notifications** | In-app bell, email (SMTP), Slack webhook — per-event-type preferences |
| **Connectors** | Run external sync jobs with event logging and failure tracking |
| **Calendar** | Schedule reconciliations, audits, settlement reviews |
| **Command Center** | Executive dashboard with 6 widgets: accounts, approvals, risk, health |
| **Audit Logs** | Immutable event trail for compliance and operational review |
| **RBAC** | Role-based access control with granular permissions |
| **Demo Mode** | "Try Demo" on sign-in — pre-seeded data, no account required |

## Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js route handlers, Auth.js / NextAuth, Prisma ORM
- **Database**: PostgreSQL 16
- **Integrations**: Plaid (banking), SMTP (email), Slack webhooks
- **Auth**: Credentials (bcrypt), OAuth-ready via Auth.js

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment
cp .env.example .env
# Edit .env — set at least DATABASE_URL and AUTH_SECRET

# 3. Apply migrations
npm run db:migrate

# 4. Start dev server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | Auth.js secret |
| `PLAID_CLIENT_ID` | ❌ | Plaid client ID |
| `PLAID_SECRET` | ❌ | Plaid secret (sandbox/dev/prod) |
| `PLAID_ENV` | ❌ | Plaid environment (`sandbox`/`development`/`production`) |
| `SMTP_HOST` | ❌ | SMTP server for email notifications |
| `SMTP_PORT` | ❌ | SMTP port |
| `SMTP_USER` | ❌ | SMTP username |
| `SMTP_PASS` | ❌ | SMTP password |
| `SMTP_FROM` | ❌ | From address for notification emails |
| `CRON_SECRET` | ❌ | Protects `/api/v1/tick` from public access |

All integrations gracefully fall back to mock/dev mode when credentials are absent.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript compiler check |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:push` | Push schema without migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

### One-Command Deploy

```bash
docker compose up -d --build
```

This starts PostgreSQL + the Perionyx app on port 3000 with automatic migration on startup.

## Architecture

### Tenant Isolation

Every resource is scoped to a `companyId`. Users belong to companies via `CompanyMembership`. All API routes use `requireTenantContext` which validates the active company from the session.

### Ledger System

Transactions use double-entry: each transaction has DEBIT and CREDIT ledger entries across wallets. The `TransactionTimeline` shows 7 lifecycle states from `PENDING` to `SETTLED`.

### RBAC

Roles (`OWNER` / `ADMIN` / `TREASURER` / `MEMBER` / `VIEWER`) with granular permissions per resource. New companies get default roles and permissions seeded automatically.

## Automation (Tick Engine)

Perionyx has a built-in maintenance endpoint at `GET /api/v1/tick` that runs automatically:

| Task | What it does |
|---|---|
| **Approval escalation** | Escalates approvals pending > 24h to the next level |
| **Approval timeout** | Auto-rejects transactions pending > 72h, cancels the transaction |
| **Plaid balance sync** | Syncs balances for bank accounts not updated in > 4h |
| **Scheduled reconciliations** | Fires notifications for calendar reconciliation events due today |

### Setup (free, 2 min)

1. Set `CRON_SECRET` in your `.env` to a random string
2. Go to [cron-job.org](https://cron-job.org) (free)
3. Create a job:
   - **URL**: `https://your-domain.com/api/v1/tick`
   - **Method**: GET
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Interval**: Every 5 minutes

No Redis, no queues, no containers. Just one endpoint.

## API

Internal API routes at `/api/v1/`:

- `/api/v1/treasury/accounts` — CRUD treasury accounts, deposits, transfers
- `/api/v1/plaid/*` — Link bank accounts, sync balances/transactions
- `/api/v1/notifications/*` — List, mark read, configure preferences
- `/api/v1/risk/*` — Alerts and incidents
- `/api/v1/policies/*` — Policy engine
- `/api/v1/reconciliation/*` — Reconciliation runs
- `/api/v1/connectors/*` — Connector configs and runs
- `/api/v1/calendar/*` — Calendar events
- `/api/v1/audit-logs` — Audit trail
- `/api/v1/rbac/*` — Roles and permissions

## License

Private — internal use.
