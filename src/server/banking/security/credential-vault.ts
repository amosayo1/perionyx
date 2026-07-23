import type { BankCredential, CredentialVaultStrategy } from "../domain/types";

export interface VaultEntry {
  id: string;
  connectionId: string;
  credentialKey: string;
  encryptedValue: string;
  strategy: CredentialVaultStrategy;
  keyRef: string;
  createdAt: string;
  rotatedAt: string | null;
  expiresAt: string | null;
  rotationPolicyDays: number;
  version: number;
}

export interface RotationRequest {
  connectionId: string;
  rotationPolicyDays: number;
  reason?: string;
}

export class CredentialVault {
  private entries = new Map<string, VaultEntry>();
  private readonly defaultRotationPolicyDays = 90;

  async store(params: StoreCredentialParams): Promise<VaultEntry> {
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      connectionId: params.connectionId,
      credentialKey: params.key,
      encryptedValue: params.encryptedValue,
      strategy: params.strategy,
      keyRef: params.keyRef,
      createdAt: new Date().toISOString(),
      rotatedAt: null,
      expiresAt: params.expiresAt ?? null,
      rotationPolicyDays: params.rotationPolicyDays ?? this.defaultRotationPolicyDays,
      version: 1,
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  async retrieve(credentialId: string): Promise<VaultEntry | null> {
    const entry = this.entries.get(credentialId);
    if (!entry) return null;

    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      return null;
    }

    return entry;
  }

  async retrieveByConnection(connectionId: string): Promise<VaultEntry[]> {
    return Array.from(this.entries.values()).filter(
      (e) => e.connectionId === connectionId && (!e.expiresAt || new Date(e.expiresAt) >= new Date()),
    );
  }

  async rotate(params: RotationRequest): Promise<void> {
    const entries = await this.retrieveByConnection(params.connectionId);
    for (const entry of entries) {
      entry.rotatedAt = new Date().toISOString();
      entry.version++;
      entry.rotationPolicyDays = params.rotationPolicyDays;
    }
  }

  async delete(credentialId: string): Promise<boolean> {
    return this.entries.delete(credentialId);
  }

  async deleteByConnection(connectionId: string): Promise<number> {
    let count = 0;
    for (const [id, entry] of this.entries) {
      if (entry.connectionId === connectionId) {
        this.entries.delete(id);
        count++;
      }
    }
    return count;
  }

  async getExpiring(withinDays: number): Promise<VaultEntry[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + withinDays * 86400000);
    return Array.from(this.entries.values()).filter(
      (e) => e.expiresAt && new Date(e.expiresAt) <= threshold && new Date(e.expiresAt) >= now,
    );
  }

  async getExpired(): Promise<VaultEntry[]> {
    const now = new Date();
    return Array.from(this.entries.values()).filter(
      (e) => e.expiresAt && new Date(e.expiresAt) < now,
    );
  }

  async count(): Promise<number> {
    return this.entries.size;
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }
}
interface StoreCredentialParams {
  connectionId: string;
  key: string;
  encryptedValue: string;
  strategy: CredentialVaultStrategy;
  keyRef: string;
  expiresAt?: string;
  rotationPolicyDays?: number;
}

export const credentialVault = new CredentialVault();