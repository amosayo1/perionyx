# Document Platform

**Platform**: DocumentPlatform
**Contract**: `DocumentContract`
**Mission**: Provide secure, searchable, auditable document storage, retrieval, and lifecycle management for all financial and operational documents across the Perionyx platform.
**Status**: Not Started
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Document Ingestion** — Accept documents from users, integrations, OCR pipelines, and automated workflows in any supported format (PDF, image, spreadsheet, XML, JSON, CSV).
2. **Storage Lifecycle** — Manage upload, versioning, archival, and deletion of documents with classification-driven retention policies.
3. **Document Retrieval** — Serve documents on-demand with streaming, range-request support, and signed URL generation for secure external access.
4. **Classification & Tagging** — Auto-classify documents by type (invoice, receipt, contract, audit evidence, board pack) and attach metadata for search and compliance.
5. **Integration Facade** — Act as the single storage layer for AP (invoices, GRNs), AR (receipts, statements), treasury (bank statements), audit (evidence packages), and workflow (attachments).
6. **Retention Enforcement** — Enforce data-retention policies per document classification level (Regulated: 7yr, Confidential: 5yr, Internal: 3yr, Public: 1yr).
7. **Virus/Malware Scanning** — Scan all uploaded documents before they enter the system; quarantine infected files.
8. **Access Audit Trail** — Record every document access, download, share, and deletion for compliance.

---

## Public API (Capability Contract)

```typescript
interface DocumentContract {
  // ── Upload ──────────────────────────────────────────────────
  upload(input: DocumentUploadInput): Promise<DocumentRecord>;
  uploadBatch(input: DocumentBatchUploadInput): Promise<DocumentRecord[]>;

  // ── Retrieval ───────────────────────────────────────────────
  getById(documentId: string, companyId: string): Promise<DocumentRecord | null>;
  getStream(documentId: string, companyId: string): Promise<DocumentStream>;
  getSignedUrl(documentId: string, companyId: string, opts?: SignedUrlOptions): Promise<string>;
  getByEntity(entityType: string, entityId: string, companyId: string): Promise<DocumentRecord[]>;

  // ── Search & Listing ────────────────────────────────────────
  search(query: DocumentSearchQuery): Promise<DocumentSearchResult[]>;
  list(companyId: string, filters?: DocumentListFilters): Promise<DocumentRecord[]>;

  // ── Mutation ────────────────────────────────────────────────
  updateMetadata(documentId: string, companyId: string, metadata: Partial<DocumentMetadata>): Promise<DocumentRecord>;
  classify(documentId: string, companyId: string, classification: DocumentClassification): Promise<DocumentRecord>;
  archive(documentId: string, companyId: string, reason: string): Promise<void>;
  softDelete(documentId: string, companyId: string, reason: string): Promise<void>;
  restore(documentId: string, companyId: string): Promise<void>;

  // ── Versioning ──────────────────────────────────────────────
  getVersionHistory(documentId: string, companyId: string): Promise<DocumentVersion[]>;
  uploadNewVersion(documentId: string, companyId: string, file: DocumentFile, changeNote: string): Promise<DocumentRecord>;

  // ── Sharing ─────────────────────────────────────────────────
  generateShareLink(documentId: string, companyId: string, opts: ShareLinkOptions): Promise<ShareLink>;
  revokeShareLink(shareId: string, companyId: string): Promise<void>;

  // ── Lifecycle ───────────────────────────────────────────────
  runRetentionScan(): Promise<RetentionScanResult>;
  purgeExpired(): Promise<PurgeResult>;
}
```

### Key Types

```typescript
interface DocumentUploadInput {
  companyId: string;
  userId: string;
  file: DocumentFile;
  metadata: DocumentMetadata;
  classification: DocumentClassification;
  tags?: string[];
  entityType?: string;
  entityId?: string;
}

interface DocumentFile {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer | ReadableStream;
}

interface DocumentRecord {
  id: string;
  companyId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  classification: DocumentClassification;
  status: DocumentStatus;
  version: number;
  entityType: string | null;
  entityId: string | null;
  metadata: DocumentMetadata;
  tags: string[];
  storageKey: string;
  checksum: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  deletedAt: string | null;
}

type DocumentClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | "REGULATED";
type DocumentStatus = "ACTIVE" | "ARCHIVED" | "DELETED" | "QUARANTINED" | "EXPIRED";

interface DocumentSearchQuery {
  companyId: string;
  query: string;
  classification?: DocumentClassification;
  entityType?: string;
  mimeType?: string;
  tags?: string[];
  uploadedAfter?: string;
  uploadedBefore?: string;
  limit: number;
  offset: number;
}
```

---

## Internal API

```typescript
interface DocumentInternalApi {
  // Called by AP platform for invoice attachment
  attachToInvoice(invoiceId: string, companyId: string, documentId: string): Promise<void>;
  getInvoiceDocuments(invoiceId: string, companyId: string): Promise<DocumentRecord[]>;

  // Called by audit platform for evidence management
  attachToEvidence(evidenceId: string, companyId: string, documentId: string): Promise<void>;
  getEvidenceDocuments(evidenceId: string, companyId: string): Promise<DocumentRecord[]>;

  // Called by workflow platform for step attachments
  attachToWorkflowInstance(instanceId: string, companyId: string, documentId: string): Promise<void>;
  getWorkflowDocuments(instanceId: string, companyId: string): Promise<DocumentRecord[]>;

  // Storage layer operations (called by StoragePlatform)
  persistToStorage(storageKey: string, file: DocumentFile): Promise<void>;
  retrieveFromStorage(storageKey: string): Promise<Buffer>;
  deleteFromStorage(storageKey: string): Promise<void>;

  // Classification enforcement
  getRetentionPolicy(classification: DocumentClassification): RetentionPolicy;
  isRetentionExpired(document: DocumentRecord): boolean;
}
```

---

## Events

```typescript
// Document lifecycle events
interface DocumentPlatformEvents {
  "document.uploaded": { documentId: string; companyId: string; classification: string; mimeType: string; size: number };
  "document.classified": { documentId: string; companyId: string; classification: string; previousClassification?: string };
  "document.version.created": { documentId: string; companyId: string; version: number; changeNote: string };
  "document.archived": { documentId: string; companyId: string; reason: string };
  "document.deleted": { documentId: string; companyId: string; reason: string; deletedBy: string };
  "document.restored": { documentId: string; companyId: string; restoredBy: string };
  "document.shared": { documentId: string; companyId: string; shareId: string; expiresAt: string };
  "document.share.revoked": { documentId: string; companyId: string; shareId: string };
  "document.accessed": { documentId: string; companyId: string; userId: string; accessType: "view" | "download" | "stream" };
  "document.retention.expired": { documentId: string; companyId: string; classification: string; ageDays: number };
  "document.purged": { documentId: string; companyId: string; storageKey: string };
  "document.quarantined": { documentId: string; companyId: string; reason: string; threatType?: string };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `UploadDocument` | Upload a single document | `documents.create` | Yes |
| `UploadDocuments` | Batch upload | `documents.create` | Yes |
| `ClassifyDocument` | Set/update classification | `documents.classify` | Yes |
| `ArchiveDocument` | Move to archive | `documents.archive` | Yes |
| `SoftDeleteDocument` | Mark for deletion | `documents.delete` | Yes |
| `RestoreDocument` | Restore soft-deleted | `documents.restore` | Yes |
| `PurgeExpired` | System job — purge expired docs | `documents.admin` | Yes |
| `GenerateShareLink` | Create signed share URL | `documents.share` | Yes |
| `RevokeShareLink` | Revoke a share link | `documents.share` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `GetDocumentById` | Fetch single document record | `documents.read` |
| `StreamDocument` | Stream file content | `documents.read` |
| `GetSignedUrl` | Get time-limited download URL | `documents.read` |
| `SearchDocuments` | Full-text + filter search | `documents.read` |
| `ListDocuments` | Paginated list with filters | `documents.read` |
| `GetDocumentsByEntity` | All docs linked to entity | `documents.read` |
| `GetVersionHistory` | All versions of a document | `documents.read` |
| `GetRetentionStatus` | System — check retention | `documents.admin` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `DOCUMENT_NOT_FOUND` | Document does not exist | 404 | No |
| `DOCUMENT_ACCESS_DENIED` | User lacks permission | 403 | No |
| `DOCUMENT_QUARANTINED` | File failed virus scan | 410 | No |
| `DOCUMENT_EXPIRED` | Retention period exceeded | 410 | No |
| `DOCUMENT_LOCKED` | Document is under legal hold | 409 | No |
| `STORAGE_FULL` | Storage quota exceeded | 507 | No |
| `STORAGE_BACKEND_ERROR` | Underlying storage failure | 503 | Yes |
| `FILE_TOO_LARGE` | Exceeds max upload size | 413 | No |
| `INVALID_MIME_TYPE` | Unsupported file format | 415 | No |
| `CHECKSUM_MISMATCH` | Upload integrity check failed | 400 | Yes |
| `VIRUS_DETECTED` | Malware detected in file | 410 | No |
| `CONCURRENT_VERSION_CONFLICT` | Optimistic locking failure | 409 | Yes |

---

## Security Model

- **Classification-Driven Access**: Document access is governed by classification level. `REGULATED` documents require explicit ACL entries. `RESTRICTED` requires MFA verification.
- **Signed URLs**: All external document access uses time-limited signed URLs (default 1hr TTL, max 24hr). URLs are single-use for downloads.
- **Encryption at Rest**: All documents stored with AES-256-GCM encryption. Keys managed by the platform key rotation system.
- **Encryption in Transit**: All document serving over HTTPS only.
- **Virus Scanning**: Every upload scanned before persistence. Quarantined files are never served.
- **Retention Enforcement**: Automated job enforces per-classification retention. Legal holds override retention.
- **Data Classification Law** (Constitution Law 13): Every document has a classification level. Handling rules are determined by classification, never by convenience.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `documents.create` | Company | Upload new documents |
| `documents.read` | Company | View/download documents |
| `documents.update` | Company | Update metadata |
| `documents.classify` | Company | Change classification level |
| `documents.delete` | Company | Soft-delete documents |
| `documents.restore` | Company | Restore deleted documents |
| `documents.archive` | Company | Archive documents |
| `documents.share` | Company | Create/revoke share links |
| `documents.admin` | Company | Retention scans, purge, system ops |

**Role Mapping**: CFO (all), Controller (create/read/update/classify/share), Finance Manager (create/read/update), Auditor (read + admin for audit-linked docs), Employee (read for own uploads).

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `document.uploads.total` | Counter | `classification`, `mimeType` | Total uploads |
| `document.uploads.size_bytes` | Histogram | `mimeType` | Upload file sizes |
| `document.uploads.duration_ms` | Histogram | `mimeType`, `size_bucket` | Upload latency |
| `document.downloads.total` | Counter | `access_type` | Total downloads/views/streams |
| `document.downloads.latency_ms` | Histogram | `access_type` | Download latency |
| `document.storage.total_bytes` | Gauge | `classification` | Total storage used |
| `document.storage.documents_count` | Gauge | `classification` | Total document count |
| `document.retention.expired` | Gauge | — | Documents past retention |
| `document.virus.scan.total` | Counter | `result` | Scans by result (clean/infected/error) |
| `document.quarantine.total` | Counter | `threat_type` | Quarantined files |
| `document.search.total` | Counter | — | Search queries |
| `document.search.latency_ms` | Histogram | — | Search query latency |
| `document.errors.total` | Counter | `error_code` | Error counter by code |

### Tracing

All document operations emit spans with: `document.id`, `document.companyId`, `document.classification`, `storage.backend`, `file.size`, `file.mimeType`.

### Logging

Structured logs for: upload initiation, classification changes, access events, retention scans, purge operations, virus detection events. All logs include correlation ID and tenant context.

---

## Rate Limiting

| Operation | Limit | Window | Scope |
|---|---|---|---|
| Upload | 100 files/hr | Sliding | Per company |
| Upload size | 100MB per file | — | Per request |
| Batch upload | 10 files per batch | — | Per request |
| Download | 500 req/hr | Sliding | Per company |
| Signed URL generation | 50/hr | Sliding | Per company |
| Search | 200 req/hr | Sliding | Per company |
| Classification change | 50/hr | Sliding | Per company |

---

## Retry Policy

| Operation | Max Retries | Backoff | Retryable Errors |
|---|---|---|---|
| Upload to storage | 3 | Exponential, base 1s | `STORAGE_BACKEND_ERROR`, `CHECKSUM_MISMATCH` |
| Download from storage | 3 | Exponential, base 500ms | `STORAGE_BACKEND_ERROR` |
| Virus scan | 2 | Fixed 5s | scan timeout |
| Retention scan | 3 | Exponential, base 30s | `STORAGE_BACKEND_ERROR` |

---

## Circuit Breakers

| Circuit | Failure Threshold | Recovery | Half-Open |
|---|---|---|---|
| Storage Backend | 5 consecutive failures in 60s | 30s open → half-open | 1 probe request |
| Virus Scanner | 3 consecutive failures in 60s | 60s open → half-open | 1 probe request |

**Fallback Behavior**: When storage circuit is open, uploads fail with `STORAGE_FULL` error. Downloads serve from cache if available, otherwise fail with `STORAGE_BACKEND_ERROR`.

---

## Caching

| Cache | TTL | Invalidation | Scope |
|---|---|---|---|
| Document metadata | 5min | On mutation | Per document ID |
| Signed URLs | Until expiry | On revoke | Per share ID |
| Recent document list | 60s | On mutation | Per company |
| Search index | 30s | On reindex | Global |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix (`/api/v1/documents`, `/api/v2/documents`) |
| Breaking changes | Minimum 2-version deprecation window |
| Document versioning | Incremental integer (1, 2, 3...) per document |
| Storage key format | `{companyId}/{documentId}/v{version}/{filename}` |

---

## Lifecycle

| Phase | Description |
|---|---|
| **Created** | Document uploaded, virus scan in progress |
| **Active** | Document available for access |
| **Archived** | Document moved to cold storage |
| **Expired** | Retention period exceeded, pending purge |
| **Deleted** | Soft-deleted, restoreable within 30 days |
| **Purged** | Hard-deleted, data unrecoverable |

---

## Extension Model

- **Custom Document Types**: Register new `DocumentType` handlers via `DocumentTypeRegistry.register(type, handler)`.
- **Custom Classifiers**: Register ML-based classifiers via `DocumentClassifierRegistry.register(name, classifier)`.
- **Custom Storage Backends**: Implement `IStorageBackend` interface (S3, GCS, Azure Blob, local filesystem).
- **Webhook Integration**: `document.uploaded` events can trigger external webhook destinations.
- **OCR Pipeline Hook**: `postUpload` hook for automatic OCR extraction (invoice number, amount, date).

---

## Provider Model

The Document Platform uses an internal storage backend abstraction. External providers are NOT directly invoked by business domains (Constitution Law 1).

```typescript
interface IStorageBackend {
  put(key: string, data: Buffer, metadata: Record<string, string>): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getSignedUrl(key: string, ttl: number): Promise<string>;
  getStats(): Promise<{ totalObjects: number; totalBytes: number }>;
}
```

**Built-in Backends** (planned): S3, Azure Blob, GCS, LocalFilesystem, MinIO.

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Classification logic, retention calculations, metadata extraction | 90% |
| Integration tests | Upload → retrieve → delete lifecycle | 85% |
| Contract tests | `DocumentContract` API compliance | 100% |
| Security tests | Classification enforcement, signed URL validity, virus scanning | 100% |
| Performance tests | Large file upload (>50MB), batch operations, search latency | Baseline |
| Chaos tests | Storage backend failure, virus scanner downtime | Graceful degradation |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Storage backend down | Uploads fail, downloads from cache only | Circuit breaker, read-through cache |
| Virus scanner down | Quarantine all uploads (fail-closed) | Circuit breaker, alert ops team |
| Retention job failure | Expired documents accumulate | Retry, manual override, alert |
| Signed URL service down | External sharing unavailable | Fail with user-facing error |
| Disk space exhaustion | All uploads blocked | Quota monitoring, pre-flight check |
| Database failure | Metadata unavailable | Serve from cache, fail writes |
| Network partition | Distributed storage unreachable | Local fallback for private cloud |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Storage data loss | Restore from encrypted backups (4hr RPO, 1hr RTO) |
| Accidental purge | Soft-delete grace period (30 days) before hard purge |
| Corruption | Checksum verification on every read; version rollback |
| Virus scan false positive | Manual quarantine review queue, admin override |
| Retention misconfiguration | Configuration rollback, affected documents restored from backup |
| Share link compromise | Immediate revocation API, link expiry audit |

---

## Future Work

1. **OCR Pipeline** — Automatic text extraction from uploaded invoices, receipts, and contracts.
2. **AI Classification** — ML-based document type detection and auto-tagging.
3. **Full-Text Indexing** — Index document content for enterprise search integration.
4. **Chunked Upload** — Resumable uploads for large files (>100MB).
5. **Document Collaboration** — Real-time annotation and review workflows.
6. **Regulatory Export** — One-click export of all documents for a period/entity for audit.
7. **Watermarking** — Dynamic watermarking for confidential and restricted documents.
8. **Cross-Tenant Sharing** — Secure document sharing between tenant organizations.

---

*The Document Platform serves as the foundational document layer for the Perionyx Enterprise Financial Operating System.*
