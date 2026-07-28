import "dotenv/config";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ── Context Tests ──────────────────────────────────────────────────────────

import {
  withRuntimeContext,
  getRuntimeContext,
  requireRuntimeContext,
} from "@/runtime/context";

import type {
  RuntimeContext,
  TenantContext,
  RequestContext,
  TraceContext,
  PermissionContext,
  FinancialContext,
  LocaleContext,
} from "@/runtime/context";

const tenant: TenantContext = {
  userId: "user-1",
  companyId: "company-1",
  role: "ADMIN",
};

const request: RequestContext = {
  requestId: "req-1",
  correlationId: "corr-1",
  causationId: "cause-1",
  clientIp: "127.0.0.1",
  userAgent: "test-agent",
  method: "GET",
  path: "/api/test",
};

const trace: TraceContext = {
  traceId: "trace-1",
  spanId: "span-1",
  parentSpanId: "parent-1",
  baggage: { key: "value" },
};

const permission: PermissionContext = {
  permissions: ["users.read", "users.write"],
  mfaVerified: true,
  sessionStartedAt: new Date("2026-01-01"),
};

const financial: FinancialContext = {
  defaultCurrency: "USD",
  fiscalYearStart: 1,
  accountingMethod: "accrual",
  decimalPrecision: 12,
};

const locale: LocaleContext = {
  locale: "en-US",
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

describe("RuntimeContext — AsyncLocalStorage propagation", () => {
  it("returns undefined outside context scope", () => {
    expect(getRuntimeContext()).toBeUndefined();
  });

  it("stores and retrieves full context", async () => {
    await withRuntimeContext({ tenant, request, trace, permission, financial, locale }, async () => {
      const ctx = getRuntimeContext();
      expect(ctx).toBeDefined();
      expect(ctx!.tenant).toEqual(tenant);
      expect(ctx!.request).toEqual(request);
      expect(ctx!.trace).toEqual(trace);
      expect(ctx!.permission).toEqual(permission);
      expect(ctx!.financial).toEqual(financial);
      expect(ctx!.locale).toEqual(locale);
    });
  });

  it("requireRuntimeContext throws outside scope", () => {
    expect(() => requireRuntimeContext()).toThrow("RuntimeContext not available");
  });

  it("requireRuntimeContext returns context inside scope", async () => {
    await withRuntimeContext({ tenant }, async () => {
      const ctx = requireRuntimeContext();
      expect(ctx.tenant).toEqual(tenant);
    });
  });

  it("accesses tenant properties via requireRuntimeContext", async () => {
    await withRuntimeContext({ tenant, request, trace, permission, financial, locale }, async () => {
      const ctx = requireRuntimeContext();
      expect(ctx.tenant).toEqual(tenant);
      expect(ctx.tenant!.companyId).toBe("company-1");
      expect(ctx.tenant!.userId).toBe("user-1");
      expect(ctx.tenant!.role).toBe("ADMIN");
      expect(ctx.request).toEqual(request);
      expect(ctx.request?.correlationId).toBe("corr-1");
      expect(ctx.request?.requestId).toBe("req-1");
      expect(ctx.trace).toEqual(trace);
      expect(ctx.permission).toEqual(permission);
      expect(ctx.financial).toEqual(financial);
      expect(ctx.locale).toEqual(locale);
    });
  });

  it("partial context only sets provided fields", async () => {
    await withRuntimeContext({ tenant }, async () => {
      const ctx = getRuntimeContext();
      expect(ctx!.tenant).toEqual(tenant);
      expect(ctx!.request).toBeUndefined();
      expect(ctx!.trace).toBeUndefined();
      expect(ctx!.permission).toBeUndefined();
      expect(ctx!.financial).toBeUndefined();
      expect(ctx!.locale).toBeUndefined();
    });
  });

  it("nested contexts inherit parent values", async () => {
    await withRuntimeContext({ tenant, request }, async () => {
      await withRuntimeContext({ trace }, async () => {
        const ctx = getRuntimeContext();
        expect(ctx!.tenant).toEqual(tenant);
        expect(ctx!.request).toEqual(request);
        expect(ctx!.trace).toEqual(trace);
      });
    });
  });

  it("inner context overrides parent for provided fields", async () => {
    const innerTenant: TenantContext = { userId: "user-2", companyId: "company-2", role: "VIEWER" };
    await withRuntimeContext({ tenant }, async () => {
      await withRuntimeContext({ tenant: innerTenant }, async () => {
        const ctx = requireRuntimeContext();
        expect(ctx.tenant!.companyId).toBe("company-2");
        expect(ctx.tenant!.userId).toBe("user-2");
        expect(ctx.tenant!.role).toBe("VIEWER");
      });
      // outer scope still has original
      const outerCtx = requireRuntimeContext();
      expect(outerCtx.tenant!.companyId).toBe("company-1");
    });
  });

  it("context is isolated between concurrent async operations", async () => {
    const t1: TenantContext = { userId: "u1", companyId: "c1", role: "ADMIN" };
    const t2: TenantContext = { userId: "u2", companyId: "c2", role: "VIEWER" };

    const results = await Promise.all([
      withRuntimeContext({ tenant: t1 }, async () => {
        await new Promise((r) => setTimeout(r, 10));
        return requireRuntimeContext().tenant!.companyId;
      }),
      withRuntimeContext({ tenant: t2 }, async () => {
        return requireRuntimeContext().tenant!.companyId;
      }),
    ]);

    expect(results[0]).toBe("c1");
    expect(results[1]).toBe("c2");
  });
});

// ── Core Runtime Tests ─────────────────────────────────────────────────────

import { Runtime } from "@/runtime/core";

describe("Runtime — Singleton lifecycle", () => {
  let runtime: Runtime;

  beforeEach(() => {
    runtime = Runtime.getInstance();
  });

  it("returns the same singleton instance", () => {
    const r1 = Runtime.getInstance();
    const r2 = Runtime.getInstance();
    expect(r1).toBe(r2);
  });

  it("starts in UNINITIALIZED state", () => {
    expect(runtime.getState()).toBe("UNINITIALIZED");
  });

  it("isReady returns false when not ready", () => {
    expect(runtime.isReady()).toBe(false);
  });

  it("transitions through lifecycle states", async () => {
    runtime.setState("INITIALIZING");
    expect(runtime.getState()).toBe("INITIALIZING");

    await runtime.notifyReady();
    expect(runtime.getState()).toBe("READY");
    expect(runtime.isReady()).toBe(true);

    await runtime.drain();
    expect(runtime.getState()).toBe("DRAINING");

    await runtime.stop();
    expect(runtime.getState()).toBe("STOPPED");
  });

  it("handles error state", async () => {
    await runtime.handleError(new Error("test error"));
    expect(runtime.getState()).toBe("ERROR");
  });

  it("registers and retrieves services", () => {
    const serviceObj = { doWork: () => 42 };
    runtime.registerService({
      name: "test-service",
      service: serviceObj,
      version: "1.0.0",
    });

    expect(runtime.hasService("test-service")).toBe(true);
    expect(runtime.getService("test-service")).toBe(serviceObj);
    expect(runtime.getService("nonexistent")).toBeUndefined();
  });

  it("listServices returns all registered services", () => {
    runtime.registerService({ name: "svc-a", service: { a: 1 } });
    runtime.registerService({ name: "svc-b", service: { b: 2 } });

    const list = runtime.listServices();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.map((s) => s.name)).toContain("svc-a");
    expect(list.map((s) => s.name)).toContain("svc-b");
  });

  it("getMetadata returns runtime metadata", () => {
    const meta = runtime.getMetadata();
    expect(meta).toHaveProperty("version");
    expect(meta).toHaveProperty("environment");
    expect(meta).toHaveProperty("startedAt");
    expect(meta).toHaveProperty("state");
    expect(meta).toHaveProperty("modules");
    expect(Array.isArray(meta.modules)).toBe(true);
  });

  it("lifecycle hooks are called", async () => {
    const hooks = {
      onReady: vi.fn(),
      onDraining: vi.fn(),
      onStopped: vi.fn(),
      onError: vi.fn(),
    };
    runtime.setHooks(hooks);

    await runtime.notifyReady();
    expect(hooks.onReady).toHaveBeenCalledOnce();

    await runtime.drain();
    expect(hooks.onDraining).toHaveBeenCalledOnce();

    await runtime.stop();
    expect(hooks.onStopped).toHaveBeenCalledOnce();

    await runtime.handleError(new Error("fail"));
    expect(hooks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("healthCheck returns healthy when no services", async () => {
    const health = await runtime.healthCheck();
    expect(health.status).toBe("healthy");
    expect(health.services).toBeDefined();
  });

  it("healthCheck aggregates service health", async () => {
    runtime.registerService({
      name: "healthy-svc",
      service: {},
      health: async () => ({ status: "healthy" }),
    });
    runtime.registerService({
      name: "unhealthy-svc",
      service: {},
      health: async () => ({ status: "unhealthy", error: "down" }),
    });

    const health = await runtime.healthCheck();
    expect(health.status).toBe("unhealthy");
    expect(health.services["healthy-svc"].status).toBe("healthy");
    expect(health.services["unhealthy-svc"].status).toBe("unhealthy");
  });

  it("healthCheck handles service health errors gracefully", async () => {
    runtime.registerService({
      name: "throwing-svc",
      service: {},
      health: async () => {
        throw new Error("health check crashed");
      },
    });

    const health = await runtime.healthCheck();
    expect(health.services["throwing-svc"].status).toBe("unhealthy");
    expect(health.services["throwing-svc"].error).toBe("health check crashed");
  });
});

// ── Error Hierarchy Tests ──────────────────────────────────────────────────

import {
  RuntimeError,
  ConfigurationError,
  ConfigNotFoundError,
  ConfigValidationError,
  SecretError,
  SecretNotFoundError,
  SecretAccessDeniedError,
  CapabilityError,
  CapabilityNotFoundError,
  PolicyError,
  PolicyDeniedError,
  EventError,
  LifecycleError,
  BootstrapError,
  ShutdownError,
  HealthError,
} from "@/runtime/errors";

describe("Runtime Error Hierarchy", () => {
  it("RuntimeError has correct properties", () => {
    const err = new RuntimeError("test", "TEST_CODE", 400, { foo: "bar" });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST_CODE");
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ foo: "bar" });
    expect(err.name).toBe("RuntimeError");
  });

  it("RuntimeError defaults statusCode to 500", () => {
    const err = new RuntimeError("test", "CODE");
    expect(err.statusCode).toBe(500);
  });

  it("ConfigurationError inherits RuntimeError", () => {
    const err = new ConfigurationError("config failed", { key: "x" });
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err).toBeInstanceOf(ConfigurationError);
    expect(err.code).toBe("CONFIGURATION_ERROR");
    expect(err.name).toBe("ConfigurationError");
  });

  it("ConfigNotFoundError includes key and scope", () => {
    const err = new ConfigNotFoundError("db.host", "TENANT");
    expect(err).toBeInstanceOf(ConfigurationError);
    expect(err.message).toContain("db.host");
    expect(err.message).toContain("TENANT");
    expect(err.name).toBe("ConfigNotFoundError");
  });

  it("ConfigNotFoundError without scope omits scope text", () => {
    const err = new ConfigNotFoundError("db.host");
    expect(err.message).not.toContain("scope");
  });

  it("ConfigValidationError includes key and errors", () => {
    const err = new ConfigValidationError("port", ["too low", "not a number"]);
    expect(err.message).toContain("port");
    expect(err.message).toContain("too low");
    expect(err.name).toBe("ConfigValidationError");
  });

  it("SecretError inherits RuntimeError", () => {
    const err = new SecretError("secret failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err).toBeInstanceOf(SecretError);
    expect(err.code).toBe("SECRET_ERROR");
  });

  it("SecretNotFoundError includes secret name", () => {
    const err = new SecretNotFoundError("api-key");
    expect(err.message).toContain("api-key");
    expect(err.name).toBe("SecretNotFoundError");
  });

  it("SecretAccessDeniedError includes name and userId", () => {
    const err = new SecretAccessDeniedError("api-key", "user-1");
    expect(err.message).toContain("api-key");
    expect(err.message).toContain("user-1");
    expect(err.name).toBe("SecretAccessDeniedError");
  });

  it("CapabilityError inherits RuntimeError", () => {
    const err = new CapabilityError("cap failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err).toBeInstanceOf(CapabilityError);
    expect(err.code).toBe("CAPABILITY_ERROR");
  });

  it("CapabilityNotFoundError includes capabilityId", () => {
    const err = new CapabilityNotFoundError("banking.plaid");
    expect(err.message).toContain("banking.plaid");
    expect(err.name).toBe("CapabilityNotFoundError");
  });

  it("PolicyError inherits RuntimeError", () => {
    const err = new PolicyError("policy failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err).toBeInstanceOf(PolicyError);
    expect(err.code).toBe("POLICY_ERROR");
  });

  it("PolicyDeniedError includes reason and policyKey", () => {
    const err = new PolicyDeniedError("insufficient permissions", "approval.required");
    expect(err.message).toContain("insufficient permissions");
    expect(err.name).toBe("PolicyDeniedError");
  });

  it("EventError inherits RuntimeError", () => {
    const err = new EventError("event failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err.code).toBe("EVENT_ERROR");
  });

  it("LifecycleError inherits RuntimeError", () => {
    const err = new LifecycleError("lifecycle failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err).toBeInstanceOf(LifecycleError);
    expect(err.code).toBe("LIFECYCLE_ERROR");
  });

  it("BootstrapError includes phase in details", () => {
    const err = new BootstrapError("bootstrap failed", { step: "init" });
    expect(err).toBeInstanceOf(LifecycleError);
    expect(err.name).toBe("BootstrapError");
    expect(err.details).toEqual({ step: "init", phase: "bootstrap" });
  });

  it("ShutdownError includes phase in details", () => {
    const err = new ShutdownError("shutdown failed", { reason: "timeout" });
    expect(err).toBeInstanceOf(LifecycleError);
    expect(err.name).toBe("ShutdownError");
    expect(err.details).toEqual({ reason: "timeout", phase: "shutdown" });
  });

  it("HealthError inherits RuntimeError", () => {
    const err = new HealthError("health failed");
    expect(err).toBeInstanceOf(RuntimeError);
    expect(err.code).toBe("HEALTH_ERROR");
    expect(err.name).toBe("HealthError");
  });
});

// ── Secret Provider Tests ──────────────────────────────────────────────────

import { EnvironmentSecretProvider } from "@/runtime/secrets/providers/environment";
import { AWSSecretsProvider } from "@/runtime/secrets/providers/aws-secrets";
import { AzureKeyVaultProvider } from "@/runtime/secrets/providers/azure-keyvault";
import { GCPSecretProvider } from "@/runtime/secrets/providers/gcp-secret-manager";
import { VaultSecretProvider } from "@/runtime/secrets/providers/vault";

describe("EnvironmentSecretProvider", () => {
  let provider: EnvironmentSecretProvider;

  beforeEach(() => {
    provider = new EnvironmentSecretProvider();
  });

  it("has correct name and type", () => {
    expect(provider.name).toBe("environment");
    expect(provider.type).toBe("ENVIRONMENT");
  });

  it("initialize does not throw", async () => {
    await expect(provider.initialize()).resolves.toBeUndefined();
  });

  it("getSecret returns null for missing key", async () => {
    const result = await provider.getSecret("NONEXISTENT_KEY_12345");
    expect(result).toBeNull();
  });

  it("setSecret and getSecret round-trip", async () => {
    await provider.setSecret("TEST_SECRET_XYZ", "hello-world");
    const result = await provider.getSecret("TEST_SECRET_XYZ");
    expect(result).toBe("hello-world");
    delete process.env["PERIONYX_SECRET_TEST_SECRET_XYZ"];
  });

  it("hasSecret returns true for existing key", async () => {
    await provider.setSecret("HAS_SECRET_TEST", "value");
    expect(await provider.hasSecret("HAS_SECRET_TEST")).toBe(true);
    delete process.env["PERIONYX_SECRET_HAS_SECRET_TEST"];
  });

  it("hasSecret returns false for missing key", async () => {
    expect(await provider.hasSecret("NONEXISTENT_HAS_TEST")).toBe(false);
  });

  it("deleteSecret removes key", async () => {
    await provider.setSecret("DEL_SECRET_TEST", "value");
    const deleted = await provider.deleteSecret("DEL_SECRET_TEST");
    expect(deleted).toBe(true);
    expect(await provider.getSecret("DEL_SECRET_TEST")).toBeNull();
  });

  it("deleteSecret returns false for missing key", async () => {
    const deleted = await provider.deleteSecret("NONEXISTENT_DEL_TEST");
    expect(deleted).toBe(false);
  });

  it("healthCheck returns healthy", async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("AWS Secrets Provider (stub)", () => {
  let provider: AWSSecretsProvider;

  beforeEach(() => {
    provider = new AWSSecretsProvider();
  });

  it("has correct name and type", () => {
    expect(provider.name).toBe("aws-secrets");
    expect(provider.type).toBe("AWS_SECRETS");
  });

  it("healthCheck returns unhealthy when not configured", async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(false);
    expect(health.error).toContain("AWS_REGION");
  });

  it("getSecret returns null when not configured", async () => {
    expect(await provider.getSecret("key")).toBeNull();
  });
});

describe("Azure Key Vault Provider (stub)", () => {
  let provider: AzureKeyVaultProvider;

  beforeEach(() => {
    provider = new AzureKeyVaultProvider();
  });

  it("has correct name and type", () => {
    expect(provider.name).toBe("azure-keyvault");
    expect(provider.type).toBe("AZURE_KEYVAULT");
  });

  it("healthCheck returns unhealthy when not configured", async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(false);
    expect(health.error).toContain("AZURE_KEY_VAULT_URL");
  });
});

describe("GCP Secret Manager Provider (stub)", () => {
  let provider: GCPSecretProvider;

  beforeEach(() => {
    provider = new GCPSecretProvider();
  });

  it("has correct name and type", () => {
    expect(provider.name).toBe("gcp-secrets");
    expect(provider.type).toBe("GCP_SECRET_MANAGER");
  });

  it("healthCheck returns unhealthy when not configured", async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(false);
    expect(health.error).toContain("GCP_PROJECT_ID");
  });
});

describe("Vault Provider (stub)", () => {
  let provider: VaultSecretProvider;

  beforeEach(() => {
    provider = new VaultSecretProvider();
  });

  it("has correct name and type", () => {
    expect(provider.name).toBe("vault");
    expect(provider.type).toBe("VAULT");
  });

  it("healthCheck returns unhealthy when not configured", async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(false);
    expect(health.error).toContain("VAULT_ADDR");
  });
});

// ── Barrel Export Tests ─────────────────────────────────────────────────────

import { runtime as runtimeSingleton } from "@/runtime";
import { ConfigurationRuntime } from "@/runtime/configuration";
import { SecretRuntime } from "@/runtime/secrets";

describe("Runtime barrel exports", () => {
  it("exports runtime singleton", () => {
    expect(runtimeSingleton).toBeDefined();
    expect(runtimeSingleton).toBeInstanceOf(Runtime);
  });

  it("exports ConfigurationRuntime class", () => {
    expect(ConfigurationRuntime).toBeDefined();
    expect(typeof ConfigurationRuntime.create).toBe("function");
    expect(typeof ConfigurationRuntime.getInstance).toBe("function");
  });

  it("exports SecretRuntime class", () => {
    expect(SecretRuntime).toBeDefined();
    expect(typeof SecretRuntime.create).toBe("function");
    expect(typeof SecretRuntime.getInstance).toBe("function");
  });
});
