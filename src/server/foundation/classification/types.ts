/**
 * Enterprise Data Classification Platform — Types
 *
 * Phase 24.0 | Constitutional Law 13: Data Classification Governs Handling
 *
 * Every piece of data inside Perionyx must have a known classification.
 * No persisted entity should exist without classification.
 */

// ── Classification Taxonomy ──────────────────────────────────────────────────

/**
 * Core classification levels. Higher number = higher sensitivity.
 * Classification determines: encryption, access control, retention, masking, audit.
 */
export enum DataClassification {
  /** Publicly available data. No restrictions. */
  PUBLIC = "PUBLIC",

  /** Internal data. Visible to all authenticated users. */
  INTERNAL = "INTERNAL",

  /** Confidential data. Visible to authorized roles only. */
  CONFIDENTIAL = "CONFIDENTIAL",

  /** Restricted data. Requires explicit grant. MFA recommended. */
  RESTRICTED = "RESTRICTED",

  /** Regulated data. Subject to regulatory compliance (SOX, PCI DSS, GDPR). */
  REGULATED = "REGULATED",

  /** Financial data. Monetary values, balances, transactions. */
  FINANCIAL = "FINANCIAL",

  /** Personally identifiable information. Names, emails, SSNs, addresses. */
  PII = "PII",

  /** Payment card data. Card numbers, CVVs, expiry dates. Subject to PCI DSS. */
  PCI = "PCI",

  /** Secrets. API keys, passwords, tokens, certificates. */
  SECRETS = "SECRETS",

  /** Audit records. Tamper-evident. Append-only. */
  AUDIT = "AUDIT",

  /** System data. Internal metadata, configuration, diagnostics. */
  SYSTEM = "SYSTEM",
}

/**
 * Sensitivity score derived from classification level.
 * Higher score = stricter handling requirements.
 */
export const CLASSIFICATION_SENSITIVITY: Record<DataClassification, number> = {
  [DataClassification.PUBLIC]: 0,
  [DataClassification.INTERNAL]: 1,
  [DataClassification.SYSTEM]: 1,
  [DataClassification.CONFIDENTIAL]: 3,
  [DataClassification.AUDIT]: 3,
  [DataClassification.FINANCIAL]: 4,
  [DataClassification.PII]: 5,
  [DataClassification.RESTRICTED]: 6,
  [DataClassification.REGULATED]: 7,
  [DataClassification.PCI]: 8,
  [DataClassification.SECRETS]: 10,
};

// ── Policy Types ─────────────────────────────────────────────────────────────

export interface MaskingPolicy {
  /** How to mask the data when displayed to unauthorized users. */
  strategy: "NONE" | "HASH" | "REDACT" | "PARTIAL" | "TOKENIZE";
  /** For PARTIAL masking: how many characters to show (e.g., last 4 of SSN). */
  visibleChars?: number;
  /** For PARTIAL masking: position to start showing (e.g., "END", "START"). */
  visiblePosition?: "START" | "END";
  /** Replacement character for REDACT strategy. */
  redactChar?: string;
}

export interface EncryptionPolicy {
  /** Whether encryption at rest is required. */
  required: boolean;
  /** Encryption algorithm. */
  algorithm?: "AES-256-GCM" | "AES-256-CBC" | "ChaCha20-Poly1305";
  /** Whether field-level encryption is needed (vs. page-level). */
  fieldLevel?: boolean;
  /** Whether encryption in transit is required (beyond TLS). */
  inTransit?: boolean;
}

export interface RetentionPolicy {
  /** How long to retain data (in days). null = indefinite. */
  retentionDays: number | null;
  /** Whether legal hold overrides retention. */
  legalHoldOverride: boolean;
  /** Deletion strategy after retention expires. */
  deletionStrategy: "HARD_DELETE" | "SOFT_DELETE" | "ANONYMIZE" | "ARCHIVE";
  /** Whether to create an audit record before deletion. */
  auditBeforeDeletion: boolean;
}

export interface AccessPolicy {
  /** Minimum role required to access this classification level. */
  minimumRole: string;
  /** Whether MFA is required for access. */
  requireMfa: boolean;
  /** Whether access requires explicit approval. */
  requireApproval: boolean;
  /** Specific permissions required (AND logic). */
  requiredPermissions: string[];
  /** Whether to log every access attempt (not just mutations). */
  logAllAccess: boolean;
}

export interface ClassificationPolicy {
  classification: DataClassification;
  sensitivity: number;
  masking: MaskingPolicy;
  encryption: EncryptionPolicy;
  retention: RetentionPolicy;
  access: AccessPolicy;
  /** Whether audit logging is mandatory for this classification. */
  auditRequired: boolean;
  /** Whether data of this classification can be exported. */
  exportAllowed: boolean;
  /** Whether data of this classification can be shared cross-tenant. */
  crossTenantAllowed: boolean;
  /** Description for developers. */
  description: string;
}

// ── Classification Metadata ──────────────────────────────────────────────────

/**
 * Entity-level classification metadata.
 * Attached to every Prisma model via a mixin or wrapper.
 */
export interface ClassificationMetadata {
  /** Classification of the entire entity/record. */
  entityClassification: DataClassification;
  /** Per-field classifications for sensitive fields. */
  fieldClassifications: Record<string, DataClassification>;
  /** Who classified this entity. */
  classifiedBy: string;
  /** When classification was last reviewed. */
  lastReviewedAt: string | null;
  /** Classification rationale. */
  rationale: string | null;
}

/**
 * Field-level classification descriptor.
 * Maps a field name to its classification and handling requirements.
 */
export interface FieldClassification {
  fieldName: string;
  classification: DataClassification;
  /** Override entity-level masking for this field. */
  maskingOverride?: MaskingPolicy;
  /** Override entity-level encryption for this field. */
  encryptionOverride?: EncryptionPolicy;
  /** Whether this field is nullable (affects masking behavior). */
  nullable: boolean;
}

// ── Classification Request/Response Types ────────────────────────────────────

export interface ClassifyEntityInput {
  entityType: string;
  entityId: string;
  companyId: string;
  classification: DataClassification;
  fieldClassifications?: Record<string, DataClassification>;
  rationale?: string;
  classifiedBy: string;
}

export interface ClassificationCheckResult {
  allowed: boolean;
  classification: DataClassification;
  policy: ClassificationPolicy;
  reason: string | null;
  /** If denied, the required permission/role. */
  requiredPermission: string | null;
}

export interface MaskedData {
  original: unknown;
  masked: unknown;
  classification: DataClassification;
  strategy: MaskingPolicy["strategy"];
}

// ── Registry Types ───────────────────────────────────────────────────────────

export interface ClassificationRegistryEntry {
  entityType: string;
  fieldName: string;
  classification: DataClassification;
  policy: ClassificationPolicy;
  registeredAt: Date;
}

export interface ClassificationAuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  companyId: string;
  action: "CLASSIFY" | "RECLASSIFY" | "ACCESS_CHECK" | "MASK" | "ENCRYPT" | "DELETE";
  classification: DataClassification;
  previousClassification: DataClassification | null;
  performedBy: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
