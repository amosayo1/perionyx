/**
 * Secret Runtime — Azure Key Vault Provider (Stub)
 *
 * Phase 24.0B
 */

import type { ISecretProvider } from './types';

export class AzureKeyVaultProvider implements ISecretProvider {
  readonly name = 'azure-keyvault';
  readonly type = 'AZURE_KEYVAULT';

  private configured = false;

  async initialize(): Promise<void> {
    this.configured = !!process.env.AZURE_KEY_VAULT_URL;
  }

  async getSecret(key: string): Promise<string | null> {
    if (!this.configured) return null;
    throw new Error('Azure Key Vault provider not implemented. Set AZURE_KEY_VAULT_URL.');
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (!this.configured) return;
    throw new Error('Azure Key Vault provider not implemented.');
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('Azure Key Vault provider not implemented.');
  }

  async hasSecret(key: string): Promise<boolean> {
    if (!this.configured) return false;
    throw new Error('Azure Key Vault provider not implemented.');
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    if (!this.configured) return [];
    throw new Error('Azure Key Vault provider not implemented.');
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.configured) {
      return { healthy: false, latencyMs: Date.now() - start, error: 'Azure not configured (AZURE_KEY_VAULT_URL)' };
    }
    return { healthy: true, latencyMs: Date.now() - start };
  }
}
