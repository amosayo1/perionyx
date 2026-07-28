/**
 * Enterprise Secret Management Platform — Secret Manager
 *
 * Phase 24.0
 *
 * Central facade for secret operations.
 * Business code never accesses secrets directly — always through this manager.
 */

import {
  ISecretProvider,
  SecretProviderType,
  SecretMetadata,
  SecretCategory,
  SecretReference,
  RotationPolicy,
  RotationRecord,
  SecretAuditEntry,
  SecretAuditAction,
} from "./types";
import { EnvironmentSecretProvider } from "./providers/environment";
import { BoundedRingBuffer } from "@/lib/bounded-ring-buffer";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "secret-manager" });

// ── Secret Manager ───────────────────────────────────────────────────────────

export class SecretManager {
  private static instance: SecretManager;
  private providers = new Map<SecretProviderType, ISecretProvider>();
  private metadata = new Map<string, SecretMetadata>();
  private rotationPolicies = new Map<string, RotationPolicy>();
  private rotationHistory = new BoundedRingBuffer<RotationRecord>(10_000);
  private auditLog = new BoundedRingBuffer<SecretAuditEntry>(10_000);
  private defaultProvider: SecretProviderType = SecretProviderType.ENVIRONMENT;

  static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  constructor() {
    // Register environment provider as default
    this.registerProvider(new EnvironmentSecretProvider());
  }

  // ── Provider Management ──────────────────────────────────────────────────

  registerProvider(provider: ISecretProvider): void {
    this.providers.set(provider.type, provider);
  }

  setDefaultProvider(type: SecretProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Provider '${type}' is not registered.`);
    }
    this.defaultProvider = type;
  }

  // ── Initialization ───────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.initialize();
    }
  }

  // ── Secret Operations ────────────────────────────────────────────────────

  /**
   * Get a secret value. Returns null if not found.
   * Business code should use this method — never access providers directly.
   */
  async getSecret(secretId: string, performedBy: string): Promise<string | null> {
    const meta = this.metadata.get(secretId);
    if (!meta) {
      this.recordAudit(secretId, "SECRET_ACCESS_DENIED", performedBy, { reason: "Secret not found" });
      return null;
    }

    if (!meta.active) {
      this.recordAudit(secretId, "SECRET_ACCESS_DENIED", performedBy, { reason: "Secret deactivated" });
      return null;
    }

    const provider = this.providers.get(meta.provider);
    if (!provider) {
      this.recordAudit(secretId, "SECRET_ACCESS_DENIED", performedBy, { reason: `Provider '${meta.provider}' not available` });
      return null;
    }

    this.recordAudit(secretId, "SECRET_READ", performedBy);
    return provider.getSecret(meta.providerKey);
  }

  /**
   * Get a secret as a reference (no value). Safe to pass through the system.
   */
  getSecretReference(secretId: string): SecretReference | null {
    const meta = this.metadata.get(secretId);
    if (!meta) return null;

    return {
      secretId: meta.id,
      secretName: meta.name,
      provider: meta.provider,
      providerKey: meta.providerKey,
      version: meta.version,
    };
  }

  /**
   * Resolve a SecretReference to its actual value.
   */
  async resolveReference(ref: SecretReference, performedBy: string): Promise<string | null> {
    return this.getSecret(ref.secretId, performedBy);
  }

  /**
   * Create a new secret.
   */
  async createSecret(input: {
    name: string;
    value: string;
    category: SecretCategory;
    provider?: SecretProviderType;
    tenantId?: string;
    ownerId: string;
    description?: string;
    rotationPolicy?: RotationPolicy;
  }): Promise<SecretMetadata> {
    const providerType = input.provider ?? this.defaultProvider;
    const provider = this.providers.get(providerType);
    if (!provider) throw new Error(`Provider '${providerType}' not registered.`);

    const id = `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const providerKey = `${input.tenantId ?? "global"}/${input.name}`;

    // Store the secret value
    await provider.setSecret(providerKey, input.value);

    // Create metadata
    const meta: SecretMetadata = {
      id,
      name: input.name,
      category: input.category,
      provider: providerType,
      providerKey,
      tenantId: input.tenantId ?? null,
      createdAt: new Date(),
      lastRotatedAt: null,
      expiresAt: null,
      rotationIntervalDays: input.rotationPolicy?.intervalDays ?? null,
      ownerId: input.ownerId,
      description: input.description ?? "",
      active: true,
      version: 1,
    };

    this.metadata.set(id, meta);
    log.info({ secretId: id, name: input.name, category: input.category }, "Secret created");

    if (input.rotationPolicy) {
      this.rotationPolicies.set(id, input.rotationPolicy);
    }

    this.recordAudit(id, "SECRET_CREATE", input.ownerId, { name: input.name, category: input.category });

    return meta;
  }

  /**
   * Rotate a secret value.
   */
  async rotateSecret(secretId: string, newValue: string, performedBy: string, reason: string): Promise<void> {
    const meta = this.metadata.get(secretId);
    if (!meta) throw new Error(`Secret '${secretId}' not found.`);

    const provider = this.providers.get(meta.provider);
    if (!provider) throw new Error(`Provider '${meta.provider}' not available.`);

    const previousVersion = meta.version;

    // Store new value
    await provider.setSecret(meta.providerKey, newValue);

    // Update metadata
    meta.lastRotatedAt = new Date();
    meta.version += 1;

    // Record rotation
    this.rotationHistory.push({
      id: `rot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      secretId,
      rotatedAt: new Date(),
      rotatedBy: performedBy,
      previousVersion,
      newVersion: meta.version,
      reason,
    });

    this.recordAudit(secretId, "SECRET_ROTATE", performedBy, { reason, previousVersion, newVersion: meta.version });
    log.info({ secretId, rotatedBy: performedBy, previousVersion, newVersion: meta.version }, "Secret rotated");
  }

  /**
   * Delete (deactivate) a secret.
   */
  async deleteSecret(secretId: string, performedBy: string): Promise<boolean> {
    const meta = this.metadata.get(secretId);
    if (!meta) return false;

    const provider = this.providers.get(meta.provider);
    if (provider) {
      await provider.deleteSecret(meta.providerKey);
    }

    meta.active = false;
    this.recordAudit(secretId, "SECRET_DELETE", performedBy);
    log.info({ secretId, performedBy }, "Secret deleted");

    return true;
  }

  /**
   * Get all secret metadata (no values).
   */
  listSecrets(tenantId: string): SecretMetadata[] {
    return Array.from(this.metadata.values()).filter((m) => {
      return m.tenantId === tenantId || m.tenantId === null;
    });
  }

  /**
   * Check if a secret is expired or about to expire.
   */
  checkExpiration(secretId: string): { expired: boolean; expiresSoon: boolean; daysUntilExpiry: number | null } {
    const meta = this.metadata.get(secretId);
    if (!meta || !meta.expiresAt) {
      return { expired: false, expiresSoon: false, daysUntilExpiry: null };
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil((meta.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      expired: daysUntilExpiry <= 0,
      expiresSoon: daysUntilExpiry <= 30,
      daysUntilExpiry,
    };
  }

  /**
   * Health check all providers.
   */
  async healthCheck(): Promise<Record<string, { healthy: boolean; latencyMs: number; error?: string }>> {
    const results: Record<string, { healthy: boolean; latencyMs: number; error?: string }> = {};
    for (const [type, provider] of this.providers) {
      results[type] = await provider.healthCheck();
    }
    return results;
  }

  // ── Audit ────────────────────────────────────────────────────────────────

  getAuditLog(secretId?: string): SecretAuditEntry[] {
    if (secretId) return this.auditLog.filter((e) => e.secretId === secretId);
    return [...this.auditLog.getAll()];
  }

  private recordAudit(secretId: string, action: SecretAuditAction, performedBy: string, metadata: Record<string, unknown> = {}): void {
    this.auditLog.push({
      id: `sec_a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      secretId,
      action,
      performedBy,
      timestamp: new Date(),
      metadata,
    });
  }
}

export const secretManager = SecretManager.getInstance();
