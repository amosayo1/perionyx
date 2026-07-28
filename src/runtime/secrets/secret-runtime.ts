/**
 * Secret Runtime — Prisma-backed Secret Management
 *
 * Phase 24.0B
 *
 * Metadata in Prisma. Values resolved from providers.
 * Auto-rotation scheduler. Audit trail.
 */

import { PrismaClient, RuntimeSecretStatus, RuntimeSecretProvider as PrismaSecretProvider } from '@prisma/client';
import type { ISecretProvider } from './providers/types';
import { EnvironmentSecretProvider } from './providers/environment';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'secret-runtime' });

// ── Types ──────────────────────────────────────────────────────────────────

export interface SecretReference {
  name: string;
  provider: string;
  providerKey: string;
  version: number;
}

export interface SecretMetadata {
  id: string;
  name: string;
  category: string;
  provider: string;
  providerKey: string;
  version: number;
  rotationIntervalDays?: number;
  nextRotationAt?: Date;
  expiresAt?: Date;
  status: string;
  createdBy?: string;
  ownerTeam?: string;
  lastAccessedAt?: Date;
  lastRotatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecretRuntimeOptions {
  prisma: PrismaClient;
  rotationCheckIntervalMs?: number; // default 60_000
}

// ── Secret Runtime ─────────────────────────────────────────────────────────

export class SecretRuntime {
  private static instance: SecretRuntime;

  private prisma: PrismaClient;
  private providers = new Map<string, ISecretProvider>();
  private defaultProvider: ISecretProvider;
  private rotationTimer?: ReturnType<typeof setInterval>;
  private rotationCheckIntervalMs: number;

  constructor(options: SecretRuntimeOptions) {
    this.prisma = options.prisma;
    this.rotationCheckIntervalMs = options.rotationCheckIntervalMs ?? 60_000;
    this.defaultProvider = new EnvironmentSecretProvider();
    this.providers.set('environment', this.defaultProvider);
  }

  static getInstance(): SecretRuntime {
    if (!SecretRuntime.instance) {
      throw new Error('SecretRuntime not initialized. Call SecretRuntime.create() first.');
    }
    return SecretRuntime.instance;
  }

  static async create(options: SecretRuntimeOptions): Promise<SecretRuntime> {
    if (SecretRuntime.instance) {
      await SecretRuntime.instance.shutdown();
    }
    SecretRuntime.instance = new SecretRuntime(options);
    return SecretRuntime.instance;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    // Initialize all registered providers
    for (const provider of this.providers.values()) {
      await provider.initialize();
    }

    // Start rotation scheduler
    this.rotationTimer = setInterval(() => {
      this.checkRotationDue().catch((err) => {
        logger.error(err, "Secret rotation check failed");
      });
    }, this.rotationCheckIntervalMs);
  }

  async shutdown(): Promise<void> {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }
  }

  // ── Provider Management ────────────────────────────────────────────────

  registerProvider(provider: ISecretProvider): void {
    this.providers.set(provider.type.toLowerCase(), provider);
  }

  setDefaultProvider(type: string): void {
    const provider = this.providers.get(type.toLowerCase());
    if (!provider) throw new Error(`Provider '${type}' not registered`);
    this.defaultProvider = provider;
  }

  // ── Secret CRUD ────────────────────────────────────────────────────────

  async getSecret(name: string, performedBy?: string): Promise<string | null> {
    const metadata = await this.prisma.runtimeSecretMetadata.findFirst({
      where: { name, status: RuntimeSecretStatus.ACTIVE },
    });
    if (!metadata) return null;

    const provider = this.providers.get(metadata.provider.toLowerCase());
    if (!provider) return null;

    // Update last accessed
    await this.prisma.runtimeSecretMetadata.update({
      where: { id: metadata.id },
      data: { lastAccessedAt: new Date(), lastAccessedBy: performedBy },
    });

    return provider.getSecret(metadata.providerKey);
  }

  async createSecret(input: {
    name: string;
    category?: string;
    provider?: string;
    providerKey: string;
    rotationIntervalDays?: number;
    expiresAt?: Date;
    createdBy?: string;
    ownerTeam?: string;
    companyId?: string;
  }): Promise<SecretMetadata> {
    const providerType = (input.provider ?? 'environment') as any;

    const row = await this.prisma.runtimeSecretMetadata.create({
      data: {
        name: input.name,
        category: (input.category ?? 'API_KEY') as any,
        provider: providerType,
        providerKey: input.providerKey,
        rotationIntervalDays: input.rotationIntervalDays,
        nextRotationAt: input.rotationIntervalDays
          ? new Date(Date.now() + input.rotationIntervalDays * 86_400_000)
          : null,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy,
        ownerTeam: input.ownerTeam,
        companyId: input.companyId ?? null,
        status: RuntimeSecretStatus.ACTIVE,
      },
    });

    // Record initial version
    await this.prisma.runtimeSecretVersion.create({
      data: {
        secretId: row.id,
        version: 1,
        valueHash: 'initial',
        rotatedBy: input.createdBy,
      },
    });

    return this.rowToMetadata(row);
  }

  async rotateSecret(
    name: string,
    newValue: string,
    performedBy: string,
    reason?: string,
  ): Promise<void> {
    const metadata = await this.prisma.runtimeSecretMetadata.findFirst({
      where: { name, status: RuntimeSecretStatus.ACTIVE },
    });
    if (!metadata) throw new Error(`Secret '${name}' not found`);

    const provider = this.providers.get(metadata.provider.toLowerCase());
    if (!provider) throw new Error(`Provider '${metadata.provider}' not available`);

    // Set the new value in the provider
    await provider.setSecret(metadata.providerKey, newValue);

    // Update metadata
    const newVersion = metadata.version + 1;
    await this.prisma.runtimeSecretMetadata.update({
      where: { id: metadata.id },
      data: {
        version: newVersion,
        lastRotatedAt: new Date(),
        lastRotatedBy: performedBy,
        nextRotationAt: metadata.rotationIntervalDays
          ? new Date(Date.now() + metadata.rotationIntervalDays * 86_400_000)
          : null,
      },
    });

    // Record version history
    await this.prisma.runtimeSecretVersion.create({
      data: {
        secretId: metadata.id,
        version: newVersion,
        valueHash: this.hashValue(newValue),
        rotatedBy: performedBy,
        reason,
      },
    });
  }

  async deleteSecret(name: string, performedBy: string): Promise<boolean> {
    const result = await this.prisma.runtimeSecretMetadata.updateMany({
      where: { name, status: RuntimeSecretStatus.ACTIVE },
      data: { status: RuntimeSecretStatus.DELETED },
    });
    return result.count > 0;
  }

  async listSecrets(companyId?: string): Promise<SecretMetadata[]> {
    const rows = await this.prisma.runtimeSecretMetadata.findMany({
      where: {
        status: RuntimeSecretStatus.ACTIVE,
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => this.rowToMetadata(r));
  }

  async getExpirationStatus(name: string): Promise<{
    expired: boolean;
    expiresSoon: boolean;
    daysUntilExpiry: number | null;
  }> {
    const metadata = await this.prisma.runtimeSecretMetadata.findFirst({
      where: { name, status: RuntimeSecretStatus.ACTIVE },
    });
    if (!metadata?.expiresAt) {
      return { expired: false, expiresSoon: false, daysUntilExpiry: null };
    }
    const daysUntilExpiry = Math.ceil((metadata.expiresAt.getTime() - Date.now()) / 86_400_000);
    return {
      expired: daysUntilExpiry <= 0,
      expiresSoon: daysUntilExpiry <= 30,
      daysUntilExpiry,
    };
  }

  // ── Auto-rotation ──────────────────────────────────────────────────────

  async checkRotationDue(): Promise<void> {
    const dueSecrets = await this.prisma.runtimeSecretMetadata.findMany({
      where: {
        status: RuntimeSecretStatus.ACTIVE,
        rotationIntervalDays: { not: null },
        nextRotationAt: { lte: new Date() },
      },
    });

    for (const secret of dueSecrets) {
      try {
        const provider = this.providers.get(secret.provider.toLowerCase());
        if (!provider) continue;

        const currentValue = await provider.getSecret(secret.providerKey);
        if (currentValue === null) continue;

        // Re-set the same value (triggers provider-side rotation if supported)
        await provider.setSecret(secret.providerKey, currentValue);

        await this.prisma.runtimeSecretMetadata.update({
          where: { id: secret.id },
          data: {
            lastRotatedAt: new Date(),
            lastRotatedBy: 'system:auto-rotation',
            nextRotationAt: secret.rotationIntervalDays
              ? new Date(Date.now() + secret.rotationIntervalDays * 86_400_000)
              : null,
          },
        });
      } catch {
        // Rotation failed — skip, will retry next cycle
      }
    }
  }

  // ── Health ─────────────────────────────────────────────────────────────

  async healthCheck(): Promise<Record<string, { healthy: boolean; latencyMs: number; error?: string }>> {
    const results: Record<string, { healthy: boolean; latencyMs: number; error?: string }> = {};
    for (const [name, provider] of this.providers) {
      results[name] = await provider.healthCheck();
    }
    return results;
  }

  // ── Audit ──────────────────────────────────────────────────────────────

  async getVersionHistory(name: string): Promise<Array<{
    version: number;
    rotatedBy: string | null;
    rotatedAt: Date;
    reason: string | null;
  }>> {
    const metadata = await this.prisma.runtimeSecretMetadata.findFirst({
      where: { name, status: RuntimeSecretStatus.ACTIVE },
    });
    if (!metadata) return [];

    return this.prisma.runtimeSecretVersion.findMany({
      where: { secretId: metadata.id },
      orderBy: { version: 'desc' },
      select: {
        version: true,
        rotatedBy: true,
        rotatedAt: true,
        reason: true,
      },
    });
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  private rowToMetadata(row: any): SecretMetadata {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      provider: row.provider,
      providerKey: row.providerKey,
      version: row.version,
      rotationIntervalDays: row.rotationIntervalDays,
      nextRotationAt: row.nextRotationAt,
      expiresAt: row.expiresAt,
      status: row.status,
      createdBy: row.createdBy,
      ownerTeam: row.ownerTeam,
      lastAccessedAt: row.lastAccessedAt,
      lastRotatedAt: row.lastRotatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private hashValue(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}
