/**
 * Secret Runtime — AWS Secrets Manager Provider (Stub)
 *
 * Phase 24.0B
 */

import type { ISecretProvider } from './types';

export class AWSSecretsProvider implements ISecretProvider {
  readonly name = 'aws-secrets';
  readonly type = 'AWS_SECRETS';

  private configured = false;

  async initialize(): Promise<void> {
    const region = process.env.AWS_REGION;
    this.configured = !!region;
  }

  async getSecret(key: string): Promise<string | null> {
    if (!this.configured) return null;
    throw new Error('AWS Secrets Manager provider not implemented. Set AWS_REGION.');
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (!this.configured) return;
    throw new Error('AWS Secrets Manager provider not implemented.');
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('AWS Secrets Manager provider not implemented.');
  }

  async hasSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('AWS Secrets Manager provider not implemented.');
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    if (!this.configured) return [];
    throw new Error('AWS Secrets Manager provider not implemented.');
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.configured) {
      return { healthy: false, latencyMs: Date.now() - start, error: 'AWS not configured (AWS_REGION)' };
    }
    return { healthy: true, latencyMs: Date.now() - start };
  }
}
