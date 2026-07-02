import { describe, it, expect, beforeEach } from "vitest";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import { SlackConnector } from "@/modules/connector-platform/adapters/slack-connector";
import { TeamsConnector } from "@/modules/connector-platform/adapters/teams-connector";
import { evaluatePolicy, getDefaultPolicy } from "@/modules/notifications/policies";
import type { ConnectorConfigRecord } from "@/modules/connector-platform/types";
import type { NotificationPolicy } from "@/modules/connector-platform/communication-types";

function makeConfig(overrides?: Partial<ConnectorConfigRecord>): ConnectorConfigRecord {
  return {
    id: "test-comm-1",
    companyId: "company-1",
    name: "Test Communication",
    kind: "slack",
    status: "configuring",
    authMethod: "oauth2",
    capabilities: ["oauth", "health-check"],
    config: { clientId: "test-client", clientSecret: "test-secret" },
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("SlackConnector", () => {
  it("has correct identity and capabilities", () => {
    const connector = new SlackConnector();
    expect(connector.kind).toBe("slack");
    expect(connector.label).toBe("Slack");
    expect(connector.capabilities).toContain("oauth");
    expect(connector.capabilities).toContain("health-check");
    expect(connector.supportedAuthMethods).toContain("oauth2");
  });

  it("reports CRITICAL health when not initialized", async () => {
    const connector = new SlackConnector();
    const health = await connector.healthCheck();
    expect(health.status).toBe("CRITICAL");
  });

  it("rejects validateConfig when not initialized", async () => {
    const connector = new SlackConnector();
    const result = await connector.validateConfig();
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Not initialized");
  });

  it("validates config without errors", async () => {
    const connector = new SlackConnector();
    const config = makeConfig({ kind: "slack" });
    await connector.initialize(config);
    const result = await connector.validateConfig();
    expect(result.ok).toBe(true);
  });

  it("throws on getConfig when not initialized", () => {
    const connector = new SlackConnector();
    expect(() => connector.getConfig()).toThrow("Not initialized");
  });
});

describe("TeamsConnector", () => {
  it("has correct identity and capabilities", () => {
    const connector = new TeamsConnector();
    expect(connector.kind).toBe("teams");
    expect(connector.label).toBe("Microsoft Teams");
    expect(connector.capabilities).toContain("oauth");
    expect(connector.capabilities).toContain("health-check");
    expect(connector.supportedAuthMethods).toContain("oauth2");
  });

  it("reports CRITICAL health when not initialized", async () => {
    const connector = new TeamsConnector();
    const health = await connector.healthCheck();
    expect(health.status).toBe("CRITICAL");
  });

  it("rejects validateConfig when not initialized", async () => {
    const connector = new TeamsConnector();
    const result = await connector.validateConfig();
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Not initialized");
  });

  it("validates config with required fields", async () => {
    const connector = new TeamsConnector();
    const config = makeConfig({
      kind: "teams",
      config: { clientId: "test-client", clientSecret: "test-secret", tenantId: "test-tenant" },
    });
    await connector.initialize(config);
    const result = await connector.validateConfig();
    expect(result.ok).toBe(true);
  });

  it("throws on getConfig when not initialized", () => {
    const connector = new TeamsConnector();
    expect(() => connector.getConfig()).toThrow("Not initialized");
  });
});

describe("Notification Policies", () => {
  it("returns default policy with expected structure", () => {
    const policy = getDefaultPolicy();
    expect(policy.immediate).toBe(true);
    expect(typeof policy.channelPriority).toBe("number");
  });

  it("passes evaluation when no constraints are set", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    };
    const result = evaluatePolicy(getDefaultPolicy(), ctx);
    expect(result.passed).toBe(true);
  });

  it("fails evaluation for low severity below threshold", () => {
    const ctx = {
      severity: "info" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = { severityThreshold: "HIGH", channelPriority: 0 };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("Severity");
  });

  it("passes evaluation for matching severity", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = { severityThreshold: "HIGH", channelPriority: 0 };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(true);
  });

  it("fails evaluation during quiet hours", () => {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const mins = String(now.getUTCMinutes()).padStart(2, "0");
    const ctx = {
      severity: "critical" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: now,
    } as const;
    const policy: NotificationPolicy = {
      immediate: false,
      channelPriority: 0,
      quietHours: { start: `${hours}:${mins}`, end: "23:59", timezone: "UTC" },
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("quiet hours");
  });

  it("allows immediate notifications during quiet hours", () => {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const mins = String(now.getUTCMinutes()).padStart(2, "0");
    const ctx = {
      severity: "critical" as const,
      eventType: "ALERT" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: now,
    } as const;
    const policy: NotificationPolicy = {
      immediate: true,
      channelPriority: 0,
      quietHours: { start: `${hours}:${mins}`, end: "23:59", timezone: "UTC" },
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(true);
  });

  it("filters by allowed categories", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = {
      categories: ["security", "compliance"],
      channelPriority: 0,
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(false);
  });

  it("allows for matching categories", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "SECURITY_ALERT" as const,
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = {
      categories: ["security"],
      channelPriority: 0,
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(true);
  });

  it("filters by allowed departments", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "TRANSFER_COMPLETED" as const,
      department: "engineering",
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = {
      departments: ["executive"],
      channelPriority: 0,
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(false);
  });

  it("enforces executive-only restriction", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "CONFIDENTIAL_ALERT" as const,
      department: "engineering",
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = {
      executiveOnly: true,
      channelPriority: 0,
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("executive");
  });

  it("passes for executive department when executiveOnly is set", () => {
    const ctx = {
      severity: "critical" as const,
      eventType: "CONFIDENTIAL_ALERT" as const,
      department: "executive",
      companyId: "company-1",
      userId: "user-1",
      createdAt: new Date(),
    } as const;
    const policy: NotificationPolicy = {
      executiveOnly: true,
      channelPriority: 0,
    };
    const result = evaluatePolicy(policy, ctx as any);
    expect(result.passed).toBe(true);
  });
});

describe("Communication Connector Registry Integration", () => {
  beforeEach(() => {
    connectorPlatformRegistry.registerKind("slack", () => new SlackConnector());
    connectorPlatformRegistry.registerKind("teams", () => new TeamsConnector());
  });

  it("registers and creates Slack connector instances", () => {
    expect(connectorPlatformRegistry.hasKind("slack")).toBe(true);
    const instance = connectorPlatformRegistry.createInstance("slack");
    expect(instance.kind).toBe("slack");
    expect(instance.label).toBe("Slack");
  });

  it("registers and creates Teams connector instances", () => {
    expect(connectorPlatformRegistry.hasKind("teams")).toBe(true);
    const instance = connectorPlatformRegistry.createInstance("teams");
    expect(instance.kind).toBe("teams");
    expect(instance.label).toBe("Microsoft Teams");
  });

  it("can initialize through registry instance", async () => {
    const connector = connectorPlatformRegistry.createInstance("slack");
    const config = makeConfig({ kind: "slack" });
    await connector.initialize(config);
    const health = await connector.healthCheck();
    expect(health.status).toBe("CRITICAL");
  });
});
