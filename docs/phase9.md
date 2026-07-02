# Phase 9 — External Connectors & Settlement

This document describes the Phase 9 design and runbook for external settlement connectors.

Components added:
- `ConnectorConfig` and `SettlementRecord` Prisma models (DB)
- Connectors manager: `src/modules/integrations/connectors/manager.ts`
- Connector interface and mock: `connector.interface.ts`, `mock-connector.ts`
- Admin API/UI to manage connectors: `src/app/api/v1/admin/connectors/route.ts`, `src/app/(shell)/admin/connectors/page.tsx`
- Settlement records viewer: admin deliveries UI (shared with webhooks) and `src/app/api/v1/admin/deliveries/route.ts`
- SecretStore abstraction: `src/modules/secrets/secret-store.ts` (file-backed demo store)

Runbook:
- To add a real connector, implement `Connector` interface and register in `ConnectorsManager.connectorForType`.
- Store sensitive credentials via a real secret manager (Vault); `FileSecretStore` is a demo fallback.
- CI: run migrations, seed, and tests. Worker can be run via `npx tsx src/scripts/webhook-worker.ts`.

Future work:
- Vault integration for secure credentials
- Connector adapters for ACH, SWIFT, or payment rails
- End-to-end integration tests in isolated environments
