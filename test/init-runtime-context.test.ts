import "dotenv/config";
import crypto from "crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Deterministic AUTH_SECRET so encode()/getToken() round-trips are stable.
process.env.AUTH_SECRET ??= crypto.randomBytes(32).toString("base64");
const AUTH_SECRET = process.env.AUTH_SECRET!;

// Mock the session accessor used by the fallback path. We keep the REAL
// next-auth/jwt getToken (plus encode) so the header-verification path is
// exercised end-to-end: the regression that caused broad 500s was getToken
// being unable to read the session cookie from the request headers.
vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
  sessionTokenName: "next-auth.session-token",
}));

vi.mock("@/modules/api-keys/api-keys.service", () => ({
  ApiKeyService: { validate: vi.fn() },
  roleFromApiKeyScopes: vi.fn(() => "ADMIN"),
}));

import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { encode } from "next-auth/jwt";
import { requireRuntimeContext } from "@/runtime/context";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/app-error";
import { auth } from "@/server/auth/auth";
import { ApiKeyService, roleFromApiKeyScopes } from "@/modules/api-keys/api-keys.service";
import type { Mock } from "vitest";

const COOKIE_NAME = "next-auth.session-token";

async function makeSessionToken(claims: Record<string, unknown>): Promise<string> {
  return encode({ token: claims, secret: AUTH_SECRET, salt: COOKIE_NAME });
}

function makeRequest(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

async function expectRejectsTo(promise: Promise<unknown>, errorType: unknown, message?: RegExp) {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(errorType);
    if (message) expect((err as Error).message).toMatch(message);
    return;
  }
  throw new Error(`Expected promise to reject with ${(errorType as { name?: string }).name ?? errorType}`);
}

describe("withRuntimeContext — identity flow (Phase 29.0 C-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("proxy header path (identity headers set from a verified JWT)", () => {
    it("accepts an authenticated member whose session token matches the headers", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "ADMIN",
        tokenVersion: 1,
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
        "x-request-id": "req-1",
      });

      const tenant = await withRuntimeContext(req, async (ctx) => ctx.tenant);
      expect(tenant).toEqual({ userId: "user-1", companyId: "company-1", role: "ADMIN" });
    });

    it("rejects forged headers whose userId does not match the session (tenant boundary)", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "ADMIN",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-2",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
      });

      await expectRejectsTo(withRuntimeContext(req, async () => null), UnauthorizedError);
    });

    it("rejects forged companyId not owned by the session", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "ADMIN",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-2",
        "x-company-role": "ADMIN",
      });

      await expectRejectsTo(withRuntimeContext(req, async () => null), UnauthorizedError);
    });

    it("rejects forged role that does not match the session", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "MEMBER",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
      });

      await expectRejectsTo(withRuntimeContext(req, async () => null), UnauthorizedError);
    });

    it("rejects roles outside the CompanyRole enum even when backed by a session", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "SUPERUSER",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-1",
        "x-company-role": "SUPERUSER",
      });

      await expectRejectsTo(
        withRuntimeContext(req, async () => null),
        ForbiddenError,
        /Invalid role/,
      );
    });

    it("rejects requests with identity headers but no verifiable credential", async () => {
      // No cookie, no Authorization header — the proxy would never produce
      // this, but the runtime must fail closed (defense in depth).
      const req = makeRequest({
        "x-user-id": "user-1",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
      });

      await expectRejectsTo(withRuntimeContext(req, async () => null), UnauthorizedError);
    });

    it("accepts identity headers backed by a valid API key", async () => {
      (ApiKeyService.validate as unknown as Mock).mockResolvedValue({
        keyId: "key-1",
        companyId: "company-1",
        scopes: ["admin:all"],
      });
      (roleFromApiKeyScopes as unknown as Mock).mockReturnValue("ADMIN");

      const req = makeRequest({
        authorization: `Bearer va_${"a".repeat(64)}`,
        "x-user-id": "key-1",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
      });

      const tenant = await withRuntimeContext(req, async (ctx) => ctx.tenant);
      expect(tenant).toEqual({ userId: "key-1", companyId: "company-1", role: "ADMIN" });
    });
  });

  describe("fallback path (no proxy identity headers — Server Components / Server Actions)", () => {
    it("accepts an authenticated session via auth()", async () => {
      (auth as unknown as Mock).mockResolvedValue({
        user: { id: "user-1", activeCompanyId: "company-1", companyRole: "ADMIN" },
      });

      const tenant = await withRuntimeContext(new Request("http://localhost/api/test"), async (ctx) => ctx.tenant);
      expect(tenant).toEqual({ userId: "user-1", companyId: "company-1", role: "ADMIN" });
    });

    it("rejects unauthenticated requests (no session, no headers)", async () => {
      (auth as unknown as Mock).mockResolvedValue(null);

      await expectRejectsTo(
        withRuntimeContext(new Request("http://localhost/api/test"), async () => null),
        UnauthorizedError,
        /Authentication required/,
      );
    });

    it("rejects a session user without an active company (non-member)", async () => {
      (auth as unknown as Mock).mockResolvedValue({
        user: { id: "user-1" },
      });

      await expectRejectsTo(
        withRuntimeContext(new Request("http://localhost/api/test"), async () => null),
        ForbiddenError,
        /No active company/,
      );
    });

    it("rejects a session with an invalid role", async () => {
      (auth as unknown as Mock).mockResolvedValue({
        user: { id: "user-1", activeCompanyId: "company-1", companyRole: "BOSS" },
      });

      await expectRejectsTo(
        withRuntimeContext(new Request("http://localhost/api/test"), async () => null),
        ForbiddenError,
        /Invalid role/,
      );
    });
  });

  describe("license guard", () => {
    it("rejects a company different from LICENSE_COMPANY_ID", async () => {
      vi.stubEnv("LICENSE_COMPANY_ID", "company-licensed");
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-other",
        companyRole: "ADMIN",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-other",
        "x-company-role": "ADMIN",
      });

      await expectRejectsTo(
        withRuntimeContext(req, async () => null),
        ForbiddenError,
        /licensed for a different company/,
      );
    });
  });

  describe("RuntimeContext store propagation", () => {
    it("makes the resolved tenant visible to requireRuntimeContext inside the handler", async () => {
      const token = await makeSessionToken({
        sub: "user-1",
        activeCompanyId: "company-1",
        companyRole: "ADMIN",
      });
      const req = makeRequest({
        cookie: `${COOKIE_NAME}=${token}`,
        "x-user-id": "user-1",
        "x-company-id": "company-1",
        "x-company-role": "ADMIN",
      });

      const stored = await withRuntimeContext(req, async () => requireRuntimeContext().tenant);
      expect(stored).toEqual({ userId: "user-1", companyId: "company-1", role: "ADMIN" });
    });

    it("propagates tenant to the store on the auth() fallback path too", async () => {
      (auth as unknown as Mock).mockResolvedValue({
        user: { id: "user-1", activeCompanyId: "company-1", companyRole: "TREASURER" },
      });

      const stored = await withRuntimeContext(new Request("http://localhost/api/test"), async () => requireRuntimeContext().tenant);
      expect(stored).toEqual({ userId: "user-1", companyId: "company-1", role: "TREASURER" });
    });
  });
});
