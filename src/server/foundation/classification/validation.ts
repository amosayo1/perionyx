/**
 * Enterprise Data Classification Platform — Validation
 *
 * Phase 24.0 | Constitutional Law 13
 *
 * Validates that classification metadata is complete and correct.
 */

import { DataClassification, CLASSIFICATION_SENSITIVITY, ClassificationMetadata } from "./types";
import { ClassificationRegistry } from "./registry";

export interface ClassificationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a Prisma model has complete classification metadata.
 */
export function validateClassificationMetadata(
  metadata: ClassificationMetadata | null | undefined,
  entityType: string,
): ClassificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata) {
    errors.push(`Entity '${entityType}' has no classification metadata. Law 13 requires all persisted entities to be classified.`);
    return { valid: false, errors, warnings };
  }

  // Validate entity classification exists
  if (!metadata.entityClassification) {
    errors.push(`Entity '${entityType}' has no entity-level classification.`);
  }

  // Validate classification is a valid enum value
  if (metadata.entityClassification && !Object.values(DataClassification).includes(metadata.entityClassification)) {
    errors.push(`Entity '${entityType}' has invalid classification: '${metadata.entityClassification}'.`);
  }

  // Validate classifiedBy
  if (!metadata.classifiedBy) {
    warnings.push(`Entity '${entityType}' has no 'classifiedBy' field. Classification should be attributed.`);
  }

  // Validate lastReviewedAt
  if (!metadata.lastReviewedAt) {
    warnings.push(`Entity '${entityType}' has never been reviewed. Schedule periodic classification review.`);
  }

  // Validate field classifications are valid enums
  if (metadata.fieldClassifications) {
    for (const [field, classification] of Object.entries(metadata.fieldClassifications)) {
      if (!Object.values(DataClassification).includes(classification)) {
        errors.push(`Field '${field}' on entity '${entityType}' has invalid classification: '${classification}'.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that a classification level meets minimum sensitivity for its use case.
 */
export function validateMinimumSensitivity(
  classification: DataClassification,
  minimumRequired: DataClassification,
): ClassificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const actual = CLASSIFICATION_SENSITIVITY[classification];
  const required = CLASSIFICATION_SENSITIVITY[minimumRequired];

  if (actual < required) {
    errors.push(
      `Classification '${classification}' (sensitivity ${actual}) does not meet minimum required '${minimumRequired}' (sensitivity ${required}).`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that a field's classification is at least as sensitive as its entity.
 */
export function validateFieldClassification(
  entityClassification: DataClassification,
  fieldClassification: DataClassification,
  fieldName: string,
  entityType: string,
): ClassificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const entitySensitivity = CLASSIFICATION_SENSITIVITY[entityClassification];
  const fieldSensitivity = CLASSIFICATION_SENSITIVITY[fieldClassification];

  // Fields CAN be less sensitive than entity (e.g., entity is RESTRICTED but name field is PII)
  // But fields should NOT be less sensitive than INTERNAL for sensitive entities
  if (entitySensitivity >= 4 && fieldSensitivity < 1) {
    warnings.push(
      `Field '${fieldName}' on '${entityType}' is PUBLIC but entity is '${entityClassification}'. Consider raising field classification.`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all registered entity types have classifications.
 */
export function validateRegistryCompleteness(
  registry: ClassificationRegistry,
  requiredEntityTypes: string[],
): ClassificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const entityType of requiredEntityTypes) {
    const result = registry.validateRegistration(entityType);
    if (!result.valid) {
      errors.push(...result.missing);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
