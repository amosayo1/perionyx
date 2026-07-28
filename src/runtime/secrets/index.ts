/**
 * Secret Runtime — Barrel Export
 *
 * Phase 24.0B
 */

export { SecretRuntime } from './secret-runtime';
export type { SecretReference, SecretMetadata, SecretRuntimeOptions } from './secret-runtime';
export type { ISecretProvider } from './providers/types';
export { EnvironmentSecretProvider } from './providers/environment';
export { VaultSecretProvider } from './providers/vault';
export { AWSSecretsProvider } from './providers/aws-secrets';
export { AzureKeyVaultProvider } from './providers/azure-keyvault';
export { GCPSecretProvider } from './providers/gcp-secret-manager';
