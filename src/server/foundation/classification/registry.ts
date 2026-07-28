/**
 * Enterprise Data Classification Platform — Classification Registry
 *
 * Phase 24.0 | Constitutional Law 13
 *
 * Central registry mapping entity types and fields to their classifications.
 * Every persisted model must register its classification here.
 */

import {
  DataClassification,
  CLASSIFICATION_SENSITIVITY,
  ClassificationPolicy,
  ClassificationRegistryEntry,
  FieldClassification,
  ClassificationMetadata,
  ClassificationCheckResult,
  MaskedData,
  MaskingPolicy,
  ClassifyEntityInput,
  ClassificationAuditEntry,
} from "./types";
import { BoundedRingBuffer } from "@/lib/bounded-ring-buffer";

// ── Default Policies per Classification Level ────────────────────────────────

const DEFAULT_POLICIES: Record<DataClassification, ClassificationPolicy> = {
  [DataClassification.PUBLIC]: {
    classification: DataClassification.PUBLIC,
    sensitivity: 0,
    masking: { strategy: "NONE" },
    encryption: { required: false },
    retention: { retentionDays: null, legalHoldOverride: false, deletionStrategy: "HARD_DELETE", auditBeforeDeletion: false },
    access: { minimumRole: "VIEWER", requireMfa: false, requireApproval: false, requiredPermissions: [], logAllAccess: false },
    auditRequired: false,
    exportAllowed: true,
    crossTenantAllowed: true,
    description: "Publicly available data with no restrictions.",
  },
  [DataClassification.INTERNAL]: {
    classification: DataClassification.INTERNAL,
    sensitivity: 1,
    masking: { strategy: "NONE" },
    encryption: { required: false },
    retention: { retentionDays: 2555, legalHoldOverride: true, deletionStrategy: "SOFT_DELETE", auditBeforeDeletion: true },
    access: { minimumRole: "VIEWER", requireMfa: false, requireApproval: false, requiredPermissions: [], logAllAccess: false },
    auditRequired: false,
    exportAllowed: true,
    crossTenantAllowed: false,
    description: "Internal data visible to all authenticated users within the tenant.",
  },
  [DataClassification.CONFIDENTIAL]: {
    classification: DataClassification.CONFIDENTIAL,
    sensitivity: 3,
    masking: { strategy: "PARTIAL", visibleChars: 4, visiblePosition: "END" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: false },
    retention: { retentionDays: 2555, legalHoldOverride: true, deletionStrategy: "SOFT_DELETE", auditBeforeDeletion: true },
    access: { minimumRole: "ANALYST", requireMfa: false, requireApproval: false, requiredPermissions: [], logAllAccess: false },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Confidential data requiring authorization for access.",
  },
  [DataClassification.RESTRICTED]: {
    classification: DataClassification.RESTRICTED,
    sensitivity: 6,
    masking: { strategy: "REDACT", redactChar: "*" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: true },
    retention: { retentionDays: 1095, legalHoldOverride: true, deletionStrategy: "ANONYMIZE", auditBeforeDeletion: true },
    access: { minimumRole: "MANAGER", requireMfa: true, requireApproval: false, requiredPermissions: [], logAllAccess: true },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Restricted data requiring elevated access and MFA.",
  },
  [DataClassification.REGULATED]: {
    classification: DataClassification.REGULATED,
    sensitivity: 7,
    masking: { strategy: "REDACT", redactChar: "*" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: true, inTransit: true },
    retention: { retentionDays: 2555, legalHoldOverride: true, deletionStrategy: "ANONYMIZE", auditBeforeDeletion: true },
    access: { minimumRole: "ADMIN", requireMfa: true, requireApproval: true, requiredPermissions: ["regulated.view"], logAllAccess: true },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Regulated data subject to SOX, PCI DSS, GDPR, or other regulatory frameworks.",
  },
  [DataClassification.FINANCIAL]: {
    classification: DataClassification.FINANCIAL,
    sensitivity: 4,
    masking: { strategy: "PARTIAL", visibleChars: 4, visiblePosition: "END" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: false },
    retention: { retentionDays: 2555, legalHoldOverride: true, deletionStrategy: "ARCHIVE", auditBeforeDeletion: true },
    access: { minimumRole: "ANALYST", requireMfa: false, requireApproval: false, requiredPermissions: ["financial.view"], logAllAccess: false },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Financial data: monetary values, balances, transactions, reports.",
  },
  [DataClassification.PII]: {
    classification: DataClassification.PII,
    sensitivity: 5,
    masking: { strategy: "PARTIAL", visibleChars: 4, visiblePosition: "END" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: true },
    retention: { retentionDays: 1095, legalHoldOverride: true, deletionStrategy: "ANONYMIZE", auditBeforeDeletion: true },
    access: { minimumRole: "MANAGER", requireMfa: false, requireApproval: false, requiredPermissions: ["pii.view"], logAllAccess: true },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Personally identifiable information: names, emails, SSNs, addresses, phone numbers.",
  },
  [DataClassification.PCI]: {
    classification: DataClassification.PCI,
    sensitivity: 8,
    masking: { strategy: "REDACT", redactChar: "*" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: true, inTransit: true },
    retention: { retentionDays: 365, legalHoldOverride: true, deletionStrategy: "HARD_DELETE", auditBeforeDeletion: true },
    access: { minimumRole: "ADMIN", requireMfa: true, requireApproval: true, requiredPermissions: ["pci.view"], logAllAccess: true },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Payment card data subject to PCI DSS. Card numbers, CVVs, expiry dates.",
  },
  [DataClassification.SECRETS]: {
    classification: DataClassification.SECRETS,
    sensitivity: 10,
    masking: { strategy: "REDACT", redactChar: "•" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: true, inTransit: true },
    retention: { retentionDays: 90, legalHoldOverride: false, deletionStrategy: "HARD_DELETE", auditBeforeDeletion: true },
    access: { minimumRole: "ADMIN", requireMfa: true, requireApproval: true, requiredPermissions: ["secrets.manage"], logAllAccess: true },
    auditRequired: true,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Secrets: API keys, passwords, tokens, certificates. Never logged. Never exported.",
  },
  [DataClassification.AUDIT]: {
    classification: DataClassification.AUDIT,
    sensitivity: 3,
    masking: { strategy: "NONE" },
    encryption: { required: true, algorithm: "AES-256-GCM", fieldLevel: false },
    retention: { retentionDays: 3650, legalHoldOverride: true, deletionStrategy: "ARCHIVE", auditBeforeDeletion: false },
    access: { minimumRole: "MANAGER", requireMfa: false, requireApproval: false, requiredPermissions: ["audit.view"], logAllAccess: false },
    auditRequired: false,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "Audit records. Append-only. Tamper-evident. 10-year retention minimum.",
  },
  [DataClassification.SYSTEM]: {
    classification: DataClassification.SYSTEM,
    sensitivity: 1,
    masking: { strategy: "NONE" },
    encryption: { required: false },
    retention: { retentionDays: 365, legalHoldOverride: false, deletionStrategy: "SOFT_DELETE", auditBeforeDeletion: false },
    access: { minimumRole: "VIEWER", requireMfa: false, requireApproval: false, requiredPermissions: [], logAllAccess: false },
    auditRequired: false,
    exportAllowed: false,
    crossTenantAllowed: false,
    description: "System data: internal metadata, configuration, diagnostics.",
  },
};

// ── Classification Registry ──────────────────────────────────────────────────

export class ClassificationRegistry {
  private static instance: ClassificationRegistry;
  private entries = new Map<string, ClassificationRegistryEntry>();
  private entityClassifications = new Map<string, DataClassification>();
  private auditLog = new BoundedRingBuffer<ClassificationAuditEntry>(10_000);

  static getInstance(): ClassificationRegistry {
    if (!ClassificationRegistry.instance) {
      ClassificationRegistry.instance = new ClassificationRegistry();
    }
    return ClassificationRegistry.instance;
  }

  // ── Registration ─────────────────────────────────────────────────────────

  /**
   * Register a field-level classification.
   */
  registerField(
    entityType: string,
    fieldName: string,
    classification: DataClassification,
  ): void {
    const key = `${entityType}.${fieldName}`;
    const policy = this.getPolicy(classification);
    this.entries.set(key, {
      entityType,
      fieldName,
      classification,
      policy,
      registeredAt: new Date(),
    });
  }

  /**
   * Register an entity-level classification.
   * All fields inherit this classification unless overridden.
   */
  registerEntity(
    entityType: string,
    classification: DataClassification,
    fieldOverrides?: Record<string, DataClassification>,
  ): void {
    this.entityClassifications.set(entityType, classification);

    // Register entity-level as a pseudo-field
    this.registerField(entityType, "__entity__", classification);

    // Register field overrides
    if (fieldOverrides) {
      for (const [field, fieldClass] of Object.entries(fieldOverrides)) {
        this.registerField(entityType, field, fieldClass);
      }
    }
  }

  // ── Lookup ───────────────────────────────────────────────────────────────

  /**
   * Get the classification for a specific field.
   * Falls back to entity-level classification if no field-specific registration exists.
   */
  getClassification(entityType: string, fieldName: string): DataClassification {
    const key = `${entityType}.${fieldName}`;
    const entry = this.entries.get(key);
    if (entry) return entry.classification;

    // Fall back to entity-level
    const entityClass = this.entityClassifications.get(entityType);
    if (entityClass) return entityClass;

    // Default: INTERNAL
    return DataClassification.INTERNAL;
  }

  /**
   * Get the full policy for a classification level.
   */
  getPolicy(classification: DataClassification): ClassificationPolicy {
    return DEFAULT_POLICIES[classification];
  }

  /**
   * Get all registered fields for an entity type.
   */
  getEntityFields(entityType: string): FieldClassification[] {
    const fields: FieldClassification[] = [];
    for (const [key, entry] of this.entries) {
      if (key.startsWith(`${entityType}.`) && entry.fieldName !== "__entity__") {
        fields.push({
          fieldName: entry.fieldName,
          classification: entry.classification,
          nullable: false, // Caller should override with schema info
        });
      }
    }
    return fields;
  }

  /**
   * Get entity-level classification.
   */
  getEntityClassification(entityType: string): DataClassification | undefined {
    return this.entityClassifications.get(entityType);
  }

  // ── Access Control ───────────────────────────────────────────────────────

  /**
   * Check if a user can access data of a given classification.
   */
  checkAccess(
    classification: DataClassification,
    userRole: string,
    userPermissions: string[],
    hasMfa: boolean,
  ): ClassificationCheckResult {
    const policy = this.getPolicy(classification);
    const roleHierarchy = ["VIEWER", "ANALYST", "MANAGER", "ADMIN", "OWNER"];

    const userRoleLevel = roleHierarchy.indexOf(userRole.toUpperCase());
    const requiredRoleLevel = roleHierarchy.indexOf(policy.access.minimumRole);

    // Check role
    if (userRoleLevel < requiredRoleLevel) {
      return {
        allowed: false,
        classification,
        policy,
        reason: `Requires ${policy.access.minimumRole} role or higher. Current: ${userRole}.`,
        requiredPermission: policy.access.minimumRole,
      };
    }

    // Check MFA
    if (policy.access.requireMfa && !hasMfa) {
      return {
        allowed: false,
        classification,
        policy,
        reason: `MFA required for ${classification} data.`,
        requiredPermission: "mfa.enroll",
      };
    }

    // Check permissions
    for (const perm of policy.access.requiredPermissions) {
      if (!userPermissions.includes(perm)) {
        return {
          allowed: false,
          classification,
          policy,
          reason: `Missing required permission: ${perm}.`,
          requiredPermission: perm,
        };
      }
    }

    return {
      allowed: true,
      classification,
      policy,
      reason: null,
      requiredPermission: null,
    };
  }

  // ── Masking ──────────────────────────────────────────────────────────────

  /**
   * Mask data according to its classification policy.
   */
  maskData(value: unknown, classification: DataClassification, fieldOverride?: MaskingPolicy): MaskedData {
    const policy = this.getPolicy(classification);
    const masking = fieldOverride ?? policy.masking;

    if (masking.strategy === "NONE" || value == null) {
      return { original: value, masked: value, classification, strategy: masking.strategy };
    }

    const strValue = String(value);

    switch (masking.strategy) {
      case "REDACT":
        return {
          original: value,
          masked: (masking.redactChar ?? "*").repeat(strValue.length),
          classification,
          strategy: "REDACT",
        };

      case "PARTIAL": {
        const chars = masking.visibleChars ?? 4;
        const pos = masking.visiblePosition ?? "END";
        const redacted = "*".repeat(Math.max(0, strValue.length - chars));
        if (pos === "END") {
          return {
            original: value,
            masked: redacted + strValue.slice(-chars),
            classification,
            strategy: "PARTIAL",
          };
        }
        return {
          original: value,
          masked: strValue.slice(0, chars) + redacted,
          classification,
          strategy: "PARTIAL",
        };
      }

      case "HASH":
        return {
          original: value,
          masked: `[HASH:${this.simpleHash(strValue)}]`,
          classification,
          strategy: "HASH",
        };

      case "TOKENIZE":
        return {
          original: value,
          masked: `[TOKEN:${this.simpleHash(strValue).slice(0, 8)}]`,
          classification,
          strategy: "TOKENIZE",
        };

      default:
        return { original: value, masked: value, classification, strategy: "NONE" };
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────

  /**
   * Validate that an entity type has been registered.
   */
  validateRegistration(entityType: string): { valid: boolean; missing: string[] } {
    const entityClass = this.entityClassifications.get(entityType);
    if (!entityClass) {
      return { valid: false, missing: [`Entity type '${entityType}' not registered`] };
    }
    return { valid: true, missing: [] };
  }

  /**
   * Get all registered entity types.
   */
  getRegisteredEntityTypes(): string[] {
    return Array.from(this.entityClassifications.keys());
  }

  /**
   * Get the sensitivity score for a classification.
   */
  getSensitivity(classification: DataClassification): number {
    return CLASSIFICATION_SENSITIVITY[classification];
  }

  // ── Audit ────────────────────────────────────────────────────────────────

  recordAudit(entry: Omit<ClassificationAuditEntry, "id" | "timestamp">): void {
    this.auditLog.push({
      ...entry,
      id: `cls_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
    });
  }

  getAuditLog(entityType?: string, entityId?: string): ClassificationAuditEntry[] {
    return this.auditLog.filter((e) => {
      if (entityType && e.entityType !== entityType) return false;
      if (entityId && e.entityId !== entityId) return false;
      return true;
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private simpleHash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
}

export const classificationRegistry = ClassificationRegistry.getInstance();
