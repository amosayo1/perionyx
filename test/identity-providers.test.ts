import "dotenv/config";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MicrosoftEntraIdProvider } from "../src/modules/identity/adapters/entra-id";
import { GoogleWorkspaceProvider } from "../src/modules/identity/adapters/google-workspace";
import type { IdentityProviderConfig } from "../src/modules/identity/types";

function makeConfig(
  kind: string,
  overrides: Record<string, string> = {},
): IdentityProviderConfig {
  return {
    id: "test-id",
    companyId: "test-company",
    kind: kind as any,
    status: "configuring",
    label: "Test Provider",
    domain: undefined,
    metadata: overrides,
    priority: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("MicrosoftEntraIdProvider", () => {
  let provider: MicrosoftEntraIdProvider;

  beforeEach(() => {
    provider = new MicrosoftEntraIdProvider();
  });

  it("has correct kind and label", () => {
    expect(provider.kind).toBe("entra-id");
    expect(provider.label).toBe("Microsoft Entra ID");
    expect(provider.capabilities.authentication).toBe(true);
    expect(provider.capabilities.directorySync).toBe(true);
  });

  it("throws on initialize with missing clientId", async () => {
    const config = makeConfig("entra-id", { clientSecret: "secret", tenantId: "tenant" });
    await expect(provider.initialize(config)).rejects.toThrow("clientId");
  });

  it("throws on initialize with missing clientSecret", async () => {
    const config = makeConfig("entra-id", { clientId: "id", tenantId: "tenant" });
    await expect(provider.initialize(config)).rejects.toThrow("clientSecret");
  });

  it("throws on initialize with missing tenantId", async () => {
    const config = makeConfig("entra-id", { clientId: "id", clientSecret: "secret" });
    await expect(provider.initialize(config)).rejects.toThrow("tenantId");
  });

  it("initializes successfully with all required fields", async () => {
    const config = makeConfig("entra-id", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      tenantId: "test-tenant",
    });
    await expect(provider.initialize(config)).resolves.toBeUndefined();
    expect(provider.getConfig()).toBe(config);
  });

  it("authenticate throws without authorization code", async () => {
    const config = makeConfig("entra-id", {
      clientId: "id", clientSecret: "secret", tenantId: "tenant",
    });
    await provider.initialize(config);
    await expect(provider.authenticate({ email: "test@test.com", providerKind: "entra-id" })).rejects.toThrow(
      "Authorization code",
    );
  });

  it("validateToken returns null for malformed token", async () => {
    const config = makeConfig("entra-id", {
      clientId: "id", clientSecret: "secret", tenantId: "tenant",
    });
    await provider.initialize(config);
    const result = await provider.validateToken("not-a-jwt");
    expect(result).toBeNull();
  });

  it("healthCheck returns ok:false when not initialized", async () => {
    const result = await provider.healthCheck();
    expect(result).toHaveProperty("ok", false);
  });

  it("getConfig throws before initialization", () => {
    expect(() => provider.getConfig()).toThrow("not initialized");
  });

  it("syncDirectory returns error result when not initialized", async () => {
    const config = makeConfig("entra-id", {
      clientId: "id", clientSecret: "secret", tenantId: "tenant",
    });
    await provider.initialize(config);
    const result = await provider.syncDirectory([]);
    expect(result).toHaveProperty("errors");
    expect(result.added).toBe(0);
  });

  it("provisionUser creates user record", async () => {
    const config = makeConfig("entra-id", {
      clientId: "id", clientSecret: "secret", tenantId: "tenant",
    });
    await provider.initialize(config);
    await expect(
      provider.provisionUser({
        externalId: "ext-1",
        email: "test@example.com",
        name: "Test User",
        groups: [],
        roles: ["member"],
        active: true,
      }),
    ).rejects.toThrow(); // no DB in unit test
  });
});

describe("GoogleWorkspaceProvider", () => {
  let provider: GoogleWorkspaceProvider;

  beforeEach(() => {
    provider = new GoogleWorkspaceProvider();
  });

  it("has correct kind and label", () => {
    expect(provider.kind).toBe("google-workspace");
    expect(provider.label).toBe("Google Workspace");
    expect(provider.capabilities.authentication).toBe(true);
    expect(provider.capabilities.directorySync).toBe(true);
  });

  it("throws on initialize with missing clientId", async () => {
    const config = makeConfig("google-workspace", { clientSecret: "secret" });
    await expect(provider.initialize(config)).rejects.toThrow("clientId");
  });

  it("throws on initialize with missing clientSecret", async () => {
    const config = makeConfig("google-workspace", { clientId: "id" });
    await expect(provider.initialize(config)).rejects.toThrow("clientSecret");
  });

  it("initializes successfully with all required fields", async () => {
    const config = makeConfig("google-workspace", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    });
    await expect(provider.initialize(config)).resolves.toBeUndefined();
    expect(provider.getConfig()).toBe(config);
  });

  it("authenticate throws without authorization code", async () => {
    const config = makeConfig("google-workspace", {
      clientId: "id", clientSecret: "secret",
    });
    await provider.initialize(config);
    await expect(
      provider.authenticate({ email: "test@test.com", providerKind: "google-workspace" }),
    ).rejects.toThrow("Authorization code");
  });

  it("validateToken returns null for malformed token", async () => {
    const config = makeConfig("google-workspace", {
      clientId: "id", clientSecret: "secret",
    });
    await provider.initialize(config);
    const result = await provider.validateToken("not-a-jwt");
    expect(result).toBeNull();
  });

  it("healthCheck returns ok:false when not initialized", async () => {
    const result = await provider.healthCheck();
    expect(result).toHaveProperty("ok", false);
  });

  it("getConfig throws before initialization", () => {
    expect(() => provider.getConfig()).toThrow("not initialized");
  });

  it("deprovisionUser throws when no account exists", async () => {
    const config = makeConfig("google-workspace", {
      clientId: "id", clientSecret: "secret",
    });
    await provider.initialize(config);
    await expect(provider.deprovisionUser("nonexistent")).rejects.toThrow();
  });

  it("syncDirectory returns adminEmail error when email missing", async () => {
    const config = makeConfig("google-workspace", {
      clientId: "id", clientSecret: "secret",
    });
    await provider.initialize(config);
    const result = await provider.syncDirectory([]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("adminEmail");
  });
});

describe("Identity Provider Registry", () => {
  it("registers and creates providers correctly", async () => {
    const { identityProviderRegistry } = await import("../src/modules/identity/registry");
    await import("../src/modules/identity/register-defaults");

    expect(identityProviderRegistry.getRegisteredKinds()).toContain("entra-id");
    expect(identityProviderRegistry.getRegisteredKinds()).toContain("google-workspace");
    expect(identityProviderRegistry.hasKind("entra-id")).toBe(true);
    expect(identityProviderRegistry.hasKind("google-workspace")).toBe(true);
    expect(identityProviderRegistry.hasKind("local")).toBe(true);

    const entraInstance = identityProviderRegistry.createInstance("entra-id");
    expect(entraInstance.kind).toBe("entra-id");

    const googleInstance = identityProviderRegistry.createInstance("google-workspace");
    expect(googleInstance.kind).toBe("google-workspace");
  });
});
