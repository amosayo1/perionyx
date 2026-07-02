# PERIONYX

Enterprise Treasury Operating System.

## Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── (shell)/                  # Authenticated routes
│   │   ├── accounts/             # Treasury accounts
│   │   ├── approvals/            # Approval workflows
│   │   ├── audit-logs/           # Audit trail
│   │   ├── calendar/             # Treasury calendar
│   │   ├── connectors/           # External connectors
│   │   ├── copilot/              # AI Copilot
│   │   ├── dashboard/            # Main overview
│   │   ├── developer/            # Developer portal
│   │   ├── insights/             # Executive insights
│   │   ├── integrations/         # Integration hub
│   │   ├── ledger/               # General ledger
│   │   ├── notifications/        # Notification center
│   │   ├── operations/           # Operations center + incidents
│   │   ├── platform/             # Platform health
│   │   ├── policies/             # Policy engine
│   │   ├── reconciliation/       # Reconciliation engine
│   │   ├── reports/              # Reports & analytics
│   │   ├── risk/                 # Operational risk
│   │   ├── risk-intelligence/    # Strategic risk analytics
│   │   ├── settings/             # Account settings
│   │   ├── transactions/         # Transaction management
│   │   └── wallets/              # Wallet management
│   ├── privacy/                  # Privacy policy
│   ├── security/                 # Security practices
│   ├── status/                   # System status
│   ├── terms/                    # Terms of service
│   ├── layout.tsx                # Root layout + providers
│   ├── error.tsx                 # Global error boundary
│   └── not-found.tsx             # 404 page
├── components/                   # React components
│   ├── ui/                       # Primitive UI components
│   ├── data-table/               # Reusable data table
│   ├── dashboard/                # Dashboard components
│   ├── workflow/                 # Workflow visualization
│   ├── copilot/                  # Copilot workspace
│   ├── incidents/                # Incident management
│   ├── insights/                 # Executive insights
│   ├── platform/                 # Platform health
│   ├── integrations/             # Integration hub
│   ├── developer/                # Developer portal
│   ├── reports/                  # Reports & analytics
│   ├── risk-intelligence/        # Risk intelligence
│   └── operations/               # Operations center
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities and helpers
└── styles/                       # Global styles
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Key Patterns

- **Server Components by default** — client boundaries only where interactivity required
- **Additive architecture** — new workspaces never modify existing modules
- **Typed demo data** — each workspace has `types.ts` + `data.ts` for isolated development
- **Consistent glassmorphism** — dark zinc palette with emerald accents

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
```

## Workspace Convention

Each workspace follows:

```
src/app/(shell)/<workspace>/
├── page.tsx          # Server component entry point
├── loading.tsx       # Loading skeleton
└── error.tsx         # Error boundary (optional)

src/components/<workspace>/
├── types.ts          # TypeScript interfaces
├── data.ts           # Demo data
└── *.tsx             # Components
```
