/**
 * Enterprise Secret Management Platform — Index
 *
 * Phase 24.0
 */

export {
  SecretProviderType,
  SecretCategory,
  type ISecretProvider,
  type SecretMetadata,
  type SecretReference,
  type RotationPolicy,
  type RotationRecord,
  type SecretAuditEntry,
  type SecretAuditAction,
} from "./types";

export { EnvironmentSecretProvider } from "./providers/environment";
export { SecretManager, secretManager } from "./manager";
