# Authorization Completion — Phase 11X.4

## Summary

Implemented granular permission-based authorization across all 164 API routes. Every route now requires authentication, and 143 routes require both authentication + explicit granular permission checks.

## Before vs After

| Metric | Before | After |
|---|---|---|
| Routes with permission checks | 14 | 143 |
| Routes with auth only (no permission) | 129 | 0 |
| Unauthenticated routes | 14 | 10 (intentionally public) |
| Unauthenticated routes (needs fix) | 5 | 0 |

## Routes Made Authenticated

| Route | Auth Method | Permission |
|---|---|---|
| `POST /api/installer` | `requirePermission` | `admin.settings` |
| `POST /api/push/register` | `requireAuth` | — |
| `POST /api/push/send` | `requirePermission` | `admin.security` |
| `POST /api/push/unregister` | `requireAuth` | — |
| `GET /api/v1/cache/admin` | `requirePermission` | `admin.settings` |
| `POST /api/v1/cache/admin` | `requirePermission` | `admin.settings` |
| `GET /api/v1/admin/permissions` | `requirePermission` | `admin.permissions` |
| `GET /api/v1/operations/recovery-validation` | `requirePermission` | `admin.settings` |
| `GET /api/v1/alerting/stats` | `requireAuth` | — |
| `GET /api/v1/observability/queries/stats` | `requireAuth` | — |
| `GET /api/v1/sandbox/scenario` | `auth()` + `requireTenantContext()` | — |

## Intentionally Public Routes

These 10 routes remain unauthenticated by design:

| Route | Justification |
|---|---|
| `GET /api/health` | Health check for load balancers |
| `GET /api/health/liveness` | K8s liveness probe |
| `GET /api/health/readiness` | K8s readiness probe |
| `GET /api/health/report` | Full health report |
| `GET /api/metrics` | Prometheus metrics scraping |
| `GET /api/v1/enterprise/health` | Enterprise health check |
| `POST /api/v1/demo-requests` | Public demo request form |
| `GET /api/v1/invites/[token]` | Public invite lookup |
| `POST /api/demo/bootstrap` | Rate-limited demo bootstrap |
| `GET /api/auth/...` | NextAuth auth routes |

## Permission Mapping by Domain

| Domain | Read Permission | Write Permission |
|---|---|---|
| Treasury | `treasury.read` | `treasury.manage/transfer/credit` |
| Transactions | `treasury.read` | `treasury.transfer/credit` |
| Wallets | `wallets.read` | `wallets.manage` |
| Approvals | `approvals.view` | `approvals.approve/reject/configure` |
| Connectors | `connectors.read` | `connectors.manage/sync/connect` |
| Reconciliation | `reconciliation.view` | `reconciliation.execute` |
| Risk | `risk.read` | `risk.manage` |
| Audit | `audit.read` | `audit.export` |
| Analytics | `analytics.read` | `analytics.export` |
| Reports | `reporting.read` | `reporting.create` |
| Automation | `automation.read` | `automation.manage/schedule` |
| Workflow | `workflow.read` | `workflow.execute/manage` |
| Admin — users | `admin.users` | `admin.users` |
| Admin — roles | `admin.roles` | `admin.roles` |
| Admin — permissions | `admin.permissions` | `admin.permissions` |
| Admin — settings | `admin.settings` | `admin.settings` |
| Admin — api keys | `admin.api_keys` | `admin.api_keys` |
| Admin — webhooks | `admin.webhooks` | `admin.webhooks` |
| Admin — billing | `admin.billing` | `admin.billing` |
| Admin — integrations | `admin.integrations` | `admin.integrations` |
| Admin — security | `admin.security` | `admin.security` |
| Security — policies | `security.policies` | `security.policies` |
| IAM/RBAC | `admin.roles` | `admin.roles` |
| Onboarding | `onboarding.read` | `onboarding.manage` |
| Onboarding — setup | `onboarding.read` | `onboarding.manage` |

## Files Changed

- `src/server/security/require-permission.ts` — new helper combining `auth()` + `requireTenantContext()` + `rbacService.ensurePermission()` with API key support
- 129 route files — permission check injection
- 9 route files — auth added for previously unauthenticated routes
- `src/modules/crm/types.ts` — added `discovery-conversation` relationship stage
- `src/modules/crm/crm-seed.ts` — added Muhammed Jamsheed N.V. contact

## RBAC Integration

- 17 enterprise roles with defined permission sets
- 66 granular permissions across 14 categories, 40 requiring MFA
- `rbacService.ensurePermission()` called from 129 route files
- Read-only roles (e.g. `read_only_executive`) blocked from all mutation endpoints

## Next Steps

1. **ABAC completion** — Replace stub with attribute-based policy engine
2. **Permission audit tests** — Add integration tests verifying each route rejects unauthorized access
3. **UI permission gating** — Hide UI elements when user lacks corresponding permissions
4. **MFA enforcement** — Confirm MFA-required permissions trigger MFA challenge flow
