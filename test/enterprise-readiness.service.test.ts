import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    identityProvider: { findMany: vi.fn() },
    organizationUnit: { findMany: vi.fn() },
    companyMembership: { findMany: vi.fn() },
    externalAccount: { findMany: vi.fn() },
    wallet: { findMany: vi.fn() },
    connectorConfig: { findMany: vi.fn() },
    policy: { count: vi.fn() },
    approvalRule: { count: vi.fn() },
  },
}));

vi.mock("@/modules/governance/governance.service", () => ({
  GovernanceService: {
    getMetrics: vi.fn(),
  },
}));

vi.mock("@/modules/operations/operations.service", () => ({
  OperationsService: {
    getConnectorHealth: vi.fn(),
  },
}));

vi.mock("@/modules/workflow/engine", () => ({
  WorkflowEngine: vi.fn().mockImplementation(() => ({
    getMetrics: vi.fn(),
  })),
}));

vi.mock("@/modules/ai-provider/registry", () => ({
  aiProviderRegistry: {
    getActiveProviders: vi.fn(),
  },
}));

vi.mock("@/modules/connector-platform", () => ({
  connectorMetadataRegistry: {},
}));

import { prisma } from "@/server/db/prisma";
import { EnterpriseReadinessService } from "@/modules/onboarding/enterprise-readiness.service";
import { GovernanceService } from "@/modules/governance/governance.service";
import { OperationsService } from "@/modules/operations/operations.service";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import type { TenantContext } from "@/server/context/tenant-context";
import type { Mock } from "vitest";

function createContext(): TenantContext {
  return { userId: "user-1", companyId: "company-1", role: "OWNER" };
}

describe("EnterpriseReadinessService", () => {
  let service: EnterpriseReadinessService;
  let ctx: TenantContext;

  beforeEach(() => {
    service = new EnterpriseReadinessService();
    ctx = createContext();
    vi.clearAllMocks();
  });

  describe("evaluate", () => {
    it("returns a report with 12 checks", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([
        { id: "1", status: "active" },
      ]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([
        { id: "1", type: "DEPARTMENT" },
        { id: "2", type: "COST_CENTER" },
      ]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([
        { id: "1", userId: "u1", role: "OWNER", user: { id: "u1", name: "Admin", email: "admin@test.com" } },
        { id: "2", userId: "u2", role: "MEMBER", user: { id: "u2", name: "User", email: "user@test.com" } },
        { id: "3", userId: "u3", role: "MEMBER", user: { id: "u3", name: "User3", email: "user3@test.com" } },
      ]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([
        { id: "a1", currency: "USD", type: "CHECKING" },
      ]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([
        { id: "w1", currency: "USD" },
      ]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([
        { id: "c1", type: "plaid", active: true, config: { healthStatus: "GOOD" } },
      ]);
      (prisma.policy.count as Mock).mockResolvedValue(2);
      (prisma.approvalRule.count as Mock).mockResolvedValue(3);

      (GovernanceService.getMetrics as Mock).mockResolvedValue({
        activePolicies: 5,
        healthScore: { overall: 85, level: "healthy" },
        activeFrameworks: 2,
        violations: { open: 1, critical: 0 },
      });

      (OperationsService.getConnectorHealth as Mock).mockResolvedValue([
        { id: "c1", status: "GOOD", name: "Plaid" },
        { id: "c2", status: "GOOD", name: "QuickBooks" },
      ]);

      const mockEngine = {
        getMetrics: vi.fn().mockResolvedValue({
          totalDefinitions: 3,
          activeDefinitions: 2,
          totalInstances: 50,
          successRate: 95,
        }),
      };
      (WorkflowEngine as unknown as Mock).mockImplementation(() => mockEngine);

      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([
        { kind: "openai", label: "OpenAI" },
      ]);

      const report = await service.evaluate(ctx);

      expect(report.checks).toHaveLength(12);
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.passed + report.summary.warned + report.summary.failed).toBe(12);
      expect(report.completedAt).toBeTruthy();
    });

    it("includes all 12 domain names", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("not ready"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("not ready"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("not ready")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const domains = report.checks.map((c) => c.domain);
      expect(domains).toEqual([
        "identity", "organization", "users", "treasury",
        "banks", "erp", "accounting",
        "governance", "workflow", "automation",
        "ai", "connectors",
      ]);
    });
  });

  describe("checkIdentity", () => {
    it("returns PASS with active provider", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([
        { id: "1", status: "active" },
      ]);
      const report = await service.evaluate(ctx);
      const identity = report.checks.find((c) => c.domain === "identity")!;
      expect(identity.status).toBe("PASS");
      expect(identity.score).toBe(100);
    });

    it("returns FAIL with no providers", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const identity = report.checks.find((c) => c.domain === "identity")!;
      expect(identity.status).toBe("FAIL");
      expect(identity.score).toBe(0);
    });

    it("returns FAIL with inactive providers only", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([
        { id: "1", status: "inactive" },
      ]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const identity = report.checks.find((c) => c.domain === "identity")!;
      expect(identity.status).toBe("FAIL");
      expect(identity.score).toBe(25);
    });

    it("handles exceptions gracefully", async () => {
      (prisma.identityProvider.findMany as Mock).mockRejectedValue(new Error("db error"));
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const identity = report.checks.find((c) => c.domain === "identity")!;
      expect(identity.status).toBe("FAIL");
      expect(identity.score).toBe(0);
    });
  });

  describe("checkOrganization", () => {
    it("returns PASS with multiple org unit types", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([
        { id: "1", type: "DEPARTMENT" },
        { id: "2", type: "COST_CENTER" },
        { id: "3", type: "BRANCH" },
      ]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const org = report.checks.find((c) => c.domain === "organization")!;
      expect(org.status).toBe("PASS");
      expect(org.score).toBe(100);
    });

    it("returns WARN with single org unit type", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([
        { id: "1", type: "DEPARTMENT" },
      ]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const org = report.checks.find((c) => c.domain === "organization")!;
      expect(org.status).toBe("WARN");
      expect(org.score).toBe(60);
    });
  });

  describe("checkUsers", () => {
    it("returns PASS with 3+ users including admin", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([
        { id: "1", role: "OWNER", user: { id: "u1", name: "Admin", email: "admin@t.com" } },
        { id: "2", role: "MEMBER", user: { id: "u2", name: "User2", email: "u2@t.com" } },
        { id: "3", role: "MEMBER", user: { id: "u3", name: "User3", email: "u3@t.com" } },
      ]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const users = report.checks.find((c) => c.domain === "users")!;
      expect(users.status).toBe("PASS");
      expect(users.score).toBe(100);
    });
  });

  describe("checkGovernance", () => {
    it("returns scores from governance metrics", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockResolvedValue({
        activePolicies: 3,
        healthScore: { overall: 92, level: "good" },
        activeFrameworks: 2,
        violations: { open: 0, critical: 0 },
      });
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const gov = report.checks.find((c) => c.domain === "governance")!;
      expect(gov.status).toBe("PASS");
      expect(gov.score).toBe(92);
    });

    it("returns FAIL when governance health is critical", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockResolvedValue({
        activePolicies: 1,
        healthScore: { overall: 30, level: "critical" },
        activeFrameworks: 0,
        violations: { open: 5, critical: 2 },
      });
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const gov = report.checks.find((c) => c.domain === "governance")!;
      expect(gov.status).toBe("FAIL");
      expect(gov.score).toBe(30);
    });
  });

  describe("checkWorkflow", () => {
    it("returns PASS with high success rate", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockResolvedValue({
          totalDefinitions: 2,
          activeDefinitions: 2,
          totalInstances: 100,
          successRate: 95,
        }),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const wf = report.checks.find((c) => c.domain === "workflow")!;
      expect(wf.status).toBe("PASS");
      expect(wf.score).toBe(100);
    });

    it("returns WARN with low success rate", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockResolvedValue({
          totalDefinitions: 1,
          activeDefinitions: 1,
          totalInstances: 20,
          successRate: 60,
        }),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const wf = report.checks.find((c) => c.domain === "workflow")!;
      expect(wf.status).toBe("WARN");
      expect(wf.score).toBe(60);
    });
  });

  describe("checkAutomation", () => {
    it("returns PASS with policies or rules", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(5);
      (prisma.approvalRule.count as Mock).mockResolvedValue(3);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const auto = report.checks.find((c) => c.domain === "automation")!;
      expect(auto.status).toBe("PASS");
      expect(auto.score).toBe(100);
    });

    it("returns WARN with no automation", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const auto = report.checks.find((c) => c.domain === "automation")!;
      expect(auto.status).toBe("WARN");
      expect(auto.score).toBe(30);
    });
  });

  describe("checkAi", () => {
    it("returns PASS with active providers", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([
        { kind: "openai", label: "OpenAI", enabled: true, defaultModel: "gpt-4" },
      ]);

      const report = await service.evaluate(ctx);
      const ai = report.checks.find((c) => c.domain === "ai")!;
      expect(ai.status).toBe("PASS");
      expect(ai.score).toBe(100);
    });

    it("returns WARN with no providers", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const ai = report.checks.find((c) => c.domain === "ai")!;
      expect(ai.status).toBe("WARN");
      expect(ai.score).toBe(20);
    });
  });

  describe("checkConnectors", () => {
    it("returns PASS with all healthy connectors", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockResolvedValue([
        { id: "c1", status: "GOOD", name: "Plaid" },
        { id: "c2", status: "GOOD", name: "SAP" },
      ]);
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const conn = report.checks.find((c) => c.domain === "connectors")!;
      expect(conn.status).toBe("PASS");
      expect(conn.score).toBe(100);
    });

    it("returns FAIL with critical connectors", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockResolvedValue([
        { id: "c1", status: "GOOD", name: "Plaid" },
        { id: "c2", status: "CRITICAL", name: "SAP" },
      ]);
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const conn = report.checks.find((c) => c.domain === "connectors")!;
      expect(conn.status).toBe("FAIL");
      expect(conn.score).toBe(20);
    });
  });

  describe("report generation", () => {
    it("deduplicates suggestions across checks", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      expect(report.suggestions).toBeInstanceOf(Array);
      expect(new Set(report.suggestions).size).toBe(report.suggestions.length);
    });

    it("calculates overallScore correctly", async () => {
      (prisma.identityProvider.findMany as Mock).mockResolvedValue([]);
      (prisma.organizationUnit.findMany as Mock).mockResolvedValue([]);
      (prisma.companyMembership.findMany as Mock).mockResolvedValue([]);
      (prisma.externalAccount.findMany as Mock).mockResolvedValue([]);
      (prisma.wallet.findMany as Mock).mockResolvedValue([]);
      (prisma.connectorConfig.findMany as Mock).mockResolvedValue([]);
      (prisma.policy.count as Mock).mockResolvedValue(0);
      (prisma.approvalRule.count as Mock).mockResolvedValue(0);
      (GovernanceService.getMetrics as Mock).mockRejectedValue(new Error("no"));
      (OperationsService.getConnectorHealth as Mock).mockRejectedValue(new Error("no"));
      (WorkflowEngine as unknown as Mock).mockImplementation(() => ({
        getMetrics: vi.fn().mockRejectedValue(new Error("no")),
      }));
      (aiProviderRegistry.getActiveProviders as Mock).mockResolvedValue([]);

      const report = await service.evaluate(ctx);
      const avg = Math.round(report.checks.reduce((s, c) => s + c.score, 0) / report.checks.length);
      expect(report.overallScore).toBe(avg);
    });
  });
});
