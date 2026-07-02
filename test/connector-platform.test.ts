import { describe, it, expect, beforeEach } from "vitest";
import { connectorEventBus, type ConnectorEventPayload } from "@/modules/connector-platform/event-hooks";
import { connectorMetadataRegistry } from "@/modules/connector-platform/metadata";
import { ConnectorDiscovery } from "@/modules/connector-platform/discovery";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import { getConnectorSecretSchema } from "@/modules/connector-platform/secrets";

describe("ConnectorEventBus", () => {
  beforeEach(() => {
    connectorEventBus.clearSubscriptions();
  });

  it("should publish and receive events", async () => {
    const received: ConnectorEventPayload[] = [];
    connectorEventBus.subscribe("connector:installed", async (payload) => {
      received.push(payload);
    });

    await connectorEventBus.publish({
      eventType: "connector:installed",
      connectorId: "test-1",
      companyId: "company-1",
      timestamp: new Date().toISOString(),
      metadata: { kind: "plaid" },
    });

    expect(received).toHaveLength(1);
    expect(received[0].connectorId).toBe("test-1");
    expect(received[0].eventType).toBe("connector:installed");
  });

  it("should handle multiple subscribers for the same event", async () => {
    let count1 = 0;
    let count2 = 0;
    connectorEventBus.subscribe("connector:error", async () => { count1++; });
    connectorEventBus.subscribe("connector:error", async () => { count2++; });

    await connectorEventBus.publish({
      eventType: "connector:error",
      connectorId: "test-2",
      companyId: "company-1",
      timestamp: new Date().toISOString(),
    });

    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  it("should not fail when no subscribers exist", async () => {
    await expect(
      connectorEventBus.publish({
        eventType: "connector:connected",
        connectorId: "test-3",
        companyId: "company-1",
        timestamp: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  it("should unsubscribe handlers", async () => {
    let count = 0;
    const handler = async () => { count++; };
    connectorEventBus.subscribe("connector:disconnected", handler);
    connectorEventBus.unsubscribe("connector:disconnected", handler);

    await connectorEventBus.publish({
      eventType: "connector:disconnected",
      connectorId: "test-4",
      companyId: "company-1",
      timestamp: new Date().toISOString(),
    });

    expect(count).toBe(0);
  });
});

describe("ConnectorMetadataRegistry", () => {
  beforeEach(() => {
    connectorMetadataRegistry.unregister("mock" as any);
  });

  it("should register and retrieve metadata", () => {
    connectorMetadataRegistry.register({
      kind: "mock",
      label: "Mock Connector",
      description: "Test connector",
      version: "1.0.0",
      category: "developer",
      capabilities: ["import-data", "export-data"],
      authMethods: ["api-key"],
      tags: ["test"],
    });

    const meta = connectorMetadataRegistry.get("mock");
    expect(meta).toBeDefined();
    expect(meta!.label).toBe("Mock Connector");
    expect(meta!.category).toBe("developer");
  });

  it("should find by capability", () => {
    connectorMetadataRegistry.register({
      kind: "mock",
      label: "Mock",
      description: "",
      version: "1.0.0",
      category: "developer",
      capabilities: ["settlement", "health-check"],
      authMethods: ["none"],
      tags: [],
    });

    const results = connectorMetadataRegistry.findByCapability("settlement");
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("mock");
  });
});

describe("ConnectorDiscovery", () => {
  const discovery = new ConnectorDiscovery();

  beforeEach(() => {
    connectorMetadataRegistry.unregister("mock" as any);
    connectorMetadataRegistry.register({
      kind: "mock",
      label: "Mock Connector",
      description: "Test connector",
      version: "1.0.0",
      category: "developer",
      capabilities: ["import-data", "export-data", "settlement"],
      authMethods: ["api-key", "basic"],
      tags: ["test", "mock"],
    });
  });

  it("should find providers by category", () => {
    const results = discovery.findProviders({ category: "developer" });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("should find providers by capability", () => {
    const results = discovery.findProviders({ capabilities: ["settlement"] });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("should return empty for unmatched queries", () => {
    const results = discovery.findProviders({ search: "nonexistent-provider" });
    expect(results).toHaveLength(0);
  });
});

describe("Secret Schema", () => {
  it("should return api-key schema", () => {
    const schema = getConnectorSecretSchema("api-key");
    expect(schema.references).toHaveLength(1);
    expect(schema.references[0].key).toBe("apiKey");
  });

  it("should return basic auth schema", () => {
    const schema = getConnectorSecretSchema("basic");
    expect(schema.references).toHaveLength(2);
    expect(schema.references.map((r) => r.key)).toContain("username");
    expect(schema.references.map((r) => r.key)).toContain("password");
  });

  it("should return empty schema for none", () => {
    const schema = getConnectorSecretSchema("none");
    expect(schema.references).toHaveLength(0);
  });

  it("should return oauth2 schema", () => {
    const schema = getConnectorSecretSchema("oauth2");
    const keys = schema.references.map((r) => r.key);
    expect(keys).toContain("clientId");
    expect(keys).toContain("clientSecret");
    expect(keys).toContain("tokenUrl");
  });
});

describe("ConnectorPlatformRegistry", () => {
  it("should register and create connector kinds", () => {
    const mockFactory = () => ({ kind: "mock", label: "Mock" } as any);
    connectorPlatformRegistry.registerKind("mock" as any, mockFactory);
    expect(connectorPlatformRegistry.hasKind("mock" as any)).toBe(true);

    const instance = connectorPlatformRegistry.createInstance("mock" as any);
    expect(instance.kind).toBe("mock");
  });

  it("should throw for unknown kinds", () => {
    expect(() => connectorPlatformRegistry.createInstance("unknown-kind" as any)).toThrow();
  });

  it("should register and retrieve instances", () => {
    const instance = { kind: "mock", label: "Mock Instance" } as any;
    connectorPlatformRegistry.registerInstance("inst-1", instance);
    expect(connectorPlatformRegistry.getInstance("inst-1")).toBe(instance);
    expect(connectorPlatformRegistry.getInstance("nonexistent")).toBeUndefined();
  });
});
