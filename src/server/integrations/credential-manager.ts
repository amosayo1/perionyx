import { encrypt, decrypt } from "@/server/security/encryption";
import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider } from "./integration-factory";
import { emitIntegrationDomainEvent } from "./observability";
import type { CredentialStore, KMSProvider, SecretReference } from "./types";

const credentials = new Map<string, CredentialStore>();
const credentialData = new Map<string, Record<string, string>>();
const expirationTimers = new Map<string, ReturnType<typeof setTimeout>>();

let kmsProvider: KMSProvider | null = null;

export function setKMSProvider(provider: KMSProvider): void {
  kmsProvider = provider;
}

export function getKMSProvider(): KMSProvider | null {
  return kmsProvider;
}

export async function storeCredentials(
  connectionId: string,
  companyId: string,
  credentialsData: Record<string, string>,
  expiresInDays?: number,
): Promise<CredentialStore> {
  const plaintext = JSON.stringify(credentialsData);
  let encryptedData: string;
  let keyId = "v1";

  if (kmsProvider) {
    encryptedData = await kmsProvider.encrypt(plaintext, { connectionId, companyId });
    keyId = "kms-v1";
  } else {
    encryptedData = encrypt(plaintext, { connectionId, companyId });
  }

  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : undefined;

  const store: CredentialStore = {
    id: crypto.randomUUID(),
    connectionId,
    companyId,
    encryptedData,
    keyId,
    createdAt: new Date(),
    expiresAt,
    version: 1,
    validationStatus: "unknown",
  };

  credentials.set(connectionId, store);
  credentialData.set(connectionId, credentialsData);

  if (expiresAt) {
    scheduleExpirationWarning(connectionId, expiresAt);
  }

  return store;
}

export async function getCredentials(
  connectionId: string,
): Promise<Record<string, string> | null> {
  const cached = credentialData.get(connectionId);
  if (cached) return cached;

  const store = credentials.get(connectionId);
  if (!store) return null;

  if (store.expiresAt && store.expiresAt < new Date()) {
    emitIntegrationDomainEvent("integration.credential.expired", {
      connectionId,
      companyId: store.companyId,
    });
    return null;
  }

  let decrypted: string;
  if (kmsProvider && store.keyId.startsWith("kms-")) {
    decrypted = await kmsProvider.decrypt(store.encryptedData, {
      connectionId,
      companyId: store.companyId,
    });
  } else {
    decrypted = decrypt(store.encryptedData, {
      connectionId,
      companyId: store.companyId,
    });
  }

  const data = JSON.parse(decrypted) as Record<string, string>;
  credentialData.set(connectionId, data);
  return data;
}

export async function rotateCredentials(
  connectionId: string,
): Promise<CredentialStore> {
  const existing = credentials.get(connectionId);
  if (!existing) {
    throw new Error(`No credentials found for connection ${connectionId}`);
  }

  const data = await getCredentials(connectionId);
  if (!data) {
    throw new Error(`Failed to retrieve credentials for connection ${connectionId}`);
  }

  const plaintext = JSON.stringify(data);
  let encryptedData: string;
  let keyId = "v1";

  if (kmsProvider) {
    const newKeyId = existing.keyId.startsWith("kms-")
      ? await kmsProvider.rotateKey(existing.keyId)
      : "kms-v1";
    encryptedData = await kmsProvider.encrypt(plaintext, {
      connectionId,
      companyId: existing.companyId,
    });
    keyId = newKeyId;
  } else {
    encryptedData = encrypt(plaintext, {
      connectionId,
      companyId: existing.companyId,
    });
  }

  const updated: CredentialStore = {
    ...existing,
    encryptedData,
    rotatedAt: new Date(),
    keyId,
    version: existing.version + 1,
    lastValidatedAt: new Date(),
    validationStatus: "unknown",
  };

  credentials.set(connectionId, updated);
  credentialData.set(connectionId, data);

  emitIntegrationDomainEvent("integration.credential.rotated", {
    connectionId,
    companyId: existing.companyId,
    version: updated.version,
  });

  return updated;
}

export async function deleteCredentials(connectionId: string): Promise<void> {
  credentials.delete(connectionId);
  credentialData.delete(connectionId);
  cancelExpirationTimer(connectionId);
}

export async function validateCredentials(
  connectionId: string,
): Promise<boolean> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const creds = await getCredentials(connectionId);
  if (!creds) {
    throw new Error(`No credentials stored for connection ${connectionId}`);
  }

  try {
    const provider = await getOrCreateProvider(
      await getProviderConfig(connection.providerId),
    );
    const valid = await provider.authenticate(connection);
    updateValidationStatus(connectionId, valid ? "valid" : "invalid");
    return valid;
  } catch {
    updateValidationStatus(connectionId, "invalid");
    return false;
  }
}

export function hasCredentials(connectionId: string): boolean {
  return credentials.has(connectionId);
}

export function getCredentialExpiry(connectionId: string): Date | undefined {
  return credentials.get(connectionId)?.expiresAt;
}

export function setCredentialExpiry(
  connectionId: string,
  expiresAt: Date,
): void {
  const store = credentials.get(connectionId);
  if (store) {
    store.expiresAt = expiresAt;
    credentials.set(connectionId, store);
    scheduleExpirationWarning(connectionId, expiresAt);
  }
}

export function getCredentialsMetadata(connectionId: string): {
  keyId: string;
  version: number;
  rotatedAt: Date | undefined;
  expiresAt: Date | undefined;
  createdAt: Date;
  lastValidatedAt: Date | undefined;
  validationStatus: "valid" | "invalid" | "unknown" | undefined;
  secretRef: string | undefined;
} | null {
  const store = credentials.get(connectionId);
  if (!store) return null;
  return {
    keyId: store.keyId,
    version: store.version,
    rotatedAt: store.rotatedAt,
    expiresAt: store.expiresAt,
    createdAt: store.createdAt,
    lastValidatedAt: store.lastValidatedAt,
    validationStatus: store.validationStatus,
    secretRef: store.secretRef,
  };
}

export function resolveSecretRef(ref: SecretReference): string | null {
  switch (ref.type) {
    case "env":
      return process.env[ref.key] ?? null;
    case "file":
      try {
        const fs = require("fs");
        return fs.readFileSync(ref.path, "utf8");
      } catch {
        return null;
      }
    default:
      return null;
  }
}

function scheduleExpirationWarning(connectionId: string, expiresAt: Date): void {
  cancelExpirationTimer(connectionId);
  const warningLeadTime = 7 * 86400000;
  const warningAt = expiresAt.getTime() - warningLeadTime;
  const now = Date.now();

  if (warningAt > now) {
    const timer = setTimeout(() => {
      emitIntegrationDomainEvent("integration.credential.expiring", {
        connectionId,
        expiresAt: expiresAt.toISOString(),
      });
    }, warningAt - now);
    expirationTimers.set(connectionId, timer);
  }
}

function cancelExpirationTimer(connectionId: string): void {
  const timer = expirationTimers.get(connectionId);
  if (timer) {
    clearTimeout(timer);
    expirationTimers.delete(connectionId);
  }
}

function updateValidationStatus(
  connectionId: string,
  status: "valid" | "invalid" | "unknown",
): void {
  const store = credentials.get(connectionId);
  if (store) {
    store.validationStatus = status;
    store.lastValidatedAt = new Date();
    credentials.set(connectionId, store);
  }
}

async function getProviderConfig(providerId: string) {
  const config = integrationRegistry.getProvider(providerId);
  if (!config) {
    throw new Error(`Provider ${providerId} not found in registry`);
  }
  return config;
}
