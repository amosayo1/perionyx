# FX Rate Sync

Auto-syncs exchange rates from ExchangeRate.host. Falls back to hardcoded rates on provider failure — conversions never break.

## Config

Set `FX_API_KEY` for live rates. Without it, a mock provider with static fallback rates is used.

## Rate Resolution

1. Database rate (from sync or manual entry)
2. Inverse of a stored rate
3. Hardcoded fallback
4. Inverse fallback

Throws `ValidationError` if none exist.

## Worker

Runs every hour: fetch → validate → upsert → audit → health check (risk alert if 24h stale).

## Manual Sync

`POST /api/v1/fx/sync` (admin) or `/admin/fx` UI.

## API

- `GET /api/v1/fx/rates` — all synced rates
- `GET /api/v1/fx/status` — sync status + health

## Tests

```bash
npx vitest run test/fx.test.ts
```
