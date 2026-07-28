/**
 * Secret Runtime — Environment Variable Provider
 *
 * Phase 24.0B
 *
 * Reads secrets from process.env with PERIONYX_SECRET_ prefix.
 */

import type { ISecretProvider } from './types';

const PREFIX = 'PERIONYX_SECRET_';

export class EnvironmentSecretProvider implements ISecretProvider {
  readonly name = 'environment';
  readonly type = 'ENVIRONMENT';

  async initialize(): Promise<void> {
    // No initialization needed — reads process.env directly
  }

  async getSecret(key: string): Promise<string | null> {
    const envKey = this.toEnvKey(key);
    return process.env[envKey] ?? null;
  }

  async setSecret(key: string, value: string): Promise<void> {
    const envKey = this.toEnvKey(key);
    process.env[envKey] = value;
  }

  async deleteSecret(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    if (process.env[envKey] !== undefined) {
      delete process.env[envKey];
      return true;
    }
    return false;
  }

  async hasSecret(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    return process.env[envKey] !== undefined;
  }

  async listSecrets(_prefix?: string): Promise<string[]> {
    // Cannot reliably enumerate env vars by prefix
    return [];
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    // Simple check — just verify we can read env
    void process.env;
    return { healthy: true, latencyMs: Date.now() - start };
  }

  private toEnvKey(key: string): string {
    return PREFIX + key.replace(/[-.]/g, '_').toUpperCase();
  }
}
