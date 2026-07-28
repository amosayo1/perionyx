# Data Architecture

**Document Type**: Cross-Cutting Architecture
**Mission**: Define the complete data lifecycle for Perionyx — classification, retention, encryption, partitioning, backup, restore, archiving, deletion, masking, anonymization, PII handling, financial precision, and schema evolution — ensuring data is protected, compliant, and durable across its entire lifecycle.
**Status**: Partially Built (42+ persistence files, 374 Prisma models, 4 DB adapters, AES-256-GCM encryption)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 6 ("Financial Integrity Is Never Compromised"), Law 13 ("Data Classification Governs Handling"), Law 11 ("Tenant Isolation Is Absolute")

---

## Responsibilities

1. **Data Classification** — Every data element classified: Public, Internal, Confidential, Restricted, Regulated.
2. **Data Lifecycle** — Managed from creation through active use, archival, and deletion.
3. **Retention Policies** — Per-classification and per-regulation retention rules.
4. **Encryption at Rest** — AES-256-GCM for Confidential, Restricted, and Regulated data.
5. **Encryption in Transit** — TLS 1.3 for all client-server and service-to-service communication.
6. **Data Partitioning** — By tenant (companyId) and by time for large tables.
7. **Backup Strategy** — Daily full, hourly incremental, 30-day retention.
8. **Restore Strategy** — Point-in-time recovery, full restore, granular restore.
9. **Archiving Strategy** — Move cold data to cost-effective storage.
10. **Deletion Strategy** — Right to erasure (GDPR Art. 17), soft delete, hard delete.
11. **Legal Hold** — Preserve data pending litigation or audit.
12. **Data Lineage** — Track data origin and transformations.
13. **Data Masking** — Mask sensitive data in non-production environments.
14. **Data Anonymization** — Irreversible anonymization for analytics and testing.
15. **PII Detection** — Identify and tag PII fields in schema and code.
16. **Financial Precision** — `Decimal(38,12)` for all monetary values.
17. **Data Versioning** — Optimistic locking with version fields.
18. **Schema Evolution** — Forward-only migrations with backward compatibility.

---

## Data Classification

### Classification Levels

| Level | Label | Description | Examples |
|---|---|---|---|
| **Public** | `public` | Information freely available | Marketing content, public API docs |
| **Internal** | `internal` | Non-sensitive business data | Config, metadata, feature flags |
| **Confidential** | `confidential` | Sensitive business data | User profiles, business records |
| **Restricted** | `restricted` | Highly sensitive data | Financial records, audit trails, credentials |
| **Regulated** | `regulated` | Data subject to regulation | PII, PCI data, tax records, healthcare |

### Handling Requirements by Level

| Requirement | Public | Internal | Confidential | Restricted | Regulated |
|---|---|---|---|---|---|
| Encryption at rest | No | No | AES-256-GCM | AES-256-GCM | AES-256-GCM + KMS |
| Encryption in transit | Optional | TLS 1.3 | TLS 1.3 | TLS 1.3 | TLS 1.3 |
| Access control | None | Authenticated | RBAC | RBAC + SoD | RBAC + SoD + MFA |
| Audit logging | No | No | Write operations | All operations | All operations |
| Retention | No limit | 7 years | 7 years | 10 years | Per regulation |
| Backup | Optional | Daily | Daily + hourly | Daily + hourly + WAL | Daily + hourly + WAL |
| Masking in dev | No | No | Yes | Yes | Yes |
| Deletion | Immediate | Soft delete | Soft delete + audit | Hard delete + audit | Regulatory retention |

### Prisma Schema Classification

```prisma
// Classification annotation pattern
model Transaction {
  id        String   @id @default(cuid())
  companyId String   // @classification("restricted") — tenant isolation
  amount    Decimal  @db.Decimal(38, 12) // @classification("restricted") — financial
  currency  String   // @classification("internal")
  // ...
}
```

---

## Data Lifecycle

### Lifecycle Stages

```
Created -> Active -> Archived -> Deleted
    |         |          |
    v         v          v
  Frozen   Read-Only  Cold Storage
```

### Stage Definitions

| Stage | Description | Access | Storage |
|---|---|---|---|
| **Created** | Newly written data | Read/Write | Primary DB |
| **Active** | Frequently accessed | Read/Write | Primary DB |
| **Archived** | Infrequently accessed | Read-only | Cold storage |
| **Deleted** | Soft-deleted or hard-deleted | None | None (or backup) |

### Lifecycle Transitions

| Transition | Trigger | Action |
|---|---|---|
| Created -> Active | After initial write | No action |
| Active -> Archived | No access for 90 days | Move to cold storage |
| Archived -> Deleted | After retention period | Permanent deletion |
| Any -> Frozen | Legal hold | Prevent all modifications |
| Frozen -> Active | Legal hold released | Resume normal access |

---

## Financial Precision (Constitution Law 6)

### Decimal Precision

All monetary values in Perionyx use `Decimal(38,12)`:

```prisma
model Transaction {
  amount   Decimal @db.Decimal(38, 12)
  fee      Decimal @db.Decimal(38, 12)
  tax      Decimal @db.Decimal(38, 12)
}
```

### Precision Tiers

| Tier | Precision | Usage |
|---|---|---|
| **Standard** | `Decimal(38,12)` | All monetary amounts |
| **High** | `Decimal(38,12)` | Tax calculations, allocations |
| **Display** | `Decimal(20,4)` | UI display formatting |

### Financial Precision Helpers

```typescript
// Source: src/lib/financial-precision.ts
financialRound(value, decimals)    // Banker's rounding via Intl.NumberFormat
toDecimal(value)                   // Safe conversion to Decimal
sumDecimals(values)                // Safe aggregation
multiplyDecimals(a, b)            // Safe multiplication
divideDecimals(a, b)              // Safe division with precision
allocateAmount(total, parts)      // Allocation with residual handling
calculateTax(amount, rate)        // Tax calculation
calculateWithholding(amount, rate) // Withholding calculation
```

### Rules

1. **Never use native number arithmetic** for monetary values
2. **Always use `financialRound()`** for rounding (banker's rounding)
3. **Residual handling** in allocations: last target receives `total - sum(previous)`
4. **Display formatting** uses `Intl.NumberFormat` with locale

---

## Encryption Architecture

### At Rest

| Layer | Implementation | Source |
|---|---|---|
| Application | AES-256-GCM via `EncryptionService` | `src/server/security/encryption.ts` |
| Database | PostgreSQL Transparent Data Encryption (TDE) | Infrastructure |
| Storage | S3 server-side encryption (SSE-S3 or SSE-KMS) | Infrastructure |
| Backup | Encrypted backups with separate key | `src/server/recovery/backup-manager.ts` |

### In Transit

| Layer | Implementation |
|---|---|
| Client -> Server | TLS 1.3 (HSTS enforced) |
| Server -> Database | TLS 1.3 (PgBouncer) |
| Server -> Redis | TLS 1.3 |
| Server -> External APIs | TLS 1.3 |
| Internal services | TLS 1.3 (service mesh) |

### Key Management

| Aspect | Strategy |
|---|---|
| Key generation | `crypto.randomBytes(32)` (64 hex characters) |
| Key rotation | Supported via `ENCRYPTION_KEY_HISTORY` |
| Key storage | Environment variables (never in code) |
| KMS integration | Pluggable `KMSProvider` interface |
| Key validation | Startup check rejects known insecure keys |

---

## Data Partitioning

### Tenant Partitioning

Every Prisma model with sensitive data includes `companyId`:

```prisma
model Transaction {
  companyId String
  @@index([companyId])
  @@index([companyId, createdAt])
}
```

### Time Partitioning (Large Tables)

| Table | Partition Key | Strategy |
|---|---|---|
| Audit records | `createdAt` | Monthly partitions |
| Events | `timestamp` | Monthly partitions |
| Transactions | `createdAt` | Quarterly partitions |
| Sync logs | `syncedAt` | Monthly partitions |

### Partition Management

- Auto-create future partitions (3 months ahead)
- Auto-drop expired partitions (after retention)
- Maintain indexes on partition keys

---

## Backup Strategy

### Backup Schedule

| Component | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL full | Daily 02:00 UTC | 30 days | `pg_dump` |
| PostgreSQL WAL | Continuous | 7 days | WAL archiving |
| Redis RDB | Every 6 hours | 7 days | RDB snapshots |
| Object storage | Continuous | 30 days | Versioning |
| Configuration | On change | 90 days | Git |

### Backup Encryption

| Aspect | Strategy |
|---|---|
| Encryption key | Separate from production key |
| Key storage | External secret manager |
| Verification | Weekly restore test |

### Backup Verification

```typescript
// Source: src/server/recovery/backup-manager.ts
interface BackupManager {
  createBackup(options: BackupOptions): Promise<BackupResult>;
  listBackups(): Promise<BackupInfo[]>;
  verifyBackup(backupId: string): Promise<VerificationResult>;
}
```

---

## Restore Strategy

### Restore Types

| Type | Scope | RPO | Time |
|---|---|---|---|
| **Point-in-time** | Database to specific timestamp | < 1 hour | 5-30 min |
| **Full restore** | Complete database from backup | 24 hours | 1-4 hours |
| **Granular** | Specific tables or rows | < 1 hour | 10-60 min |
| **Cross-region** | Restore to different region | 24 hours | 1-4 hours |

### Restore Process

```
1. Identify restore target (timestamp, backup ID)
2. Stop writes to affected tables (if needed)
3. Restore from backup
4. Apply WAL logs (for point-in-time)
5. Validate data integrity
6. Resume operations
7. Audit log the restore
```

---

## Archiving Strategy

### Archive Policy

| Data Age | Action | Storage |
|---|---|---|
| 0-90 days | Active | Primary DB |
| 90 days - 1 year | Warm archive | Compressed DB tables |
| 1-7 years | Cold archive | Object storage (S3 Glacier) |
| 7+ years | Deletion (unless regulated) | None |

### Archive Process

```
1. Identify records older than 90 days
2. Export to compressed format (Parquet/CSV)
3. Store in object storage with encryption
4. Mark original records as archived
5. Verify archive integrity
6. Update data lineage records
```

---

## Deletion Strategy

### Deletion Types

| Type | Description | Use Case |
|---|---|---|
| **Soft delete** | Set `deletedAt` timestamp | Users, configurations |
| **Hard delete** | Remove all records | GDPR right to erasure |
| **Anonymize** | Replace with anonymous data | Analytics, testing |
| **Purge** | Permanent removal after retention | All expired data |

### Right to Erasure (GDPR Art. 17)

```
1. Receive erasure request
2. Verify identity and right
3. Check legal hold status
4. Check retention requirements
5. Soft delete personal data
6. Anonymize aggregated data
7. Notify downstream systems
8. Log erasure action
9. Confirm completion to requester
```

### Deletion Restrictions

| Restriction | Description |
|---|---|
| Legal hold | Cannot delete data under legal hold |
| Active transaction | Cannot delete entity with active transactions |
| Regulatory retention | Cannot delete data required by regulation |
| Audit trail | Cannot delete audit records (anonymize instead) |
| Financial records | Cannot delete records < 7 years old |

---

## Legal Hold

### Hold Process

```
1. Legal team requests hold
2. System marks affected records as frozen
3. All modifications blocked
4. Deletion blocked
5. Hold tracked with reason and date
6. Regular hold review (quarterly)
7. Release: unfreeze records
```

### Hold Metadata

```typescript
interface LegalHold {
  id: string;
  companyId: string;
  reason: string;
  requestedBy: string;
  requestedAt: Date;
  releasedAt?: Date;
  affectedTables: string[];
  affectedRecordCount: number;
}
```

---

## Data Lineage

### Lineage Tracking

```typescript
interface DataLineage {
  entityId: string;
  entityType: string;
  companyId: string;
  source: string;         // Origin system or integration
  createdAt: Date;
  createdBy: string;
  transformations: Array<{
    operation: string;    // "import", "transform", "merge"
    timestamp: Date;
    userId?: string;
    sourceEventId?: string;
  }>;
}
```

### Lineage Use Cases

| Use Case | Description |
|---|---|
| Audit trail | Track data origin for compliance |
| Debugging | Understand how data was created/modified |
| Impact analysis | Identify affected data when source changes |
| Regulatory | Prove data provenance for regulators |

---

## Data Masking

### Masking Rules

| Classification | Non-Production Masking |
|---|---|
| Public | No masking |
| Internal | No masking |
| Confidential | Partial masking (email: `j***@example.com`) |
| Restricted | Full masking (amount: `$***.**`) |
| Regulated | Irreversible hashing or randomization |

### Masking Implementation

```typescript
interface DataMasker {
  maskEmail(email: string): string;
  maskPhone(phone: string): string;
  maskSSN(ssn: string): string;
  maskCardNumber(number: string): string;
  maskAmount(amount: number): string;
  anonymizeRecord(record: Record<string, unknown>): Record<string, unknown>;
}
```

---

## PII Detection and Handling

### PII Fields

| Field Type | Examples | Classification | Handling |
|---|---|---|---|
| **Name** | firstName, lastName | Restricted | Encrypt at rest |
| **Email** | email, contactEmail | Restricted | Encrypt at rest |
| **Phone** | phone, mobile | Restricted | Encrypt at rest |
| **Address** | address, zipCode | Restricted | Encrypt at rest |
| **Financial** | accountNumber, routingNumber | Regulated | Encrypt + mask |
| **Tax** | taxId, ssn | Regulated | Encrypt + mask |
| **Health** | insuranceId | Regulated | Encrypt + restrict |

### PII Handling Rules

1. **Never log PII** — Pino redaction handles `auth`, `cookie`, `password`, `secret`
2. **Never commit PII** — Git hooks prevent secrets in commits
3. **Encrypt PII at rest** — AES-256-GCM via `EncryptionService`
4. **Access PII only with permission** — Explicit permission required
5. **Mask PII in non-production** — Automated masking in dev/staging
6. **Delete PII on request** — GDPR right to erasure support

---

## Schema Evolution

### Migration Rules

1. **Forward-only** — Migrations never reversed
2. **Backward compatible** — New columns have defaults; old code works
3. **Zero-downtime** — No blocking operations during migration
4. **Tested** — Every migration tested in staging
5. **Reversible design** — Every destructive change has recovery path

### Migration Workflow

```
1. Write migration (forward-only)
2. Test in staging (prisma migrate dev)
3. Review migration SQL
4. Deploy application (backward compatible)
5. Run migration (prisma migrate deploy)
6. Validate (prisma validate)
7. Monitor (error rates, latency)
```

### Schema Versioning

| Aspect | Strategy |
|---|---|
| Prisma schema | Version-controlled in Git |
| Migrations | `prisma/migrations/` directory |
| Version tracking | `schema_version` table |
| Compatibility | Application handles N-1 schema version |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `data_records_total` | Gauge | table, classification, company_id |
| `data_storage_bytes` | Gauge | table, classification |
| `data_backup_size_bytes` | Gauge | component |
| `data_backup_duration_seconds` | Histogram | component |
| `data_restore_duration_seconds` | Histogram | component |
| `data_encryption_ops_total` | Counter | operation, status |
| `data_masking_ops_total` | Counter | entity_type |
| `data_deletion_total` | Counter | type, reason |
| `data_migration_duration_seconds` | Histogram | migration_name |
| `data_lineage_events_total` | Counter | source |

---

## Rate Limiting

| Operation | Limit | Window |
|---|---|---|
| Data export | 10/hour per tenant | Sliding |
| Bulk delete | 5/hour per tenant | Sliding |
| Backup creation | 4/day per tenant | Sliding |
| Restore operations | 2/day per tenant | Sliding |
| Schema migration | 1/hour per tenant | Sliding |

---

## Testing Strategy

| Test Type | Scope |
|---|---|
| Unit | Financial precision, masking, classification |
| Integration | Backup/restore, encryption round-trip |
| Compliance | PII detection, retention policy, deletion |
| Chaos | Database failure, backup corruption |
| Performance | Large table migration, archive performance |
| Recovery | Full disaster recovery drill |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Backup corruption | Cannot restore | Verified backups, multiple copies |
| Encryption key loss | Data unreadable | Key history, backup key |
| Migration failure | Schema inconsistency | Rollback migration, fix forward |
| PII leak in logs | Compliance violation | Pino redaction, log review |
| Deletion during active transaction | Data inconsistency | Transaction-level locks |
| Archive failure | Storage growth | Retry, alert, manual intervention |
| Legal hold conflict | Cannot delete regulated data | Hold check before deletion |

---

## Key Source Files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | 374 models, 11,390 lines |
| `src/server/persistence/` | 42+ files, 4 DB adapters |
| `src/server/persistence/domain/persistence-errors.ts` | Error hierarchy |
| `src/server/persistence/config.ts` | Infrastructure configuration |
| `src/server/security/encryption.ts` | AES-256-GCM encryption |
| `src/lib/financial-precision.ts` | Financial precision helpers |
| `src/server/recovery/backup-manager.ts` | Backup management |
| `src/server/recovery/restore-manager.ts` | Restore management |
| `src/server/recovery/snapshot-manager.ts` | Snapshot management |
| `src/server/recovery/recovery-validator.ts` | Recovery validation |
| `src/server/persistence/migrations/` | Migration framework |
| `src/server/persistence/versioning/` | Schema versioning |

---

*The Data Architecture ensures that every piece of data in Perionyx is classified, encrypted, backed up, and handled according to its sensitivity. Data is the most valuable asset — its protection is non-negotiable.*
