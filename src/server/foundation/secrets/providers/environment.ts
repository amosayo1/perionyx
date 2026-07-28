/**
 * Enterprise Secret Management Platform — Environment Provider
 *
 * Phase 24.0
 *
 * Reads secrets from environment variables.
 * Default provider for development and testing.
 */

import { ISecretProvider, SecretProviderType, SecretMetadata } from "../types";

export class EnvironmentSecretProvider implements ISecretProvider {
  readonly type = SecretProviderType.ENVIRONMENT;

  private initialized = false;
  private prefix: string;

  constructor(prefix = "PERIONYX_SECRET_") {
    this.prefix = prefix;
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async getSecret(key: string): Promise<string | null> {
    const envKey = this.toEnvKey(key);
    const value = process.env[envKey];
    return value ?? null;
  }

  async setSecret(key: string, value: string): Promise<void> {
    const envKey = this.toEnvKey(key);
    process.env[envKey] = value;
  }

  async deleteSecret(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    if (process.env[envKey]) {
      delete process.env[envKey];
      return true;
    }
    return false;
  }

  async hasSecret(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    return process.env[envKey] !== undefined;
  }

  async listSecrets(_prefix: string): Promise<SecretMetadata[]> {
    // Environment provider cannot list — env vars are flat
    return [];
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      // Simple health check: try to read a known env var
      void process.env;
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private toEnvKey(key: string): string {
    // Convert "plaid-client-id" → "PERIONYX_SECRET_PLAID_CLIENT_ID"
    return (
      this.prefix +
      key
        .replace(/-/g, "_")
        .replace(/\./g, "_")
        .toUpperCase()
    );
  }
}
