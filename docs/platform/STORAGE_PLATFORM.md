# Storage Platform

**Platform**: StoragePlatform
**Contract**: `StorageContract`
**Mission**: Provide durable, encrypted, multi-backend file storage — upload, retrieval, streaming, signed URLs, and lifecycle management — as the foundational storage layer for all documents, exports, backups, and audit evidence across the Perionyx platform.
**Status**: Not Started
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Blob Storage** — Store files of any type and size with encryption at rest (AES-256-GCM) and in transit (TLS 1.3).
2. **Multi-Backend Support** — Abstract storage backends (S3, Azure Blob, GCS, MinIO, local filesystem) behind a common interface. No business domain imports a cloud SDK (Constitution Law 1).
3. **Upload Management** — Handle single and multipart uploads with checksum verification, progress tracking, and resumable upload support.
4. **Streaming Retrieval** — Serve files via streaming with range-request support for large files and video-like access patterns.
5. **Signed URLs** — Generate time-limited, single-use signed URLs for secure external document sharing without exposing credentials.
6. **CDN Integration** — Origin server for CDN distribution of public and authenticated static assets.
7. **Backup & Restore** — Encrypted backup creation, restoration, and snapshot management for disaster recovery.
8. **Export Storage** — Serve generated exports (Excel, PDF, CSV) with automatic expiration.
9. **Storage Lifecycle** — Automatic tiering (hot → warm → cold → archive) based on access patterns and retention policies.
10. **Quota Management** — Per-tenant storage quotas with usage tracking and alerts.

---

## Public API (Capability Contract)

```typescript
interface StorageContract {
  // ── Upload ──────────────────────────────────────────────────
  put(key: string, data: Buffer | ReadableStream, opts?: StoragePutOptions): Promise<StorageObject>;
  putMultipart(key: string, parts: AsyncIterable<Buffer>, totalSize: number, opts?: StoragePutOptions): Promise<StorageObject>;

  // ── Retrieval ───────────────────────────────────────────────
  get(key: string): Promise<Buffer>;
  getStream(key: string): Promise<ReadableStream>;
  getRange(key: string, start: number, end: number): Promise<Buffer>;

  // ── Signed URLs ─────────────────────────────────────────────
  getSignedUrl(key: string, opts: SignedUrlOptions): Promise<string>;
  getPresignedUploadUrl(key: string, opts: PresignedUploadOptions): Promise<string>;

  // ── Metadata & Listing ──────────────────────────────────────
  head(key: string): Promise<StorageObjectMetadata>;
  list(prefix: string, opts?: ListOptions): Promise<StorageObjectListResult>;
  exists(key: string): Promise<boolean>;

  // ── Mutation ────────────────────────────────────────────────
  delete(key: string): Promise<void>;
  deleteBatch(keys: string[]): Promise<BatchDeleteResult>;
  copy(sourceKey: string, destKey: string): Promise<StorageObject>;
  move(sourceKey: string, destKey: string): Promise<StorageObject>;

  // ── Lifecycle ───────────────────────────────────────────────
  setRetentionPolicy(key: string, policy: RetentionPolicy): Promise<void>;
  setTier(key: string, tier: StorageTier): Promise<void>;
  getUsage(companyId: string): Promise<StorageUsage>;

  // ── Integrity ───────────────────────────────────────────────
  verifyChecksum(key: string): Promise<ChecksumVerification>;
  generateChecksum(data: Buffer): string;

  // ── Backup ──────────────────────────────────────────────────
  createBackup(key: string, opts?: BackupOptions): Promise<BackupResult>;
  restoreBackup(backupId: string, destKey: string): Promise<void>;
  listBackups(prefix: string): Promise<BackupInfo[]>;
}

interface StoragePutOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  encryption?: EncryptionOptions;
  tier?: StorageTier;
  companyId?: string;
}

interface StorageObject {
  key: string;
  etag: string;
  size: number;
  contentType: string;
  checksum: string;
  createdAt: Date;
  lastModified: Date;
}

interface StorageObjectMetadata {
  key: string;
  size: number;
  contentType: string;
  etag: string;
  checksum: string;
  metadata: Record<string, string>;
  tier: StorageTier;
  createdAt: Date;
  lastModified: Date;
  expiresAt?: Date;
}

interface SignedUrlOptions {
  expiresIn: number; // seconds, max 86400 (24hr)
  method?: "GET" | "PUT";
  contentType?: string;
  metadata?: Record<string, string>;
}

type StorageTier = "HOT" | "WARM" | "COLD" | "ARCHIVE";

interface RetentionPolicy {
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | "REGULATED";
  retentionDays: number;
  legalHold?: boolean;
  deleteAfterExpiry?: boolean;
}

interface StorageUsage {
  totalObjects: number;
  totalBytes: number;
  byTier: Record<StorageTier, { objects: number; bytes: number }>;
  byClassification: Record<string, { objects: number; bytes: number }>;
  quotaBytes?: number;
  quotaUsagePercent?: number;
}

interface EncryptionOptions {
  enabled: boolean;
  keyId?: string; // KMS key ID; platform default if omitted
}
```

---

## Internal API

```typescript
interface StorageInternalApi {
  // Called by DocumentPlatform
  persistDocument(key: string, file: Buffer, classification: string): Promise<StorageObject>;
  retrieveDocument(key: string): Promise<Buffer>;
  deleteDocument(key: string): Promise<void>;

  // Called by ExportPlatform
  persistExport(key: string, data: Buffer, contentType: string): Promise<StorageObject>;
  getExportDownloadUrl(key: string, expiresIn: number): Promise<string>;

  // Called by BackupManager
  persistBackup(key: string, data: Buffer): Promise<StorageObject>;
  retrieveBackup(key: string): Promise<Buffer>;

  // Called by AuditPlatform
  persistEvidence(key: string, file: Buffer): Promise<StorageObject>;

  // Health check for observability
  checkHealth(): Promise<{ status: string; backend: string; latencyMs: number }>;

  // Quota enforcement
  checkQuota(companyId: string, additionalBytes: number): Promise<boolean>;
}
```

---

## Events

```typescript
interface StoragePlatformEvents {
  "storage.object.created": {
    key: string; size: number; contentType: string;
    companyId?: string; tier: string; checksum: string;
  };
  "storage.object.deleted": { key: string; companyId?: string };
  "storage.object.copied": { sourceKey: string; destKey: string };
  "storage.object.moved": { sourceKey: string; destKey: string };
  "storage.object.tier_changed": { key: string; fromTier: string; toTier: string };
  "storage.signed_url.created": { key: string; expiresIn: number; companyId?: string };
  "storage.backup.created": { backupId: string; key: string; size: number; durationMs: number };
  "storage.backup.restored": { backupId: string; destKey: string; durationMs: number };
  "storage.checksum.verified": { key: string; valid: boolean; expected: string; actual: string };
  "storage.checksum.mismatch": { key: string; expected: string; actual: string };
  "storage.quota.warning": { companyId: string; usagePercent: number; usedBytes: number; quotaBytes: number };
  "storage.quota.exceeded": { companyId: string; usedBytes: number; quotaBytes: number };
  "storage.backend.error": { backend: string; operation: string; error: string };
  "storage.lifecycle.tiered": { key: string; fromTier: string; toTier: string; ageDays: number };
  "storage.lifecycle.expired": { key: string; ageDays: number; classification: string };
  "storage.lifecycle.purged": { key: string; ageDays: number };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `PutObject` | Upload a file | `storage.write` | Yes |
| `PutObjectMultipart` | Multipart upload | `storage.write` | Yes |
| `DeleteObject` | Delete a file | `storage.delete` | Yes |
| `DeleteObjects` | Batch delete | `storage.delete` | Yes |
| `CopyObject` | Copy a file | `storage.write` | Yes |
| `MoveObject` | Move a file | `storage.write` | Yes |
| `SetTier` | Change storage tier | `storage.admin` | Yes |
| `SetRetentionPolicy` | Set retention | `storage.admin` | Yes |
| `CreateBackup` | Create backup | `storage.admin` | Yes |
| `RestoreBackup` | Restore from backup | `storage.admin` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `GetObject` | Retrieve file content | `storage.read` |
| `GetObjectStream` | Stream file content | `storage.read` |
| `GetObjectRange` | Read byte range | `storage.read` |
| `HeadObject` | Get metadata only | `storage.read` |
| `ListObjects` | List files by prefix | `storage.read` |
| `ObjectExists` | Check existence | `storage.read` |
| `GetSignedUrl` | Generate signed URL | `storage.read` |
| `GetPresignedUploadUrl` | Generate presigned upload | `storage.write` |
| `VerifyChecksum` | Verify file integrity | `storage.read` |
| `GetUsage` | Storage usage stats | `storage.read` |
| `ListBackups` | List available backups | `storage.admin` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `STORAGE_OBJECT_NOT_FOUND` | Object does not exist | 404 | No |
| `STORAGE_OBJECT_EXISTS` | Object already exists (no overwrite) | 409 | No |
| `STORAGE_QUOTA_EXCEEDED` | Company storage quota exceeded | 507 | No |
| `STORAGE_BACKEND_UNAVAILABLE` | Storage backend down | 503 | Yes |
| `STORAGE_CHECKSUM_MISMATCH` | Upload integrity check failed | 400 | Yes |
| `STORAGE_KEY_INVALID` | Invalid storage key format | 400 | No |
| `STORAGE_ENCRYPTION_FAILED` | Encryption error | 500 | Yes |
| `STORAGE_DECRYPTION_FAILED` | Decryption error | 500 | No |
| `STORAGE_UPLOAD_TOO_LARGE` | Exceeds max upload size | 413 | No |
| `STORAGE_RANGE_INVALID` | Invalid byte range | 416 | No |
| `STORAGE_BACKUP_FAILED` | Backup creation error | 500 | Yes |
| `STORAGE_LLEGAL_HOLD` | Object under legal hold, cannot delete | 409 | No |
| `STORAGE_BACKEND_ERROR` | Generic backend failure | 503 | Yes |

---

## Security Model

- **Encryption at Rest** (Constitution Law 13): All objects encrypted with AES-256-GCM. Default platform key; custom KMS key support per tenant.
- **Encryption in Transit**: TLS 1.3 for all uploads and downloads. No plain HTTP.
- **No Business Logic in Storage** (Constitution Law 1): Business domains interact only through `StorageContract`. They never import AWS SDK, Azure SDK, or GCS client.
- **Signed URLs**: Time-limited (max 24hr), single-use for downloads, HMAC-verified.
- **Retention Enforcement**: Legal holds prevent deletion regardless of retention policy. Regulated documents require explicit admin override.
- **Backup Encryption**: Backups are encrypted with separate keys from production data.
- **Quota Enforcement**: Pre-upload quota check prevents exceeding tenant storage limits.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `storage.read` | Company | Read objects owned by company |
| `storage.write` | Company | Write/update objects |
| `storage.delete` | Company | Delete objects |
| `storage.admin` | Platform | Tier changes, retention, backup/restore, quota management |
| `storage.backup` | Platform | Backup and restore operations |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `storage.objects.total` | Gauge | `tier`, `classification` | Object count |
| `storage.objects.bytes` | Gauge | `tier`, `classification` | Total bytes stored |
| `storage.upload.total` | Counter | `content_type`, `backend` | Upload operations |
| `storage.upload.bytes` | Histogram | `content_type` | Upload sizes |
| `storage.upload.latency_ms` | Histogram | `content_type`, `size_bucket` | Upload latency |
| `storage.download.total` | Counter | `backend`, `access_type` | Download operations |
| `storage.download.latency_ms` | Histogram | `access_type` | Download latency |
| `storage.signed_url.total` | Counter | — | Signed URLs generated |
| `storage.checksum.verified` | Counter | `valid` | Checksum verifications |
| `storage.backup.total` | Counter | `status` | Backup operations |
| `storage.backup.size_bytes` | Histogram | — | Backup sizes |
| `storage.backup.duration_ms` | Histogram | — | Backup duration |
| `storage.quota.usage_percent` | Gauge | `company_id` | Quota usage |
| `storage.lifecycle.tiered` | Counter | `from_tier`, `to_tier` | Tier changes |
| `storage.lifecycle.expired` | Counter | `classification` | Expired objects |
| `storage.errors.total` | Counter | `error_code`, `backend` | Error count |
| `storage.backend.latency_ms` | Histogram | `backend`, `operation` | Backend latency |

### Tracing

All storage operations emit spans: `storage.put`, `storage.get`, `storage.delete`, `storage.sign_url`, `storage.backup`. Span attributes: `storage.key`, `storage.size`, `storage.backend`, `storage.tier`, `company_id`.

### Logging

Structured logs for: upload completion (key, size, checksum, duration), deletion, tier changes, backup creation, checksum failures, quota warnings, backend errors. All logs include company context.

---

## Rate Limiting

| Operation | Limit | Window | Scope |
|---|---|---|---|
| Upload | 100 files/hr | Sliding | Per company |
| Upload (multipart) | 10/hr | Sliding | Per company |
| Download | 500 req/hr | Sliding | Per company |
| Signed URL generation | 50/hr | Sliding | Per company |
| Batch delete | 10/hr | Sliding | Per company |
| Backup creation | 4/hr | Fixed | Per company |
| Restore | 2/hr | Fixed | Per company |

---

## Retry Policy

| Operation | Max Retries | Backoff | Retryable |
|---|---|---|---|
| Upload | 3 | Exponential, base 1s | Backend error, checksum mismatch |
| Download | 3 | Exponential, base 500ms | Backend error |
| Backup | 2 | Exponential, base 30s | Backend error, timeout |
| Restore | 2 | Exponential, base 30s | Backend error |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Half-Open |
|---|---|---|---|
| Storage backend | 5 consecutive failures / 60s | 30s open | 1 probe request |
| CDN origin | 3 failures / 30s | 15s open | 1 probe |

**Fallback Behavior**: When backend is down, uploads fail immediately. Downloads attempt cache. Signed URLs fail with user-facing error.

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Object metadata | 5min | Per key | On mutation |
| Signed URLs | Until expiry | Per URL | N/A |
| Usage stats | 60s | Per company | On upload/delete |
| Health status | 30s | Global | On health check |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix (`/api/v1/storage/`) |
| Storage key format | `{companyId}/{domain}/{entityId}/{version}/{filename}` |
| Backend abstraction | Versioned `IStorageBackend` interface |
| Breaking changes | 2-version deprecation window |

---

## Lifecycle

### Object Lifecycle
```
Uploading → Active → [Tier Changes] → Warm → Cold → Archive → Expired → Purged
                                                    
Active → Archived (explicit)
Active → Deleted → [Grace Period] → Purged
Any → Under Legal Hold (blocks deletion)
```

### Storage Tier Progression
| Tier | Access Pattern | Cost | Latency |
|---|---|---|---|
| HOT | <7 days old, frequent access | Highest | <50ms |
| WARM | 7-90 days, occasional access | Medium | <200ms |
| COLD | 90-365 days, rare access | Low | <1s |
| ARCHIVE | >365 days, compliance only | Lowest | <12hr |

---

## Extension Model

- **Custom Backends**: Implement `IStorageBackend` interface and register via `StorageBackendRegistry.register(name, backend)`.
- **Custom Encryption**: Implement `IEncryptionProvider` for HSM, Vault, or cloud KMS integration.
- **Custom Lifecycle Policies**: Register `ILifecyclePolicy` handlers for domain-specific tiering rules.
- **Webhook on Upload**: Register pre-upload and post-upload webhooks for virus scanning, OCR, or classification.
- **CDN Providers**: Implement `ICDNProvider` for CloudFlare, CloudFront, or Akamai integration.

---

## Provider Model

The Storage Platform uses an internal backend abstraction. No cloud SDK is imported by business domains.

```typescript
interface IStorageBackend {
  put(key: string, data: Buffer, metadata: Record<string, string>): Promise<void>;
  get(key: string): Promise<Buffer>;
  getStream(key: string): Promise<ReadableStream>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  head(key: string): Promise<BackendObjectMetadata>;
  list(prefix: string, limit: number, cursor?: string): Promise<BackendListResult>;
  getSignedUrl(key: string, ttl: number, method: string): Promise<string>;
  copy(source: string, dest: string): Promise<void>;
  move(source: string, dest: string): Promise<void>;
  getStats(): Promise<BackendStats>;
}
```

**Planned Backends**:

| Backend | Priority | Use Case |
|---|---|---|
| S3 | 1 | Primary cloud storage |
| Azure Blob | 2 | Azure deployments |
| GCS | 3 | GCP deployments |
| MinIO | 4 | Self-hosted / private cloud |
| LocalFilesystem | 5 | Development / single-server |

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Checksum generation, key validation, tier calculation | 95% |
| Integration tests | Upload → retrieve → delete lifecycle per backend | 90% |
| Contract tests | `IStorageBackend` interface compliance | 100% |
| Security tests | Encryption verification, signed URL validity, access control | 100% |
| Performance tests | Large file upload (100MB+), multipart, concurrent access | Baseline |
| Chaos tests | Backend failure, network partition, partial upload | Graceful degradation |
| Backup tests | Full backup → restore → integrity check | 100% |
| Compliance tests | Retention enforcement, legal hold, tier progression | 100% |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Backend down | All uploads fail | Circuit breaker, alert ops |
| Partial upload | Incomplete file | Multipart resume, checksum verification |
| Encryption failure | File unprotected | Reject upload, alert security |
| Quota exceeded | New uploads blocked | Pre-upload check, alert admin |
| Backend data loss | Permanent file loss | Backup restoration, cross-region replication |
| Signed URL leak | Unauthorized access | Short TTL, single-use, revocation |
| Legal hold conflict | Cannot delete | System prevents deletion, queues review |
| CDN stale content | Outdated files served | Cache invalidation API, short TTL |
| Backup corruption | Unrecoverable data | Checksum verification, multiple backups |
| Tier migration failure | Object stuck in wrong tier | Retry, manual override |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Backend data loss | Restore from encrypted backup (4hr RPO, 1hr RTO) |
| Accidental delete | 30-day soft-delete grace period; restore from version |
| Encryption key compromise | Rotate key; re-encrypt affected objects |
| Quota misconfiguration | Admin override + quota adjustment |
| CDN outage | Direct origin serving fallback |
| Backup failure | Retry with exponential backoff; alert ops team |
| Network partition | Local fallback for private cloud; queue for cloud |

---

## Future Work

1. **Multi-Region Replication** — Cross-region replication for disaster recovery and low-latency access.
2. **Version History** — Full version history for every object with rollback capability.
3. **Content Processing Pipeline** — Post-upload hooks for virus scanning, OCR, thumbnail generation, and format conversion.
4. **CDN Origin** — Native CDN integration with cache invalidation and origin shield.
5. **Lifecycle Automation** — Automatic tiering rules based on access patterns (ML-driven).
6. **Storage Analytics** — Detailed per-tenant storage analytics with cost attribution.
7. **Object Lock** — WORM (Write Once Read Many) for regulatory compliance.
8. **Cross-Tenant Sharing** — Secure cross-tenant file sharing with audit trail.

---

## Integration Points

| Platform | Integration |
|---|---|
| Document Platform | Primary consumer — all document files stored via `StorageContract` |
| Audit Platform | Evidence package files stored via `StorageContract` |
| Backup Manager | Backup snapshots stored via `StorageContract` |
| Export Engine | Generated exports (Excel, PDF) served via `StorageContract` |
| Observability | Health checks, metrics, tracing |
| Security | Encryption, access control, audit logging |

---

*The Storage Platform provides the durable foundation upon which all Perionyx document and data persistence is built.*
