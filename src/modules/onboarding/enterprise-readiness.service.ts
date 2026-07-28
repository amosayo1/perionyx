import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import type { TenantContext } from "@/server/context/tenant-context";
import { OperationsService } from "@/modules/operations/operations.service";
import { GovernanceService } from "@/modules/governance/governance.service";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import { connectorMetadataRegistry } from "@/modules/connector-platform";

export interface ReadinessCheckResult {
  domain: string;
  label: string;
  status: "PASS" | "WARN" | "FAIL";
  score: number;
  details: string[];
  suggestions: string[];
}

export interface ReadinessReport {
  checks: ReadinessCheckResult[];
  overallScore: number;
  summary: {
    passed: number;
    warned: number;
    failed: number;
  };
  suggestions: string[];
  completedAt: string;
}

export class EnterpriseReadinessService {
  async evaluate(ctx: TenantContext): Promise<ReadinessReport> {
    const checks = await Promise.all([
      this.checkIdentity(ctx),
      this.checkOrganization(ctx),
      this.checkUsers(ctx),
      this.checkTreasury(ctx),
      this.checkBanks(ctx),
      this.checkErp(ctx),
      this.checkAccounting(ctx),
      this.checkGovernance(ctx),
      this.checkWorkflow(ctx),
      this.checkAutomation(ctx),
      this.checkAi(ctx),
      this.checkConnectors(ctx),
    ]);

    const passed = checks.filter((c) => c.status === "PASS").length;
    const warned = checks.filter((c) => c.status === "WARN").length;
    const failed = checks.filter((c) => c.status === "FAIL").length;

    const totalScore = checks.reduce((s, c) => s + c.score, 0);
    const overallScore = checks.length > 0 ? Math.round(totalScore / checks.length) : 0;

    const allSuggestions = checks.flatMap((c) => c.suggestions);

    return {
      checks,
      overallScore,
      summary: { passed, warned, failed },
      suggestions: [...new Set(allSuggestions)],
      completedAt: new Date().toISOString(),
    };
  }

  private async checkIdentity(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const configs = await prisma.identityProvider.findMany({
        where: { companyId: ctx.companyId },
      });

      if (configs.length === 0) {
        details.push("No identity providers configured");
        suggestions.push("Configure at least one identity provider (Entra ID, Google Workspace, etc.)");
        return { domain: "identity", label: "Identity", status: "FAIL", score: 0, details, suggestions };
      }

      const activeCount = configs.filter((c) => c.status === "active").length;
      details.push(`${activeCount}/${configs.length} identity providers active`);

      if (activeCount === 0) {
        suggestions.push("Activate your identity provider configuration");
        return { domain: "identity", label: "Identity", status: "FAIL", score: 25, details, suggestions };
      }

      return { domain: "identity", label: "Identity", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: identity");
      return { domain: "identity", label: "Identity", status: "FAIL", score: 0, details: ["Could not verify identity configuration"], suggestions: ["Check identity provider setup"] };
    }
  }

  private async checkOrganization(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const orgUnits = await prisma.organizationUnit.findMany({
        where: { companyId: ctx.companyId },
        select: { id: true, type: true },
      });

      if (orgUnits.length === 0) {
        details.push("No organization units created");
        suggestions.push("Create at least one organization unit (subsidiary, department, etc.)");
        return { domain: "organization", label: "Organization", status: "FAIL", score: 0, details, suggestions };
      }

      const types = [...new Set(orgUnits.map((u) => u.type))];
      details.push(`${orgUnits.length} organization units across ${types.length} types`);

      if (types.length < 2) {
        suggestions.push("Consider creating multiple unit types (e.g., departments, cost centers) for a complete org structure");
        return { domain: "organization", label: "Organization", status: "WARN", score: 60, details, suggestions };
      }

      return { domain: "organization", label: "Organization", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: organization");
      return { domain: "organization", label: "Organization", status: "FAIL", score: 0, details: ["Could not verify organization structure"], suggestions: ["Set up organization hierarchy"] };
    }
  }

  private async checkUsers(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const memberships = await prisma.companyMembership.findMany({
        where: { companyId: ctx.companyId },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      if (memberships.length === 0) {
        details.push("No users configured");
        suggestions.push("Invite team members to the platform");
        return { domain: "users", label: "Users", status: "FAIL", score: 0, details, suggestions };
      }

      details.push(`${memberships.length} users configured`);
      const roles = [...new Set(memberships.map((m) => m.role))];
      details.push(`Roles: ${roles.join(", ")}`);

      const hasAdmin = memberships.some((m) => m.role === "OWNER" || m.role === "ADMIN");
      if (!hasAdmin) {
        suggestions.push("Assign at least one user the Administrator role");
        return { domain: "users", label: "Users", status: "WARN", score: 50, details, suggestions };
      }

      if (memberships.length < 3) {
        suggestions.push("Consider adding more users for separation of duties (at least 3)");
        return { domain: "users", label: "Users", status: "WARN", score: 70, details, suggestions };
      }

      return { domain: "users", label: "Users", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: users");
      return { domain: "users", label: "Users", status: "FAIL", score: 0, details: ["Could not verify users"], suggestions: ["Invite users to the platform"] };
    }
  }

  private async checkTreasury(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const accounts = await prisma.externalAccount.findMany({
        where: { companyId: ctx.companyId },
        select: { id: true, currency: true, type: true },
      });

      const wallets = await prisma.wallet.findMany({
        where: { companyId: ctx.companyId },
        select: { id: true, currency: true },
      });

      if (accounts.length === 0 && wallets.length === 0) {
        details.push("No treasury accounts or wallets");
        suggestions.push("Configure bank accounts or internal wallets to start managing treasury");
        return { domain: "treasury", label: "Treasury", status: "FAIL", score: 0, details, suggestions };
      }

      if (accounts.length > 0) {
        details.push(`${accounts.length} external accounts`);
        const currencies = [...new Set(accounts.map((a) => a.currency))];
        details.push(`Currencies: ${currencies.join(", ")}`);
      }

      if (wallets.length > 0) {
        details.push(`${wallets.length} internal wallets`);
      }

      if (accounts.length === 0) {
        suggestions.push("Connect bank accounts via Plaid, Lean, or Tarabut for balance tracking");
        return { domain: "treasury", label: "Treasury", status: "WARN", score: 40, details, suggestions };
      }

      return { domain: "treasury", label: "Treasury", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: treasury");
      return { domain: "treasury", label: "Treasury", status: "FAIL", score: 0, details: ["Could not verify treasury setup"], suggestions: ["Configure bank accounts and wallets"] };
    }
  }

  private async checkBanks(ctx: TenantContext): Promise<ReadinessCheckResult> {
    return this.checkConnectorCategory(ctx, ["plaid", "lean", "tarabut"], "Banks", "bank");
  }

  private async checkErp(ctx: TenantContext): Promise<ReadinessCheckResult> {
    return this.checkConnectorCategory(ctx, ["sap", "netsuite", "dynamics365"], "ERP", "ERP");
  }

  private async checkAccounting(ctx: TenantContext): Promise<ReadinessCheckResult> {
    return this.checkConnectorCategory(ctx, ["quickbooks", "xero"], "Accounting", "accounting tool");
  }

  private async checkConnectorCategory(ctx: TenantContext, kinds: string[], label: string, typeLabel: string): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const connectors = await prisma.connectorConfig.findMany({
        where: { companyId: ctx.companyId, type: { in: kinds } },
      });

      if (connectors.length === 0) {
        details.push(`No ${label.toLowerCase()} integrations configured`);
        suggestions.push(`Configure at least one ${typeLabel} integration (${kinds.join(", ")})`);
        return { domain: label.toLowerCase(), label, status: "FAIL", score: 0, details, suggestions };
      }

      const activeCount = connectors.filter((c) => c.active).length;
      details.push(`${activeCount}/${connectors.length} ${label.toLowerCase()} connectors active`);

      const unhealthy = connectors.filter((c) => {
        const cfg = c.config as Record<string, any> | null;
        return cfg?.healthStatus === "CRITICAL" || cfg?.healthStatus === "UNKNOWN";
      });

      if (unhealthy.length > 0) {
        details.push(`${unhealthy.length} connector(s) with health issues`);
        suggestions.push(`Check health status of ${label.toLowerCase()} connectors`);
        return { domain: label.toLowerCase(), label, status: "WARN", score: 50, details, suggestions };
      }

      if (activeCount < connectors.length) {
        return { domain: label.toLowerCase(), label, status: "WARN", score: 60, details, suggestions };
      }

      return { domain: label.toLowerCase(), label, status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: %s connectors", label);
      return {
        domain: label.toLowerCase(), label, status: "FAIL", score: 0,
        details: [`Could not verify ${label.toLowerCase()} integrations`],
        suggestions: [`Check ${label.toLowerCase()} connector configuration`],
      };
    }
  }

  private async checkGovernance(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const metrics = await GovernanceService.getMetrics(ctx).catch(() => null);

      if (!metrics || metrics.activePolicies === 0) {
        details.push("No governance policies configured");
        suggestions.push("Create approval and compliance policies to enforce governance");
        return { domain: "governance", label: "Governance", status: "FAIL", score: 0, details, suggestions };
      }

      details.push(`${metrics.activePolicies} active policies`);
      details.push(`Health score: ${metrics.healthScore.overall} (${metrics.healthScore.level})`);
      details.push(`${metrics.activeFrameworks} active frameworks`);
      details.push(`${metrics.violations.open} open violations`);

      if (metrics.healthScore.overall < 50) {
        suggestions.push("Governance health is critical — review and resolve violations");
        return { domain: "governance", label: "Governance", status: "FAIL", score: metrics.healthScore.overall, details, suggestions };
      }

      if (metrics.healthScore.overall < 75) {
        suggestions.push("Improve governance health by resolving open violations");
        return { domain: "governance", label: "Governance", status: "WARN", score: metrics.healthScore.overall, details, suggestions };
      }

      return { domain: "governance", label: "Governance", status: "PASS", score: metrics.healthScore.overall, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: governance");
      return { domain: "governance", label: "Governance", status: "FAIL", score: 0, details: ["Could not verify governance"], suggestions: ["Configure governance framework"] };
    }
  }

  private async checkWorkflow(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const engine = new WorkflowEngine();
      const metrics = await engine.getMetrics(ctx).catch(() => null);

      if (!metrics || metrics.totalDefinitions === 0) {
        details.push("No workflow definitions");
        suggestions.push("Create at least one workflow definition (e.g., approval workflow)");
        return { domain: "workflow", label: "Workflow", status: "FAIL", score: 0, details, suggestions };
      }

      details.push(`${metrics.totalDefinitions} workflow definitions`);
      details.push(`${metrics.activeDefinitions} active`);
      details.push(`${metrics.totalInstances} total instances`);
      details.push(`Success rate: ${metrics.successRate.toFixed(1)}%`);

      if (metrics.totalInstances > 0 && metrics.successRate < 80) {
        suggestions.push("Workflow success rate is low — investigate failed instances");
        return { domain: "workflow", label: "Workflow", status: "WARN", score: Math.round(metrics.successRate), details, suggestions };
      }

      return { domain: "workflow", label: "Workflow", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: workflow");
      return { domain: "workflow", label: "Workflow", status: "FAIL", score: 0, details: ["Could not verify workflow engine"], suggestions: ["Check workflow engine configuration"] };
    }
  }

  private async checkAutomation(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const policyCount = await prisma.policy.count({ where: { companyId: ctx.companyId } });
      const ruleCount = await prisma.approvalRule.count({ where: { companyId: ctx.companyId } });

      const total = policyCount + ruleCount;

      if (total === 0) {
        details.push("No automation rules, policies, or schedules configured");
        suggestions.push("Create business rules, policies, and approval rules to automate operations");
        return { domain: "automation", label: "Automation", status: "WARN", score: 30, details, suggestions };
      }

      details.push(`${policyCount} policies, ${ruleCount} approval rules`);

      if (policyCount === 0 && ruleCount === 0) {
        return { domain: "automation", label: "Automation", status: "WARN", score: 40, details, suggestions };
      }

      return { domain: "automation", label: "Automation", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: automation");
      return { domain: "automation", label: "Automation", status: "FAIL", score: 0, details: ["Could not verify automation"], suggestions: ["Check automation configuration"] };
    }
  }

  private async checkAi(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const providers = await aiProviderRegistry.getActiveProviders();

      if (providers.length === 0) {
        details.push("No AI providers enabled");
        suggestions.push("Configure AI provider API keys (OpenAI, Anthropic, or Gemini)");
        return { domain: "ai", label: "AI", status: "WARN", score: 20, details, suggestions };
      }

      details.push(`${providers.length} AI provider(s) enabled`);
      details.push(`Providers: ${providers.map((p) => p.label).join(", ")}`);

      return { domain: "ai", label: "AI", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: ai");
      return { domain: "ai", label: "AI", status: "WARN", score: 0, details: ["Could not verify AI provider"], suggestions: ["Check AI provider configuration"] };
    }
  }

  private async checkConnectors(ctx: TenantContext): Promise<ReadinessCheckResult> {
    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const healthSummaries = await OperationsService.getConnectorHealth(ctx).catch(() => []);

      if (healthSummaries.length === 0) {
        details.push("No connectors configured");
        suggestions.push("Configure connectors for bank feeds, ERP, or accounting integrations");
        return { domain: "connectors", label: "Connectors", status: "FAIL", score: 0, details, suggestions };
      }

      details.push(`${healthSummaries.length} total connectors`);
      const good = healthSummaries.filter((c) => c.status === "GOOD" || c.status === "healthy").length;
      const critical = healthSummaries.filter((c) => c.status === "CRITICAL" || c.status === "unhealthy").length;

      details.push(`${good} healthy`);
      if (critical > 0) details.push(`${critical} critical`);

      if (critical > 0) {
        suggestions.push("Resolve critical connector health issues");
        return { domain: "connectors", label: "Connectors", status: "FAIL", score: 20, details, suggestions };
      }

      if (good < healthSummaries.length) {
        return { domain: "connectors", label: "Connectors", status: "WARN", score: 60, details, suggestions };
      }

      return { domain: "connectors", label: "Connectors", status: "PASS", score: 100, details, suggestions };
    } catch (err) {
      logger.error(err, "Readiness check failed: connectors");
      return { domain: "connectors", label: "Connectors", status: "FAIL", score: 0, details: ["Could not evaluate connectors"], suggestions: ["Check connector health"] };
    }
  }
}
