import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import crypto from "crypto";

const VALID_KEY = crypto.randomBytes(32).toString("hex");
const env = process.env as Record<string, string | undefined>;

describe("EncryptionService", () => {
  let EncryptionService: any;
  let EncryptionKeyError: any;
  let service: any;

  beforeAll(async () => {
    env.ENCRYPTION_KEY = VALID_KEY;
    env.ENCRYPTION_KEY_ID = "v1";
    const mod = await import("@/server/security/encryption");
    EncryptionService = mod.EncryptionService;
    EncryptionKeyError = mod.EncryptionKeyError;
    service = new EncryptionService();
  });

  afterAll(() => {
    delete env.ENCRYPTION_KEY;
    delete env.ENCRYPTION_KEY_ID;
  });

  describe("constructor", () => {
    it("creates instance with valid ENCRYPTION_KEY env var", () => {
      expect(service).toBeInstanceOf(EncryptionService);
    });

    it("throws EncryptionKeyError when ENCRYPTION_KEY is missing", () => {
      const saved = process.env.ENCRYPTION_KEY;
      delete env.ENCRYPTION_KEY;
      expect(() => new EncryptionService()).toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });

    it("throws EncryptionKeyError for known default key (all zeros)", () => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = "0000000000000000000000000000000000000000000000000000000000000000";
      expect(() => new EncryptionService()).toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });

    it("throws EncryptionKeyError for known default key (test value)", () => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long!!";
      expect(() => new EncryptionService()).toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });

    it("throws EncryptionKeyError when key is not 64 hex chars", () => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = "not-a-valid-hex-key-at-all";
      expect(() => new EncryptionService()).toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });

    it("throws EncryptionKeyError for non-hex 64-char string", () => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = "z".repeat(64);
      expect(() => new EncryptionService()).toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });

    it("loads historical keys from ENCRYPTION_KEY_HISTORY", () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      const savedHistory = process.env.ENCRYPTION_KEY_HISTORY;
      const oldKey = crypto.randomBytes(32).toString("hex");
      env.ENCRYPTION_KEY_HISTORY = `v0=${oldKey}`;
      env.ENCRYPTION_KEY = VALID_KEY;
      const s = new EncryptionService();
      expect(s.getAvailableKeyIds()).toContain("v0");
      expect(s.getAvailableKeyIds()).toContain("v1");
      env.ENCRYPTION_KEY_HISTORY = savedHistory;
      env.ENCRYPTION_KEY = savedKey;
    });

    it("uses ENCRYPTION_KEY_ID for the current key", () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      const savedId = process.env.ENCRYPTION_KEY_ID;
      env.ENCRYPTION_KEY_ID = "my-custom-id";
      env.ENCRYPTION_KEY = VALID_KEY;
      const s = new EncryptionService();
      expect(s.getCurrentKeyId()).toBe("my-custom-id");
      env.ENCRYPTION_KEY_ID = savedId;
      env.ENCRYPTION_KEY = savedKey;
    });

    it("defaults to v1 when ENCRYPTION_KEY_ID is not set", () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      const savedId = process.env.ENCRYPTION_KEY_ID;
      delete env.ENCRYPTION_KEY_ID;
      env.ENCRYPTION_KEY = VALID_KEY;
      const s = new EncryptionService();
      expect(s.getCurrentKeyId()).toBe("v1");
      env.ENCRYPTION_KEY_ID = savedId;
      env.ENCRYPTION_KEY = savedKey;
    });
  });

  describe("encrypt", () => {
    it("produces output with metadata prefix and colon separator", () => {
      const result = service.encrypt("hello");
      expect(result).toContain(":");
      const parts = result.split(":");
      expect(parts.length).toBeGreaterThanOrEqual(2);
      const metadata = JSON.parse(Buffer.from(parts[0], "base64").toString());
      expect(metadata).toHaveProperty("keyId");
      expect(metadata).toHaveProperty("algorithm", "aes-256-gcm");
      expect(metadata).toHaveProperty("iv");
      expect(metadata).toHaveProperty("authTag");
      expect(metadata).toHaveProperty("version", 1);
      expect(metadata).toHaveProperty("timestamp");
    });

    it("produces different outputs for same plaintext (unique IV)", () => {
      const a = service.encrypt("same-value");
      const b = service.encrypt("same-value");
      expect(a).not.toBe(b);
    });

    it("encrypts empty string", () => {
      const result = service.encrypt("");
      expect(result).toContain(":");
    });

    it("encrypts with context parameter", () => {
      const result = service.encrypt("ctx-test", { companyId: "c1" });
      expect(result).toContain(":");
    });
  });

  describe("decrypt", () => {
    it("recovers original plaintext", () => {
      const original = "super-secret-plaid-token-12345";
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it("handles special characters and unicode", () => {
      const original = "héllo wörld 🔐 £€¥";
      const encrypted = service.encrypt(original);
      expect(service.decrypt(encrypted)).toBe(original);
    });

    it("handles long strings", () => {
      const original = "x".repeat(10000);
      const encrypted = service.encrypt(original);
      expect(service.decrypt(encrypted)).toBe(original);
    });

    it("decrypts with context parameter", () => {
      const original = "context-test";
      const encrypted = service.encrypt(original, { companyId: "c1" });
      expect(service.decrypt(encrypted, { companyId: "c1" })).toBe(original);
    });

    it("throws EncryptionKeyError for invalid payload format", () => {
      expect(() => service.decrypt("not-valid-format")).toThrow(EncryptionKeyError);
    });

    it("throws EncryptionKeyError for malformed metadata", () => {
      expect(() => service.decrypt("!!!invalid-base64!!:abcdef")).toThrow(EncryptionKeyError);
    });

    it("throws EncryptionKeyError for unknown keyId", () => {
      const fakeMeta = Buffer.from(
        JSON.stringify({
          keyId: "nonexistent",
          algorithm: "aes-256-gcm",
          iv: "00".repeat(16),
          authTag: "00".repeat(8),
          version: 1,
          timestamp: new Date().toISOString(),
        }),
      ).toString("base64");
      expect(() => service.decrypt(`${fakeMeta}:abcdef`)).toThrow(EncryptionKeyError);
    });
  });

  describe("rotateKey", () => {
    it("adds new key without breaking decryption of existing data", () => {
      const originalText = "data-encrypted-with-old-key";
      const encrypted = service.encrypt(originalText);

      const oldKeyHex = VALID_KEY;
      const newKeyHex = crypto.randomBytes(32).toString("hex");

      service.rotateKey(oldKeyHex, newKeyHex, "v2");

      expect(service.getCurrentKeyId()).toBe("v2");
      expect(service.getAvailableKeyIds()).toContain("v1");
      expect(service.getAvailableKeyIds()).toContain("v2");

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it("increases key count after rotation", () => {
      const oldKeyHex = crypto.randomBytes(32).toString("hex");
      const newKeyHex = crypto.randomBytes(32).toString("hex");
      const before = service.getAvailableKeyIds().length;
      service.rotateKey(oldKeyHex, newKeyHex, `v_rot_${Date.now()}`);
      expect(service.getAvailableKeyIds().length).toBeGreaterThan(before);
    });

    it("throws EncryptionKeyError for invalid old key format", () => {
      expect(() => service.rotateKey("bad-key", crypto.randomBytes(32).toString("hex"), "vx")).toThrow(EncryptionKeyError);
    });

    it("throws EncryptionKeyError for invalid new key format", () => {
      expect(() => service.rotateKey(crypto.randomBytes(32).toString("hex"), "bad-key", "vx")).toThrow(EncryptionKeyError);
    });
  });

  describe("reEncrypt", () => {
    it("produces a different payload that decrypts to the original", () => {
      const original = "secret-data";
      const encrypted = service.encrypt(original);
      const reEncrypted = service.reEncrypt(encrypted);
      expect(reEncrypted).not.toBe(encrypted);
      expect(reEncrypted).toContain(":");
      const decrypted = service.decrypt(reEncrypted);
      expect(decrypted).toBe(original);
    });
  });

  describe("key management", () => {
    let fresh: any;

    beforeAll(() => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = VALID_KEY;
      fresh = new EncryptionService();
      env.ENCRYPTION_KEY = saved;
    });

    it("getCurrentKeyId returns correct key ID", () => {
      expect(fresh.getCurrentKeyId()).toBe("v1");
    });

    it("getAvailableKeyIds lists all keys", () => {
      const ids = fresh.getAvailableKeyIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThanOrEqual(1);
    });

    it("getKeyCount returns positive count", () => {
      expect(fresh.getKeyCount()).toBeGreaterThanOrEqual(1);
    });
  });

  describe("setKMSProvider", () => {
    it("accepts a KMS provider without throwing", () => {
      const mockProvider = {
        encrypt: vi.fn().mockResolvedValue("encrypted"),
        decrypt: vi.fn().mockResolvedValue("decrypted"),
        generateKey: vi.fn().mockResolvedValue({ keyId: "kms-1", key: "key" }),
      };
      expect(() => service.setKMSProvider(mockProvider)).not.toThrow();
    });

    it("decryptWithKMS delegates to the KMS provider", async () => {
      const mockProvider = {
        encrypt: vi.fn().mockResolvedValue("encrypted"),
        decrypt: vi.fn().mockResolvedValue("kms-decrypted"),
        generateKey: vi.fn().mockResolvedValue({ keyId: "kms-1", key: "key" }),
      };
      service.setKMSProvider(mockProvider);
      const result = await service.decryptWithKMS("some-payload");
      expect(result).toBe("kms-decrypted");
      expect(mockProvider.decrypt).toHaveBeenCalledWith("some-payload");
    });

    it("decryptWithKMS throws when no KMS provider is configured", async () => {
      const saved = process.env.ENCRYPTION_KEY;
      env.ENCRYPTION_KEY = VALID_KEY;
      const fresh = new EncryptionService();
      await expect(fresh.decryptWithKMS("payload")).rejects.toThrow(EncryptionKeyError);
      env.ENCRYPTION_KEY = saved;
    });
  });
});
