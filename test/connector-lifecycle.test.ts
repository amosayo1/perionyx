import { describe, it, expect, beforeEach, vi } from "vitest";
import { connectorEventBus } from "@/modules/connector-platform/event-hooks";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import { connectorMetadataRegistry } from "@/modules/connector-platform/metadata";
import { ConnectorDiscovery } from "@/modules/connector-platform/discovery";
import { LegacyConnectorAdapter } from "@/modules/connector-platform/adapters/legacy";
import type { ConnectorConfigRecord, ConnectorHealth, ConnectorSyncResult } from "@/modules/connector-platform/types";
import { getConnectorSecretSchema, resolveConnectorSecrets } from "@/modules/connector-platform/secrets";
import { enableConnectorWebhookBridge, disableConnectorWebhookBridge } from "@/modules/connector-platform/webhook-bridge";

function makeConfig(overrides?: Partial<ConnectorConfigRecord>): ConnectorConfigRecord {
  return {
    id: "test-connector-1",
    companyId: "company-1",
    name: "Test Connector",
    kind: "mock",
    status: "configuring",
    authMethod: "api-key",
    capabilities: ["import-data", "export-data", "health-check"],
    config: { baseUrl: "https://api.example.com" },
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("Connector Lifecycle — Install → Configure → Authenticate → Validate → Connect → Sync → Health → Disconnect", () => {
  const ctx = { companyId: "company-1", userId: "user-1", role: "ADMIN" as const };
  let events: string[] = [];

  beforeEach(() => {
    events = [];
    connectorEventBus.clearSubscriptions();

    connectorPlatformRegistry.registerKind("mock", () => new LegacyConnectorAdapter({
      kind: "mock",
      label: "Mock Connector",
      description: "Test connector",
      capabilities: ["import-data", "export-data", "health-check", "settlement"],
    }));

    connectorMetadataRegistry.register({
      kind: "mock",
      label: "Mock Connector",
      description: "Test connector",
      version: "1.0.0",
      category: "developer",
      capabilities: ["import-data", "export-data", "health-check"],
      authMethods: ["api-key", "basic"],
      tags: ["test"],
    });

    connectorEventBus.subscribe("connector:installed", async () => { events.push("installed"); });
    connectorEventBus.subscribe("connector:authenticated", async () => { events.push("authenticated"); });
    connectorEventBus.subscribe("connector:connected", async () => { events.push("connected"); });
    connectorEventBus.subscribe("connector:disconnected", async () => { events.push("disconnected"); });
    connectorEventBus.subscribe("connector:validated", async () => { events.push("validated"); });
    connectorEventBus.subscribe("connector:health-check", async () => { events.push("health-check"); });
    connectorEventBus.subscribe("connector:error", async () => { events.push("error"); });
  });

  it("1. Install: creates instance and registers it", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    expect(connector).toBeDefined();
    expect(connector.kind).toBe("mock");

    await connector.initialize(config);
    connectorPlatformRegistry.registerInstance(config.id, connector);

    const instance = connectorPlatformRegistry.getInstance(config.id);
    expect(instance).toBe(connector);
  });

  it("2. Configure: config is accessible after initialization", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);

    const retrievedConfig = connector.getConfig();
    expect(retrievedConfig.name).toBe("Test Connector");
    expect(retrievedConfig.authMethod).toBe("api-key");
  });

  it("3. Authenticate: validates credentials via auth handler", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");

    const { getAuthHandler } = await import("@/modules/connector-platform/auth/handler");
    const handler = getAuthHandler("api-key");

    const validResult = await handler.authenticate({ apiKey: "sk-test-key" });
    expect(validResult.ok).toBe(true);

    const invalidResult = await handler.authenticate({});
    expect(invalidResult.ok).toBe(false);
    expect(invalidResult.message).toContain("API key is required");
  });

  it("4. Validate: connector config can be validated", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);

    const result = await connector.validateConfig();
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("5. Connect: connector returns health status", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);

    const health = await connector.connect();
    expect(health.status).toBe("GOOD");
    expect(health.lastCheckAt).toBeTruthy();
  });

  it("6. Sync: connector syncs data", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);

    const result = await connector.syncData!({ fullSync: true });
    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBe(0);
    expect(result.startedAt).toBeTruthy();
    expect(result.completedAt).toBeTruthy();
  });

  it("7. Health check: returns current status", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);

    const health = await connector.healthCheck();
    expect(health.status).toBe("GOOD");
    expect(health.lastCheckAt).toBeTruthy();
  });

  it("8. Disconnect: cleans up and unregisters", async () => {
    const config = makeConfig();
    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);
    connectorPlatformRegistry.registerInstance(config.id, connector);

    await connector.disconnect();
    expect(() => connector.getConfig()).toThrow("Connector not initialized");
  });

  it("Full lifecycle fires all expected events", async () => {
    events = [];
    const config = makeConfig();

    const connector = connectorPlatformRegistry.createInstance("mock");
    await connector.initialize(config);
    connectorPlatformRegistry.registerInstance(config.id, connector);
    await connectorEventBus.publish({
      eventType: "connector:installed", connectorId: config.id, companyId: ctx.companyId,
      timestamp: new Date().toISOString(), actorUserId: ctx.userId,
    });

    await connectorEventBus.publish({
      eventType: "connector:authenticated", connectorId: config.id, companyId: ctx.companyId,
      timestamp: new Date().toISOString(), actorUserId: ctx.userId,
    });

    await connectorEventBus.publish({
      eventType: "connector:connected", connectorId: config.id, companyId: ctx.companyId,
      timestamp: new Date().toISOString(), actorUserId: ctx.userId,
    });

    await connectorEventBus.publish({
      eventType: "connector:health-check", connectorId: config.id, companyId: ctx.companyId,
      timestamp: new Date().toISOString(), actorUserId: ctx.userId,
    });

    await connectorEventBus.publish({
      eventType: "connector:disconnected", connectorId: config.id, companyId: ctx.companyId,
      timestamp: new Date().toISOString(), actorUserId: ctx.userId,
    });

    expect(events).toContain("installed");
    expect(events).toContain("authenticated");
    expect(events).toContain("connected");
    expect(events).toContain("health-check");
    expect(events).toContain("disconnected");
  });
});

describe("Secret Schema Integration", () => {
  it("returns correct schema for each auth method", () => {
    const apiKeySchema = getConnectorSecretSchema("api-key");
    expect(apiKeySchema.references.map(r => r.key)).toEqual(["apiKey"]);

    const basicSchema = getConnectorSecretSchema("basic");
    expect(basicSchema.references.map(r => r.key)).toEqual(["username", "password"]);

    const oauth2Schema = getConnectorSecretSchema("oauth2");
    expect(oauth2Schema.references.map(r => r.key)).toEqual(["clientId", "clientSecret", "tokenUrl", "scopes"]);

    const noneSchema = getConnectorSecretSchema("none");
    expect(noneSchema.references).toHaveLength(0);
  });

  it("resolves secrets from config for config-sourced references", async () => {
    const config = makeConfig({ config: { baseUrl: "https://example.com", username: "admin" } });
    const schema = getConnectorSecretSchema("basic");
    const resolved = await resolveConnectorSecrets(config, schema);
    expect(resolved.username).toBe("admin");
  });
});

describe("Connector Discovery Integration", () => {
  const discovery = new ConnectorDiscovery();

  it("discovers providers by capability", () => {
    const results = discovery.findProviders({ capabilities: ["health-check"] });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].capabilities).toContain("health-check");
  });

  it("lists categories", () => {
    const categories = discovery.listCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("category");
    expect(categories[0]).toHaveProperty("count");
  });
});

describe("Webhook Bridge Integration", () => {
  it("enables and disables without error", () => {
    expect(() => enableConnectorWebhookBridge()).not.toThrow();
    expect(() => disableConnectorWebhookBridge()).not.toThrow();
  });

  it("publishes events after bridge is enabled", async () => {
    const received: string[] = [];
    connectorEventBus.subscribe("connector:installed", async () => { received.push("got-event"); });
    enableConnectorWebhookBridge();

    await connectorEventBus.publish({
      eventType: "connector:installed",
      connectorId: "test-id",
      companyId: "company-1",
      timestamp: new Date().toISOString(),
    });

    expect(received).toContain("got-event");
    disableConnectorWebhookBridge();
  });
});

describe("OAuth2 Auth Handler", () => {
  it("validates required fields", async () => {
    const { OAuth2AuthHandler } = await import("@/modules/connector-platform/auth/oauth2-handler");
    const handler = new OAuth2AuthHandler();

    const errors = await handler.validate({});
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors).toContain("Client ID is required");
    expect(errors).toContain("Client secret is required");
    expect(errors).toContain("Token URL is required");
  });

  it("returns auth headers", async () => {
    const { OAuth2AuthHandler } = await import("@/modules/connector-platform/auth/oauth2-handler");
    const handler = new OAuth2AuthHandler();

    const headers = handler.applyHeaders({ accessToken: "test-token" });
    expect(headers.Authorization).toBe("Bearer test-token");
  });
});

describe("Plaid Connector Adapter", () => {
  it("can be instantiated with correct kind and capabilities", async () => {
    const { PlaidConnector } = await import("@/modules/connector-platform/adapters/plaid-adapter");
    const connector = new PlaidConnector();

    expect(connector.kind).toBe("plaid");
    expect(connector.label).toBe("Plaid");
    expect(connector.capabilities).toContain("oauth");
    expect(connector.capabilities).toContain("import-data");
    expect(connector.supportedAuthMethods).toContain("oauth2");
  });

  it("validates config without errors", async () => {
    const { PlaidConnector } = await import("@/modules/connector-platform/adapters/plaid-adapter");
    const connector = new PlaidConnector();

    const config = makeConfig({ kind: "plaid", authMethod: "oauth2" });
    await connector.initialize(config);

    const result = await connector.validateConfig();
    expect(result.ok).toBe(true);
  });

  it("reports UNKNOWN health when not initialized", async () => {
    const { PlaidConnector } = await import("@/modules/connector-platform/adapters/plaid-adapter");
    const connector = new PlaidConnector();

    const health = await connector.healthCheck();
    expect(health.status).toBe("UNKNOWN");
  });
});
