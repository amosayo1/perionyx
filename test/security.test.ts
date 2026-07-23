import "dotenv/config";
import { describe, it, expect } from "vitest";

describe("Rate limiting", () => {
  it("allows requests within limit", async () => {
    const { rateLimit, rateLimitKey } = await import("@/server/security/rate-limit");
    const key = rateLimitKey("test", "unit-1");
    const r1 = await rateLimit(key, 5, 60000);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(4);
  });

  it("blocks requests beyond limit", async () => {
    const { rateLimit, rateLimitKey } = await import("@/server/security/rate-limit");
    const key = rateLimitKey("test", "unit-2");
    for (let i = 0; i < 5; i++) await rateLimit(key, 5, 60000);
    const r6 = await rateLimit(key, 5, 60000);
    expect(r6.ok).toBe(false);
    expect(r6.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const { rateLimit, rateLimitKey } = await import("@/server/security/rate-limit");
    const key = rateLimitKey("test", "unit-3");
    await rateLimit(key, 1, 100);
    const r2 = await rateLimit(key, 1, 100);
    expect(r2.ok).toBe(false);
    await new Promise((r) => setTimeout(r, 150));
    const r3 = await rateLimit(key, 1, 100);
    expect(r3.ok).toBe(true);
  });
});

describe("CSRF origin validation", () => {
  it("allows requests with no origin header when rejectMissingOrigin=false", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", { method: "POST" });
    const result = validateOrigin(req, false);
    expect(result.ok).toBe(true);
  });

  it("rejects requests with no origin AND no referer when rejectMissingOrigin=true", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", { method: "POST" });
    const result = validateOrigin(req, true);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Missing Origin and Referer");
  });

  it("allows requests from localhost origin", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    const result = validateOrigin(req);
    expect(result.ok).toBe(true);
  });

  it("allows requests from production origin", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { origin: "https://app.perionyx.com" },
    });
    const result = validateOrigin(req);
    expect(result.ok).toBe(true);
  });

  it("blocks requests from unknown origin", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { origin: "https://evil.com" },
    });
    const result = validateOrigin(req);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("not allowed");
  });

  it("falls back to Referer when Origin is absent", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { referer: "http://localhost:3000/dashboard" },
    });
    const result = validateOrigin(req, true);
    expect(result.ok).toBe(true);
  });

  it("rejects requests with Referer from unknown origin when rejectMissingOrigin=true", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { referer: "https://evil.com/page" },
    });
    const result = validateOrigin(req, true);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("not allowed");
  });

  it("allows requests with no origin when rejectMissingOrigin=false (API key fallback)", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", { method: "POST" });
    const result = validateOrigin(req, false);
    expect(result.ok).toBe(true);
  });

  it("blocks subdomain origin attacks", async () => {
    const { validateOrigin } = await import("@/server/security/csrf");
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { origin: "https://app.perionyx.com.evil.com" },
    });
    const result = validateOrigin(req);
    expect(result.ok).toBe(false);
  });
});

describe("Encryption", () => {
  it("encrypts and decrypts a value", async () => {
    const { encrypt, decrypt } = await import("@/server/security/encryption");
    const original = "super-secret-plaid-token-12345";
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(":");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("returns null for invalid ciphertext", async () => {
    const { decrypt } = await import("@/server/security/encryption");
    const result = decrypt("not-valid-format");
    expect(result).toBeNull();
  });

  it("produces different outputs for same input (different IV)", async () => {
    const { encrypt } = await import("@/server/security/encryption");
    const a = encrypt("same-value");
    const b = encrypt("same-value");
    expect(a).not.toBe(b);
  });
});
