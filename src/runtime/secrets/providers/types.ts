/**
 * Secret Runtime — Provider Interface
 *
 * Phase 24.0B
 */

export interface ISecretProvider {
  readonly name: string;
  readonly type: string;

  initialize(): Promise<void>;
  getSecret(key: string): Promise<string | null>;
  setSecret(key: string, value: string): Promise<void>;
  deleteSecret(key: string): Promise<boolean>;
  hasSecret(key: string): Promise<boolean>;
  listSecrets(prefix?: string): Promise<string[]>;
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }>;
}
