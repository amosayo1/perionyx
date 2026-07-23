import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Lock, Unlock, FlaskConical, type LucideIcon } from "lucide-react";

const CATEGORY_ORDER = ["onboarding", "advanced", "expert", "beta"];

const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Core Features",
  advanced: "Advanced",
  expert: "Expert",
  beta: "Beta",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  onboarding: Unlock,
  advanced: Unlock,
  expert: Lock,
  beta: FlaskConical,
};

const ROLE_PRIORITY: Record<string, number> = {
  administrator: 0,
  cfo: 1,
  controller: 2,
  treasurer: 3,
  "finance-manager": 4,
  ap: 5,
  ar: 6,
  auditor: 7,
  OWNER: 0,
  ADMIN: 0,
  TREASURER: 3,
  MEMBER: 4,
  VIEWER: 7,
};

interface FeatureWithAccess {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  requiredRole: string | null;
  dependsOn: string | null;
  isEnabled: boolean;
  isBeta: boolean;
  isAccessible: boolean;
}

export default async function FeatureDiscoveryPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const userRole = session.user.companyRole ?? "MEMBER";
  const [features, tourCount] = await Promise.all([
    prisma.featureFlag.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ category: "asc" }, { slug: "asc" }],
    }),
    prisma.productGuidance.count({
      where: { companyId: ctx.companyId, isActive: true },
    }),
  ]);

  const enabledCount = features.filter((f: any) => f.isEnabled).length;
  const betaCount = features.filter((f: any) => f.isBeta).length;
  const accessibleCount = features.filter((f: any) => {
    const rolePriority = ROLE_PRIORITY[userRole] ?? 99;
    const reqPriority = f.requiredRole ? (ROLE_PRIORITY[f.requiredRole] ?? 99) : 0;
    return rolePriority <= reqPriority;
  }).length;

  const byCategory = new Map<string, FeatureWithAccess[]>();
  for (const f of features as any[]) {
    const userPrio = ROLE_PRIORITY[userRole] ?? 99;
    const reqPrio = f.requiredRole ? (ROLE_PRIORITY[f.requiredRole] ?? 99) : 0;
    const isAccessible = userPrio <= reqPrio;

    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category)!.push({
      id: f.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      category: f.category,
      requiredRole: f.requiredRole,
      dependsOn: f.dependsOn,
      isEnabled: f.isEnabled,
      isBeta: f.isBeta,
      isAccessible,
    });
  }

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Feature Discovery"
        description="Explore available features and their status"
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Features</p>
          <p className="mt-1 text-3xl font-bold text-white">{features.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Enabled</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{enabledCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Accessible to You</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{accessibleCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Active Tours</p>
          <p className="mt-1 text-3xl font-bold text-white">{tourCount}</p>
        </div>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = byCategory.get(cat);
        if (!items || items.length === 0) return null;

        const CatIcon = CATEGORY_ICONS[cat] ?? Unlock;
        return (
          <section key={cat}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
              <CatIcon className="h-4 w-4" />
              {CATEGORY_LABELS[cat] ?? cat}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((feature) => (
                <div
                  key={feature.id}
                  className={`rounded-xl border bg-zinc-900/40 p-4 ${
                    feature.isEnabled
                      ? "border-emerald-500/10"
                      : feature.isAccessible
                        ? "border-white/[0.06]"
                        : "border-white/[0.03] opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{feature.name}</h4>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        feature.isEnabled
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : feature.isAccessible
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {feature.isEnabled ? "Enabled" : feature.isAccessible ? "Available" : "Locked"}
                    </span>
                  </div>
                  {feature.description && (
                    <p className="mt-1 text-xs text-zinc-500">{feature.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {feature.requiredRole && (
                      <span className="rounded-full border border-white/[0.06] bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {feature.requiredRole}
                      </span>
                    )}
                    {feature.isBeta && (
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
                        Beta
                      </span>
                    )}
                    {feature.dependsOn && (
                      <span className="rounded-full border border-white/[0.06] bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                        Requires: {feature.dependsOn}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </PageContainer>
  );
}
