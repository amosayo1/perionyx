/**
 * Enterprise Secret Management Platform — Types
 *
 * Phase 24.0
 *
 * Secrets never belong inside business modules.
 * Every secret is abstracted behind a provider interface.
 */

// ── Secret Types ─────────────────────────────────────────────────────────────

export interface SecretMetadata {
  /** Unique secret identifier. */
  id: string;
  /** Human-readable name (e.g., "plaid-client-id", "openai-api-key"). */
  name: string;
  /** Secret category for grouping. */
  category: SecretCategory;
  /** Which provider stores this secret. */
  provider: SecretProviderType;
  /** Provider-specific path/key. */
  providerKey: string;
  /** Tenant that owns this secret (null = global). */
  tenantId: string | null;
  /** When the secret was created. */
  createdAt: Date;
  /** When the secret was last rotated. */
  lastRotatedAt: Date | null;
  /** When the secret expires (null = never). */
  expiresAt: Date | null;
  /** Rotation interval in days (null = no automatic rotation). */
  rotationIntervalDays: number | null;
  /** Who owns this secret (responsible for rotation). */
  ownerId: string;
  /** Description. */
  description: string;
  /** Whether this secret is currently active. */
  active: boolean;
  /** Version number (incremented on each rotation). */
  version: number;
}

export enum SecretCategory {
  API_KEY = "API_KEY",
  DATABASE_CREDENTIAL = "DATABASE_CREDENTIAL",
  OAUTH_TOKEN = "OAUTH_TOKEN",
  ENCRYPTION_KEY = "ENCRYPTION_KEY",
  WEBHOOK_SECRET = "WEBHOOK_SECRET",
  SERVICE_ACCOUNT = "SERVICE_ACCOUNT",
  TLS_CERTIFICATE = "TLS_CERTIFICATE",
  JWT_SIGNING_KEY = "JWT_SIGNING_KEY",
  OTHER = "OTHER",
}

export enum SecretProviderType {
  /** Read from environment variables. Default for development. */
  ENVIRONMENT = "ENVIRONMENT",
  /** HashiCorp Vault. Production-ready. */
  VAULT = "VAULT",
  /** AWS Secrets Manager. */
  AWS_SECRETS_MANAGER = "AWS_SECRETS_MANAGER",
  /** Azure Key Vault. */
  AZURE_KEY_VAULT = "AZURE_KEY_VAULT",
  /** GCP Secret Manager. */
  GCP_SECRET_MANAGER = "GCP_SECRET_MANAGER",
}

// ── Secret Provider Interface ────────────────────────────────────────────────

export interface ISecretProvider {
  /** Provider type identifier. */
  readonly type: SecretProviderType;

  /** Initialize the provider (connect, authenticate). */
  initialize(): Promise<void>;

  /** Get a secret value by key. */
  getSecret(key: string): Promise<string | null>;

  /** Set/update a secret value. */
  setSecret(key: string, value: string): Promise<void>;

  /** Delete a secret. */
  deleteSecret(key: string): Promise<boolean>;

  /** Check if a secret exists. */
  hasSecret(key: string): Promise<boolean>;

  /** List all secrets matching a prefix. */
  listSecrets(prefix: string): Promise<SecretMetadata[]>;

  /** Health check. */
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }>;
}

// ── Secret Reference (no raw values) ─────────────────────────────────────────

/**
 * A SecretReference is passed through the system instead of raw secret values.
 * Business code never handles raw secrets — only references.
 */
export interface SecretReference {
  /** The secret ID (not the value). */
  secretId: string;
  /** The secret name (human-readable). */
  secretName: string;
  /** Provider type. */
  provider: SecretProviderType;
  /** Provider-specific key. */
  providerKey: string;
  /** Version at time of reference. */
  version: number;
}

// ── Rotation Types ───────────────────────────────────────────────────────────

export interface RotationPolicy {
  /** Rotation interval in days. */
  intervalDays: number;
  /** Whether to auto-rotate. */
  autoRotate: boolean;
  /** Number of days before expiry to trigger rotation. */
  advanceWarningDays: number;
  /** Notification recipients for rotation events. */
  notifyOwners: string[];
}

export interface RotationRecord {
  id: string;
  secretId: string;
  rotatedAt: Date;
  rotatedBy: string;
  previousVersion: number;
  newVersion: number;
  reason: string;
}

// ── Audit Types ──────────────────────────────────────────────────────────────

export type SecretAuditAction =
  | "SECRET_CREATE"
  | "SECRET_READ"
  | "SECRET_UPDATE"
  | "SECRET_DELETE"
  | "SECRET_ROTATE"
  | "SECRET_ACCESS_DENIED"
  | "SECRET_EXPIRED";

export interface SecretAuditEntry {
  id: string;
  secretId: string;
  action: SecretAuditAction;
  performedBy: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  /** Never log the actual secret value. */
}
