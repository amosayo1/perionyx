/**
 * Secret Runtime — HashiCorp Vault Provider (Stub)
 *
 * Phase 24.0B
 *
 * Stub implementation. Replace with real Vault SDK when deploying.
 */

import type { ISecretProvider } from './types';

export class VaultSecretProvider implements ISecretProvider {
  readonly name = 'vault';
  readonly type = 'VAULT';

  private configured = false;

  async initialize(): Promise<void> {
    const url = process.env.VAULT_ADDR;
    const token = process.env.VAULT_TOKEN;
    if (!url || !token) {
      this.configured = false;
      return;
    }
    this.configured = true;
    // TODO: Initialize Vault client with url + token
  }

  async getSecret(key: string): Promise<string | null> {
    if (!this.configured) return null;
    // TODO: Read from Vault at path secret/data/{key}
    throw new Error('Vault provider not implemented. Set VAULT_ADDR and VAULT_TOKEN.');
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (!this.configured) return;
    // TODO: Write to Vault at path secret/data/{key}
    throw new Error('Vault provider not implemented.');
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('Vault provider not implemented.');
  }

  async hasSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('Vault provider not implemented.');
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    if (!this.configured) return [];
    throw new Error('Vault provider not implemented.');
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.configured) {
      return { healthy: false, latencyMs: Date.now() - start, error: 'Vault not configured (VAULT_ADDR/VAULT_TOKEN)' };
    }
    // TODO: Check Vault health endpoint
    return { healthy: true, latencyMs: Date.now() - start };
  }
}
