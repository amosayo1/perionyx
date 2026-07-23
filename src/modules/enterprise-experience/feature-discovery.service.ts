import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { FeatureFlagData, FeatureCategory } from "./types";

const DEFAULT_FEATURES: {
  slug: string;
  name: string;
  description: string;
  category: FeatureCategory;
  requiredRole?: string;
  dependsOn?: string;
  isBeta: boolean;
}[] = [
  { slug: "multi-currency", name: "Multi-Currency Support", description: "Handle transactions in multiple currencies with auto-conversion", category: "onboarding", requiredRole: "treasurer", isBeta: false },
  { slug: "auto-reconciliation", name: "Auto-Reconciliation", description: "Automatically match bank transactions with ledger entries", category: "onboarding", requiredRole: "controller", isBeta: false },
  { slug: "approval-workflow", name: "Approval Workflows", description: "Configure multi-step approval chains with role-based routing", category: "onboarding", requiredRole: "finance-manager", isBeta: false },
  { slug: "audit-trail", name: "Audit Trail", description: "Tamper-evident audit logging for all financial transactions", category: "onboarding", requiredRole: "auditor", isBeta: false },
  { slug: "forecasting", name: "Cash Flow Forecasting", description: "AI-powered cash flow predictions with scenario modeling", category: "advanced", requiredRole: "cfo", isBeta: false },
  { slug: "treasury-optimization", name: "Treasury Optimization", description: "Optimize cash positioning and liquidity across entities", category: "advanced", requiredRole: "treasurer", dependsOn: "multi-currency", isBeta: false },
  { slug: "compliance-monitoring", name: "Compliance Monitoring", description: "Automated policy enforcement and regulatory compliance checks", category: "advanced", requiredRole: "controller", isBeta: false },
  { slug: "ai-insights", name: "AI Insights", description: "AI-generated financial insights and anomaly detection", category: "expert", requiredRole: "cfo", isBeta: false },
  { slug: "custom-report-builder", name: "Custom Report Builder", description: "Drag-and-drop report builder with custom dimensions", category: "expert", requiredRole: "administrator", isBeta: false },
  { slug: "api-access", name: "API Access", description: "REST API for programmatic access to financial data", category: "expert", requiredRole: "administrator", isBeta: false },
  { slug: "blockchain-ledger", name: "Blockchain Ledger", description: "Immutable ledger with blockchain-based verification", category: "beta", requiredRole: "administrator", isBeta: true },
  { slug: "copilot", name: "AI Copilot", description: "Conversational AI assistant for financial operations", category: "beta", requiredRole: "cfo", isBeta: true },
];

export class FeatureDiscoveryService {
  static async initialize(ctx: TenantContext): Promise<FeatureFlagData[]> {
    const results: FeatureFlagData[] = [];
    for (const feat of DEFAULT_FEATURES) {
      const record = await prisma.featureFlag.upsert({
        where: { companyId_slug: { companyId: ctx.companyId, slug: feat.slug } },
        create: {
          companyId: ctx.companyId,
          slug: feat.slug,
          name: feat.name,
          description: feat.description,
          category: feat.category,
          requiredRole: feat.requiredRole,
          dependsOn: feat.dependsOn,
          isEnabled: feat.category === "onboarding",
          isBeta: feat.isBeta,
        },
        update: {
          name: feat.name,
          description: feat.description,
          category: feat.category,
          requiredRole: feat.requiredRole,
          dependsOn: feat.dependsOn,
          isBeta: feat.isBeta,
        },
      });
      results.push(record as unknown as FeatureFlagData);
    }
    return results;
  }

  static async getAvailable(ctx: TenantContext, userRole: string): Promise<FeatureFlagData[]> {
    const all = await prisma.featureFlag.findMany({
      where: { companyId: ctx.companyId },
    });
    const flags = all as unknown as FeatureFlagData[];

    const resolved = new Map<string, FeatureFlagData>();
    const bySlug = new Map(flags.map((f) => [f.slug, f]));

    const isAccessible = (flag: FeatureFlagData, visited: Set<string>): boolean => {
      if (visited.has(flag.slug)) return false;
      visited.add(flag.slug);
      if (flag.isEnabled) return true;
      if (flag.requiredRole) {
        const rolePriority = ["administrator", "cfo", "controller", "treasurer", "finance-manager", "ap", "ar", "auditor"];
        const userIdx = rolePriority.indexOf(userRole);
        const reqIdx = rolePriority.indexOf(flag.requiredRole);
        if (userIdx === -1 || reqIdx === -1 || userIdx > reqIdx) return false;
      }
      if (flag.dependsOn) {
        const dep = bySlug.get(flag.dependsOn);
        if (!dep || !isAccessible(dep, visited)) return false;
      }
      return true;
    };

    for (const flag of flags) {
      if (isAccessible(flag, new Set())) {
        resolved.set(flag.slug, flag);
      }
    }

    return Array.from(resolved.values());
  }

  static async enable(ctx: TenantContext, slug: string): Promise<FeatureFlagData> {
    const record = await prisma.featureFlag.update({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      data: { isEnabled: true },
    });
    return record as unknown as FeatureFlagData;
  }

  static async disable(ctx: TenantContext, slug: string): Promise<FeatureFlagData> {
    const record = await prisma.featureFlag.update({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      data: { isEnabled: false },
    });
    return record as unknown as FeatureFlagData;
  }

  static async isFeatureEnabled(ctx: TenantContext, slug: string, userRole: string): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
    });
    if (!flag) return false;
    const f = flag as unknown as FeatureFlagData;
    if (f.isEnabled) return true;
    if (f.requiredRole) {
      const rolePriority = ["administrator", "cfo", "controller", "treasurer", "finance-manager", "ap", "ar", "auditor"];
      const userIdx = rolePriority.indexOf(userRole);
      const reqIdx = rolePriority.indexOf(f.requiredRole);
      if (userIdx === -1 || reqIdx === -1 || userIdx > reqIdx) return false;
    }
    if (f.dependsOn) {
      return this.isFeatureEnabled(ctx, f.dependsOn, userRole);
    }
    return false;
  }
}
