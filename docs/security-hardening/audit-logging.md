# Audit Logging

## Append-Only Audit Store

`AuditEventStore` (`src/server/security/audit-logger.ts`) provides an append-only, hash-chained audit log backed by the `auditLog` Prisma table.

### Entry Structure

```typescript
interface SecurityAuditEntry {
  id: string;                    // aud_<timestamp>_<random 4 bytes hex>
  timestamp: string;             // ISO 8601
  type: string;                  // resource type (e.g. "transfer", "user")
  severity: "info" | "warning" | "critical";
  userId?: string;
  companyId?: string;
  action: string;                // e.g. "transfer.created"
  resource?: string;             // resource ID
  details?: string;              // JSON or free text
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  previousHash?: string;         // SHA-256 of previous entry
  hash?: string;                 // SHA-256 of this entry
}
```

## Hash Chaining for Tamper Detection

Each audit entry stores the SHA-256 hash of the preceding entry in `previousHash`. This creates a cryptographic chain:

```
entry[0].previousHash = null
entry[0].hash = SHA256(entry[0] data + null)

entry[1].previousHash = entry[0].hash
entry[1].hash = SHA256(entry[1] data + entry[0].hash)

entry[n].previousHash = entry[n-1].hash
entry[n].hash = SHA256(entry[n] data + entry[n-1].hash)
```

### Verification

```typescript
const result = await auditEventStore.verifyChain(companyId);
// { valid: boolean, breaks: number, entries: number }
```

If `breaks > 0`, the chain has been tampered with — entries were modified, deleted, or inserted out of order. The `verifyChain()` method iterates all entries ordered by `createdAt ASC, id ASC` and confirms each entry's stored `previousHash` matches the computed hash of the prior entry.

## Query and Export Capabilities

### Filtering

```typescript
const result = await auditEventStore.query({
  companyId: "cmp_xxx",
  severity: "critical",
  startDate: "2026-01-01T00:00:00Z",
  endDate: "2026-07-13T23:59:59Z",
  action: "user.deleted",
  search: "suspicious",
  cursor: "aud_...",  // cursor-based pagination
  take: 50,
});
```

Cursor-based pagination is implemented — pass the `id` of the last entry as `cursor` to get the next page.

### CSV Export

```typescript
const csv = await auditEventStore.exportCSV({
  companyId: "cmp_xxx",
  startDate: "2026-06-01T00:00:00Z",
  take: 10000,
});
// UTF-8 BOM prefixed CSV with headers
```

### SecurityAuditLogger convenience facade

```typescript
import { securityAuditLogger } from "@/server/security/audit-logger";

// Record an event
await securityAuditLogger.log({
  type: "transfer",
  severity: "info",
  userId: "usr_xxx",
  companyId: "cmp_xxx",
  action: "transfer.created",
  resource: "trf_xxx",
  details: JSON.stringify({ amount: 5000, currency: "USD" }),
  ip: "203.0.113.1",
  correlationId: "corr_xxx",
});

// Query with defaults
const { entries, nextCursor } = await securityAuditLogger.query({
  companyId: "cmp_xxx",
});
```

## Retention Policy

Retention is managed via `applyRetention(days: number)`:

```typescript
// Delete all audit entries older than 365 days
const deleted = await auditEventStore.applyRetention(365);
```

Recommended retention periods:

| Environment | Retention | Rationale |
|-------------|-----------|-----------|
| Development | 7 days | Debugging only |
| Staging | 90 days | Testing compliance workflows |
| Production | 3 years | SOC 2 / GDPR requirements |

Retention can be run as a scheduled job (e.g., daily via PgBoss cron).

## Privacy Considerations

- **PII in audit logs**: Avoid storing raw PII in the `details` field. Use anonymized references (user IDs, correlation IDs) instead of names, emails, or IPs for non-security events.
- **IP addresses**: Included for security events (`severity: "critical"` or `severity: "warning"`). Omit for routine informational events.
- **Correlation IDs**: Use instead of embedding user identity data in log details. Correlate with the request's correlation ID from the proxy layer.
- **User agent strings**: Parsed and stored for security incident investigation. Not used for analytics.
- **Data subject access**: Use `exportCSV()` with relevant filters to fulfill GDPR right of access requests. The export includes all audit log entries for a given user or company.
- **Data retention**: Apply retention via `applyRetention()` to comply with the storage limitation principle.
