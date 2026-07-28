/**
 * Enterprise Data Classification Platform — Index
 *
 * Phase 24.0 | Constitutional Law 13
 */

export {
  DataClassification,
  CLASSIFICATION_SENSITIVITY,
  type ClassificationPolicy,
  type MaskingPolicy,
  type EncryptionPolicy,
  type RetentionPolicy,
  type AccessPolicy,
  type ClassificationMetadata,
  type FieldClassification,
  type ClassifyEntityInput,
  type ClassificationCheckResult,
  type MaskedData,
  type ClassificationRegistryEntry,
  type ClassificationAuditEntry,
} from "./types";

export { ClassificationRegistry, classificationRegistry } from "./registry";

export {
  validateClassificationMetadata,
  validateMinimumSensitivity,
  validateFieldClassification,
  validateRegistryCompleteness,
  type ClassificationValidationResult,
} from "./validation";
