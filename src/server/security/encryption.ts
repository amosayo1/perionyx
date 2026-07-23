import crypto from "crypto";

export class EncryptionKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionKeyError";
  }
}

export interface EncryptionMetadata {
  keyId: string;
  algorithm: string;
  iv: string;
  authTag: string;
  version: number;
  timestamp: string;
}

export interface KMSProvider {
  encrypt(plaintext: string, context?: Record<string, string>): Promise<string>;
  decrypt(ciphertext: string, context?: Record<string, string>): Promise<string>;
  generateKey(): Promise<{ keyId: string; key: string }>;
}

export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32;
  private currentKeyId: string;
  private keys: Map<string, Buffer> = new Map();
  private kmsProvider: KMSProvider | null = null;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY;
    const keyId = process.env.ENCRYPTION_KEY_ID ?? "v1";

    if (!keyHex) {
      throw new EncryptionKeyError(
        "ENCRYPTION_KEY environment variable is required. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
      );
    }

    if (keyHex === "test-encryption-key-32-chars-long!!" || keyHex === "0000000000000000000000000000000000000000000000000000000000000000") {
      throw new EncryptionKeyError(
        "ENCRYPTION_KEY is set to a known default/insecure value. " +
        "Generate a new key before starting the application."
      );
    }

    if (!/^[a-fA-F0-9]{64}$/.test(keyHex)) {
      throw new EncryptionKeyError(
        "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
      );
    }

    this.currentKeyId = keyId;
    this.keys.set(keyId, Buffer.from(keyHex, "hex"));

    const history = process.env.ENCRYPTION_KEY_HISTORY;
    if (history) {
      for (const entry of history.split(",")) {
        const [historyKeyId, historyKeyHex] = entry.split("=");
        if (historyKeyId && historyKeyHex && /^[a-fA-F0-9]{64}$/.test(historyKeyHex)) {
          this.keys.set(historyKeyId.trim(), Buffer.from(historyKeyHex.trim(), "hex"));
        }
      }
    }
  }

  setKMSProvider(provider: KMSProvider): void {
    this.kmsProvider = provider;
  }

  encrypt(plaintext: string, context?: Record<string, string>): string {
    const key = this.keys.get(this.currentKeyId)!;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const metadata: EncryptionMetadata = {
      keyId: this.currentKeyId,
      algorithm: this.algorithm,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      version: 1,
      timestamp: new Date().toISOString(),
    };

    const metadataJson = JSON.stringify(metadata);
    const metadataB64 = Buffer.from(metadataJson).toString("base64");
    return `${metadataB64}:${encrypted.toString("hex")}`;
  }

  decrypt(payload: string, context?: Record<string, string>): string {
    const parts = payload.split(":");
    if (parts.length < 2) {
      throw new EncryptionKeyError("Invalid encrypted payload format");
    }

    const metadataB64 = parts[0];
    const encryptedHex = parts.slice(1).join(":");

    let metadata: EncryptionMetadata;
    try {
      const metadataJson = Buffer.from(metadataB64, "base64").toString("utf-8");
      metadata = JSON.parse(metadataJson);
    } catch {
      throw new EncryptionKeyError("Invalid encryption metadata");
    }

    const key = this.keys.get(metadata.keyId);
    if (!key) {
      throw new EncryptionKeyError(
        `No encryption key found for keyId: ${metadata.keyId}. ` +
        "If this key was rotated, add the old key to ENCRYPTION_KEY_HISTORY."
      );
    }

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(metadata.iv, "hex"),
    );
    decipher.setAuthTag(Buffer.from(metadata.authTag, "hex"));
    const decrypted = decipher.update(Buffer.from(encryptedHex, "hex"));
    return Buffer.concat([decrypted, decipher.final()]).toString("utf-8");
  }

  async decryptWithKMS(payload: string): Promise<string> {
    if (!this.kmsProvider) throw new EncryptionKeyError("No KMS provider configured");
    return this.kmsProvider.decrypt(payload);
  }

  rotateKey(oldKeyHex: string, newKeyHex: string, newKeyId: string): number {
    if (!/^[a-fA-F0-9]{64}$/.test(oldKeyHex)) {
      throw new EncryptionKeyError("Old key must be 64 hex characters");
    }
    if (!/^[a-fA-F0-9]{64}$/.test(newKeyHex)) {
      throw new EncryptionKeyError("New key must be 64 hex characters");
    }

    const oldKeyId = this.currentKeyId;
    this.keys.set(oldKeyId, Buffer.from(oldKeyHex, "hex"));
    this.currentKeyId = newKeyId;
    this.keys.set(newKeyId, Buffer.from(newKeyHex, "hex"));

    const historyEntry = `${oldKeyId}=${oldKeyHex}`;
    const existingHistory = process.env.ENCRYPTION_KEY_HISTORY ?? "";
    process.env.ENCRYPTION_KEY_HISTORY = existingHistory
      ? `${existingHistory},${historyEntry}`
      : historyEntry;

    return this.keys.size;
  }

  reEncrypt(payload: string, context?: Record<string, string>): string {
    const plaintext = this.decrypt(payload, context);
    return this.encrypt(plaintext, context);
  }

  getCurrentKeyId(): string {
    return this.currentKeyId;
  }

  getKeyCount(): number {
    return this.keys.size;
  }

  getAvailableKeyIds(): string[] {
    return Array.from(this.keys.keys());
  }
}

let instance: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!instance) {
    instance = new EncryptionService();
  }
  return instance;
}

export function encrypt(plaintext: string, context?: Record<string, string>): string {
  return getEncryptionService().encrypt(plaintext, context);
}

export function decrypt(payload: string, context?: Record<string, string>): string {
  return getEncryptionService().decrypt(payload, context);
}

export function getInstance(): EncryptionService {
  return getEncryptionService();
}
