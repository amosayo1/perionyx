/**
 * Secret Runtime — GCP Secret Manager Provider (Stub)
 *
 * Phase 24.0B
 */

import type { ISecretProvider } from './types';

export class GCPSecretProvider implements ISecretProvider {
  readonly name = 'gcp-secrets';
  readonly type = 'GCP_SECRET_MANAGER';

  private configured = false;

  async initialize(): Promise<void> {
    this.configured = !!process.env.GCP_PROJECT_ID;
  }

  async getSecret(key: string): Promise<string | null> {
    if (!this.configured) return null;
    throw new Error('GCP Secret Manager provider not implemented. Set GCP_PROJECT_ID.');
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (!this.configured) return;
    throw new Error('GCP Secret Manager provider not implemented.');
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('GCP Secret Manager provider not implemented.');
  }

  async hasSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('GCP Secret Manager provider not implemented.');
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    if (!this.configured) return [];
    throw new Error('GCP Secret Manager provider not implemented.');
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.configured) {
      return { healthy: false, latencyMs: Date.now() - start, error: 'GCP not configured (GCP_PROJECT_ID)' };
    }
    return { healthy: true, latencyMs: Date.now() - start };
  }
}
