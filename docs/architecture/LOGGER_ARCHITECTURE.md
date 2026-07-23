# Logger Architecture — Unified Logging via Pino

> **Purpose**: Single source of truth for logging across the platform.
> **Established**: Phase 18.1B (2026-07-21)

---

## Single Implementation

**Pino v10.3.1** at `src/lib/logger.ts` (13 lines).

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino/file", options: { destination: 1 } }
      : undefined,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.secret"],
    censor: "[REDACTED]",
  },
});
```

### Import Path

```typescript
import { logger } from "@/lib/logger";
```

**All files must import from `@/lib/logger`.** No other import path is authoritative.

---

## Configuration

| Setting | Value | Source |
|---|---|---|
| Log level | `info` (prod), `debug` (dev) | `LOG_LEVEL` env var |
| Transport (dev) | `pino/file` → stdout | `pino/file` target |
| Transport (prod) | Raw JSON to stdout | `undefined` transport |
| Redaction paths | `req.headers.authorization`, `req.headers.cookie`, `body.password`, `body.secret` | Hardcoded |
| Redaction censor | `[REDACTED]` | Hardcoded |

### Redaction Details

Pino's redaction engine processes log output **before serialization**. The following fields are always censored:

| Path | What it catches | Risk if logged |
|---|---|---|
| `req.headers.authorization` | Bearer tokens, API keys | Account takeover, API abuse |
| `req.headers.cookie` | Session cookies | Session hijacking |
| `body.password` | User passwords | Credential exposure |
| `body.secret` | API secrets, encryption keys | Key compromise |

**StructuredLogger had ZERO redaction.** All fields were logged as-is via `console.log`. This was a security liability.

---

## Consumers

### Files Importing from `@/lib/logger` (72 files)

| Category | Count | Examples |
|---|---|---|
| API routes | 35+ | All `src/app/api/` handlers |
| Services | 20+ | `rbac.service.ts`, `notifications.service.ts`, `queue.service.ts` |
| Infrastructure | 10+ | `handle-route.ts`, `correlation.ts`, `health-checks.ts`, `otel.ts` |
| Modules | 5+ | `automation-studio.service.ts`, `agent-service.ts` |

### Previously Using StructuredLogger (7 files — now migrated)

| File | Before | After |
|---|---|---|
| `src/server/observability/correlation.ts` | `import { logger } from "./logger"` | `import { logger } from "@/lib/logger"` |
| `src/server/observability/health-checks.ts` | `import { logger } from "./logger"` | `import { logger } from "@/lib/logger"` |
| `src/server/observability/metrics.ts` | `import { logger } from "./logger"` | `import { logger } from "@/lib/logger"` |
| `src/server/observability/alerting.ts` | `import { logger } from "./logger"` | `import { logger } from "@/lib/logger"` |
| `src/server/observability/otel.ts` | Already correct | No change |
| `src/server/http/handle-route.ts` | `import { logger } from "./logger"` | `import { logger } from "@/lib/logger"` |
| `src/server/observability/logger.ts` | 50-line class | 3-line re-export |

---

## What Was Removed

### StructuredLogger (50-line hand-rolled class)

| Attribute | Detail |
|---|---|
| **Location** | `src/server/observability/logger.ts` |
| **Implementation** | Class wrapping `console.log` with manual JSON spread |
| **Redaction** | None — auth headers, cookies, passwords logged in plaintext |
| **Child loggers** | `.withContext({...})` — manual field merging |
| **Serialization** | Manual `JSON.stringify` equivalent via spread |
| **Transport** | `console.log` only |
| **Consumers** | 7 files |

### logWithCorrelation (unused helper)

| Attribute | Detail |
|---|---|
| **Location** | `src/server/observability/correlation.ts:59` |
| **Usage** | Zero call sites found |
| **Action** | Preserved as delegation to `logger.info()` for backward compatibility |

### CorrelationMiddleware (unused middleware)

| Attribute | Detail |
|---|---|
| **Location** | `src/server/observability/correlation.ts:80` |
| **Usage** | Zero middleware registrations found |
| **Action** | Preserved for potential future use; not actively used |

### LogEntry type (unused)

| Attribute | Detail |
|---|---|
| **Location** | `src/server/observability/logger.ts` |
| **Usage** | Zero references outside the file |
| **Action** | Removed with class replacement |

---

## Migration Details

### Parameter Order Change (7 files)

StructuredLogger used **message-first** parameter order:
```typescript
// StructuredLogger pattern
logger.info("User logged in", { userId, companyId });
```

Pino uses **data-first** parameter order:
```typescript
// Pino pattern
logger.info({ userId, companyId }, "User logged in");
```

**All 7 migrated files** had their parameter order swapped from message-first to data-first.

### Child Logger Pattern

StructuredLogger:
```typescript
const log = new StructuredLogger().withContext({ requestId: "abc" });
log.info("Processing request", { userId });
```

Pino equivalent:
```typescript
const log = logger.child({ requestId: "abc" });
log.info({ userId }, "Processing request");
```

---

## Security Comparison

| Attribute | Pino | StructuredLogger (removed) |
|---|---|---|
| Redaction | 4 field paths | None |
| Serialization | Automatic JSON | Manual spread |
| Transport security | stdout (configurable) | `console.log` |
| Log injection protection | Yes (Pino internal) | None |
| Sensitive data exposure risk | Low | **High** |

---

## API Surface

### Primary Methods

```typescript
logger.info(data, message?)    // Informational events
logger.warn(data, message?)    // Warning conditions
logger.error(data, message?)   // Error conditions
logger.debug(data, message?)   // Debug information
logger.trace(data, message?)   // Verbose debug
logger.fatal(data, message?)   // Fatal errors
```

### Child Loggers

```typescript
const child = logger.child({ requestId, companyId, userId });
child.info({ action: "transfer" }, "Transfer initiated");
```

### Level Checking

```typescript
if (logger.isLevelEnabled("debug")) {
  logger.debug({ payload: largeObject }, "Debug output");
}
```

---

## Future Evolution

| Enhancement | Priority | Notes |
|---|---|---|
| Request-scoped logger via async context | P2 | Node.js `AsyncLocalStorage` for automatic requestId injection |
| Structured log shipping | P2 | Forward JSON logs to Datadog/Splunk/ELK |
| Log-based alerting | P3 | Error rate thresholds trigger alerts |
| Audit log integration | P3 | Security-relevant log entries also written to audit chain |
