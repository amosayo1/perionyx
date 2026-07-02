# Perionyx — Sandbox Specification

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. Purpose

The Perionyx Sandbox provides a fully functional, pre-populated enterprise financial environment for evaluation, demonstration, training, and testing purposes. It is not a trial — it is a complete simulated company with financial data, users, transactions, approvals, policies, risk events, and intelligence.

---

## 2. Architecture

### 2.1 Sandbox Tenant

The sandbox operates as a standard multi-tenant company with the `sandbox` boolean flag set to `true` on the `Company` record. This flag triggers:

- Sandbox banner in the UI (`SandboxBanner` component)
- Simplified authentication (one-click login)
- Reset capability via `/api/v1/sandbox/reset`
- Protection against irreversible actions (configurable)

**Company Details**:
- **Name**: Atlas Manufacturing Group
- **Slug**: `atlas-manufacturing-group`
- **Industry**: Manufacturing
- **Employees**: 31 seeded users
- **Offices**: 18 global locations
- **Departments**: 20 functional departments
- **Currencies**: USD, EUR, GBP, AED, JPY, NGN, SGD, CNY

### 2.2 Guest Session

The sandbox uses a pre-seeded guest user account:

- **Email**: `sandbox-guest@perionyx.dev`
- **Password**: `sandbox-guest-pw`
- **Name**: Karim Al-Mansoori (CEO)
- **Role**: ADMIN on the sandbox company

The login flow is handled by `POST /api/auth/sandbox-login`:
1. Rate-limited (10 requests per 60 seconds per IP)
2. `ensureSandboxTenant()` checks/create the tenant
3. If the company exists but no license exists, the enterprise seed data is generated
4. If the company and license exist, the existing data is used
5. `signIn("credentials")` authenticates the guest user
6. Redirect to `/dashboard`

### 2.3 Seed Data

The enterprise seed (`src/modules/sandbox/sandbox-enterprise-seed.ts`) generates 1600+ lines of realistic data:

**Entities Created**:
- 1 Company with KYC verification
- 1 License (Enterprise, 500 seats)
- 12 Wallets (multi-currency: USD, EUR, GBP, AED)
- 10+ Treasury Accounts (global bank accounts)
- Account Controls (spending/velocity limits)
- 30+ Users with roles across 20 departments
- Exchange Rates (8 currencies, 56 pairs)
- Policies (6): transaction limits, compliance rules, dual approval, international transfer blocks, velocity limits, expense policies
- 60+ Transactions over 12 months with realistic metadata
- Corresponding Ledger Entries (double-entry)
- Approval chains for high-value transactions
- Risk Alerts: 20+ categorized alerts (balance anomalies, failed approvals, connector failures, policy violations, suspicious activity)
- Risk Incidents: grouped alerts with root cause and resolution
- Calendar Events: recurring financial events
- Audit Logs: complete event history
- Copilot Conversations: pre-seeded AI interactions
- Treasury Account Controls

**User Profiles (Key Personas)**:
| Name | Title | Department |
|------|-------|------------|
| Karim Al-Mansoori | CEO | Executive |
| Fatima Nasser | CFO | Finance |
| Omar Sulaiman | Group Treasurer | Treasury |
| Layla Hassan | Assistant Treasurer | Treasury |
| Aisha Bakari | Chief Risk Officer | Risk |
| Sanjay Patel | Head of Internal Audit | Audit |
| David Thompson | VP of Compliance | Compliance |
| Sarah Connor | VP of Sales | Sales |
| Mohammed Al-Rashid | VP of Manufacturing | Manufacturing |

### 2.4 Business Scenarios

The sandbox includes 5 pre-built business scenarios that transform the demo data to demonstrate specific capabilities:

**1. Treasury Surge Scenario**
- Injects 15 high-value international payments across USD, EUR, and GBP
- Creates corresponding approval requests
- Demonstrates multi-currency treasury management and approval workflows

**2. Compliance Breach Scenario**
- Generates policy violations and suspicious activity alerts
- Creates a risk incident with linked alerts
- Demonstrates risk detection, incident management, and audit trail

**3. Audit Readiness Scenario**
- Adds detailed ledgers and reconciliation records
- Generates comprehensive audit trail
- Demonstrates reconciliation and audit capabilities

**4. Liquidity Crisis Scenario**
- Creates balance anomalies and failed transactions
- Simulates a liquidity event across multiple wallets
- Demonstrates risk alerting and treasury response

**5. Connector Failure Scenario**
- Simulates Plaid connector failures
- Generates reconciliation exceptions
- Demonstrates connector health monitoring and exception handling

### 2.5 Simulation Engine

The simulation engine (`src/modules/sandbox/scenario/`) provides:

- **Scenario Definitions**: TypeScript types defining scenario structure (`Scenario`, `ScenarioAction`, `ScenarioEvent`)
- **Orchestration**: Sequential and parallel action execution with timing
- **Timeline**: Event scheduling with relative timestamps
- **Simulation Adapters**: Domain-specific adapters for creating transactions, alerts, incidents, and audit events
- **Reset System**: Complete cleanup and re-seeding capability

### 2.6 Reset System

`/api/v1/sandbox/reset` provides full sandbox reset:
1. Deletes all sandbox data for the company
2. Re-runs `ensureSandboxTenant()` with fresh seed
3. Returns the user to a clean state

The reset is idempotent — calling it multiple times produces the same result.

---

## 3. User Experience

### 3.1 Onboarding Flow

First-time sandbox users experience:

1. **Landing Page**: "Explore the Platform" button calls `POST /api/auth/sandbox-login`
2. **Welcome Modal** (`WelcomeModal`): Full-screen overlay with:
   - Company stats (3,248 employees, 18 countries, $185M/mo transaction volume)
   - Three entry paths: Guided Tour, Explore Freely, Business Scenario
3. **Guided Tour** (`GuidedTourOverlay`): 10-step structured journey:
   1. Dashboard — Financial overview
   2. Wallets — Multi-currency balances
   3. Payments — Transaction lifecycle
   4. Approvals — Approval workflow
   5. Risk — Risk monitoring
   6. Reconciliation — Balance verification
   7. Copilot — AI intelligence
   8. Audit — Compliance trail
   9. Scenarios — Business simulations
   10. Ready — Completion
4. **Mission Panel** (`MissionPanel`): Collapsible side panel with 10 missions including:
   - Create a transfer
   - Approve a pending transaction
   - Review a risk alert
   - Run reconciliation
   - Test a policy
   - Investigate a transaction
   - Generate a report
   - Connect a bank account
   - Ask Copilot a question
   - Complete a scenario
5. **Contextual Hints** (`ContextualHint`): Module-specific inline banners (8 hints):
   - Wallet management
   - Payment flow
   - Approval process
   - Risk monitoring
   - Reconciliation
   - Audit trail
   - Policies
   - Copilot
6. **Smart Recommendations** (`SmartRecommendation`): Inline "Recommended Next Steps" card showing 2 uncompleted tasks

### 3.2 Onboarding State Management

`OnboardingContext` (React context + localStorage) persists:
- Welcome modal dismissed state
- Tour progress (current step, completed)
- Persona selection
- Completed missions
- Dismissed hints

---

## 4. Copilot Integration

The sandbox seed data includes pre-seeded Copilot conversations. The AI copilot is aware of the sandbox context and can:

- Answer questions about the Atlas Manufacturing Group data
- Walk through financial scenarios
- Generate executive briefings based on sandbox data
- Investigate sandbox transactions
- Provide persona-adapted responses (CEO, CFO, Treasurer, etc.)

---

## 5. Investor Experience

The sandbox supports a "presentation mode" for investor demonstrations:

- Clean navigation without admin UI
- Focus mode on key metrics and capabilities
- Pre-built demo flows covering the complete platform

(Implementation: TBD — the architecture supports this through route grouping and component composition.)

---

## 6. Technical Implementation

### 6.1 Key Files

| File | Purpose |
|------|---------|
| `src/modules/sandbox/sandbox-context.ts` | Sandbox detection, cache, constants |
| `src/modules/sandbox/sandbox-seed.ts` | Tenant seeding with idempotency |
| `src/modules/sandbox/sandbox-enterprise-seed.ts` | Enterprise seed data generation |
| `src/modules/sandbox/sandbox-guard.ts` | Sandbox access control |
| `src/modules/sandbox/sandbox-reset.ts` | Sandbox reset logic |
| `src/modules/sandbox/simulation-flag.ts` | Simulation mode flag |
| `src/modules/sandbox/scenario/` | Business scenario orchestration |
| `src/components/sandbox/` | Sandbox UI components |
| `src/app/api/v1/sandbox/` | Sandbox API endpoints |
| `src/app/api/auth/sandbox-login/route.ts` | One-click login |

### 6.2 Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sandbox-login` | POST | One-click sandbox login |
| `/api/v1/sandbox/reset` | POST | Reset sandbox to clean state |
| `/api/v1/sandbox/scenarios` | GET | List available scenarios |
| `/api/v1/sandbox/scenarios` | POST | Create a custom scenario |
| `/api/v1/sandbox/scenarios/[id]/apply` | POST | Apply a scenario to sandbox |

---

## 7. Future Expansion

- **Multi-Company Sandbox**: Support for multiple simulated companies for consolidation demonstrations
- **Custom Scenarios**: User-defined scenarios through a scenario builder UI
- **Scenario Templates**: Pre-built industry-specific data packs (Fintech, SaaS, Manufacturing, etc.)
- **Data Export**: Export sandbox data for offline analysis
- **Collaborative Sandbox**: Multi-user sandbox sessions for team evaluations
- **Sandbox Comparison**: Side-by-side comparison of different scenario outcomes
- **Automated Testing**: Use sandbox as integration test environment for CI/CD
- **Scenario Recording**: Record user actions as reusable scenario scripts
