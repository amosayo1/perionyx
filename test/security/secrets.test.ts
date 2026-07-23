import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SecretsValidator, SecretsError, secretsValidator } from "@/server/security/secrets";

const OLD_ENV = { ...process.env };
const env = process.env as Record<string, string | undefined>;

describe("SecretsValidator", () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  describe("validate", () => {
    it("throws SecretsError when ENCRYPTION_KEY is missing in production", () => {
      delete env.ENCRYPTION_KEY;
      expect(() => secretsValidator.validate({ environment: "production" })).toThrow(SecretsError);
    });

    it("throws SecretsError with descriptive message for missing critical secrets", () => {
      delete env.ENCRYPTION_KEY;
      delete env.AUTH_SECRET;
      try {
        secretsValidator.validate({ environment: "production" });
      } catch (e) {
        expect(e).toBeInstanceOf(SecretsError);
        expect((e as SecretsError).message).toContain("ENCRYPTION_KEY");
        expect((e as SecretsError).message).toContain("AUTH_SECRET");
      }
    });

    it("returns critical missing secrets when ENCRYPTION_KEY is absent (non-fail)", () => {
      delete env.ENCRYPTION_KEY;
      const result = secretsValidator.validate({ environment: "development", failOnMissing: false });
      expect(result.critical).toContain("ENCRYPTION_KEY");
      expect(result.missing).toContain("ENCRYPTION_KEY");
      expect(result.valid).toBe(false);
    });

    it("returns errors for known default ENCRYPTION_KEY in production", () => {
      env.ENCRYPTION_KEY = "0000000000000000000000000000000000000000000000000000000000000000";
      const result = secretsValidator.validate({ environment: "production", failOnMissing: false });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("known default value")]),
      );
      expect(result.valid).toBe(false);
    });

    it("returns errors for known default ENCRYPTION_KEY (test value) in production", () => {
      env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long!!";
      const result = secretsValidator.validate({ environment: "production", failOnMissing: false });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("known default value")]),
      );
    });

    it("returns errors for known test JWT_SECRET in production", () => {
      env.JWT_SECRET = "test-jwt-secret-for-testing-only";
      const result = secretsValidator.validate({ environment: "production", failOnMissing: false });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("test value")]),
      );
    });

    it("returns warnings for short JWT_SECRET", () => {
      env.JWT_SECRET = "short";
      env.ENCRYPTION_KEY = "a".repeat(64);
      const result = secretsValidator.validate({ environment: "development" });
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining("does not match expected format")]),
      );
    });

    it("returns warnings for non-hex ENCRYPTION_KEY", () => {
      env.ENCRYPTION_KEY = "zz".repeat(32);
      const result = secretsValidator.validate({ environment: "development" });
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining("does not match expected format")]),
      );
    });

    it("returns valid for well-configured development environment", () => {
      env.ENCRYPTION_KEY = "a".repeat(64);
      env.JWT_SECRET = "a".repeat(32);
      env.DATABASE_URL = "postgresql://localhost:5432/db";
      env.REDIS_URL = "redis://localhost:6379";
      env.AUTH_SECRET = "a".repeat(32);
      env.ENCRYPTION_KEY_ID = "v1";
      env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
      const result = secretsValidator.validate({ environment: "development" });
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("detects missing NEXT_PUBLIC_APP_URL in development", () => {
      delete env.NEXT_PUBLIC_APP_URL;
      env.ENCRYPTION_KEY = "a".repeat(64);
      const result = secretsValidator.validate({ environment: "development" });
      expect(result.missing).toContain("NEXT_PUBLIC_APP_URL");
    });

    it("detects missing DATABASE_URL for production", () => {
      delete env.DATABASE_URL;
      env.ENCRYPTION_KEY = "a".repeat(64);
      env.JWT_SECRET = "a".repeat(32);
      env.REDIS_URL = "redis://localhost:6379";
      env.AUTH_SECRET = "a".repeat(32);
      const result = secretsValidator.validate({ environment: "production", failOnMissing: false });
      expect(result.missing).toContain("DATABASE_URL");
      expect(result.valid).toBe(false);
    });
  });

  describe("generateEncryptionKey", () => {
    it("produces 64 hex characters", () => {
      const key = SecretsValidator.generateEncryptionKey();
      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces unique keys on each call", () => {
      const key1 = SecretsValidator.generateEncryptionKey();
      const key2 = SecretsValidator.generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe("generateJwtSecret", () => {
    it("produces a base64url string at least 32 chars", () => {
      const secret = SecretsValidator.generateJwtSecret();
      expect(secret).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(secret.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe("generateAuthSecret", () => {
    it("produces a base64url string at least 32 chars", () => {
      const secret = SecretsValidator.generateAuthSecret();
      expect(secret).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(secret.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe("mask", () => {
    it("shows first 4 and last 4 chars with **** in the middle", () => {
      expect(secretsValidator.mask("abcdefghijklmnop")).toBe("abcd****mnop");
    });

    it("returns **** for values 8 chars or less", () => {
      expect(secretsValidator.mask("short")).toBe("****");
      expect(secretsValidator.mask("12345678")).toBe("****");
    });

    it("handles values longer than 8 chars", () => {
      const masked = secretsValidator.mask("1234567890123456");
      expect(masked).toBe("1234****3456");
    });
  });

  describe("diagnose", () => {
    it("returns NODE_ENV value", () => {
      (process.env as any).NODE_ENV = "testing";
      const info = secretsValidator.diagnose();
      expect(info.nodeEnv).toBe("testing");
    });

    it("defaults to 'not set' when NODE_ENV is absent", () => {
      delete (process.env as any).NODE_ENV;
      const info = secretsValidator.diagnose();
      expect(info.nodeEnv).toBe("not set");
    });

    it("lists present and missing critical secrets", () => {
      (process.env as any).ENCRYPTION_KEY = "a".repeat(64);
      (process.env as any).JWT_SECRET = "a".repeat(32);
      delete (process.env as any).DATABASE_URL;
      const info = secretsValidator.diagnose();
      expect(info.criticalPresent).toContain("ENCRYPTION_KEY");
      expect(info.criticalPresent).toContain("JWT_SECRET");
      expect(info.criticalMissing).toContain("DATABASE_URL");
    });

    it("includes warning for short ENCRYPTION_KEY", () => {
      (process.env as any).ENCRYPTION_KEY = "too-short";
      const info = secretsValidator.diagnose();
      expect(info.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining("64 hex characters")]),
      );
    });

    it("includes warning for short JWT_SECRET", () => {
      (process.env as any).JWT_SECRET = "short";
      (process.env as any).ENCRYPTION_KEY = "a".repeat(64);
      const info = secretsValidator.diagnose();
      expect(info.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining("at least 32 characters")]),
      );
    });

    it("returns recommendations for missing production services", () => {
      (process.env as any).NODE_ENV = "production";
      delete (process.env as any).SENTRY_DSN;
      const info = secretsValidator.diagnose();
      expect(info.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining("SENTRY_DSN")]),
      );
    });

    it("recommends REDIS_URL when absent", () => {
      delete (process.env as any).REDIS_URL;
      const info = secretsValidator.diagnose();
      expect(info.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining("REDIS_URL")]),
      );
    });
  });

  describe("static constants", () => {
    it("defines CRITICAL_SECRETS list", () => {
      expect(SecretsValidator.CRITICAL_SECRETS).toContain("ENCRYPTION_KEY");
      expect(SecretsValidator.CRITICAL_SECRETS).toContain("JWT_SECRET");
      expect(SecretsValidator.CRITICAL_SECRETS).toContain("DATABASE_URL");
    });

    it("defines PRODUCTION_REQUIRED list longer than CRITICAL_SECRETS", () => {
      expect(SecretsValidator.PRODUCTION_REQUIRED.length).toBeGreaterThan(
        SecretsValidator.CRITICAL_SECRETS.length,
      );
    });
  });
});
