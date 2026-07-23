import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import {
  Landmark, CalendarCheck, BarChart3, SearchCheck,
  ShoppingCart, Wallet, Building2, ArrowLeft, type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  Landmark, CalendarCheck, BarChart3, SearchCheck,
  ShoppingCart, Wallet, Building2,
};

interface WorkspaceKpi {
  label: string;
  value: string;
  trend?: string;
}

type KpiFetcher = (companyId: string) => Promise<WorkspaceKpi[]>;

const WORKSPACE_KPI_FETCHERS: Record<string, KpiFetcher> = {
  treasury: async (companyId) => {
    const [cash, pending, approvals, transfers] = await Promise.all([
      prisma.treasuryCashPosition.aggregate({
        where: { companyId },
        _sum: { totalBalance: true, availableBalance: true },
      }),
      prisma.transactionApproval.count({ where: { companyId, status: "PENDING" } }),
      prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL" } }),
      prisma.internalTransfer.count({ where: { companyId, status: "PENDING" } }).catch(() => 0),
    ]);
    return [
      { label: "Total Cash", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cash._sum.totalBalance ?? 0)) },
      { label: "Available Cash", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cash._sum.availableBalance ?? 0)) },
      { label: "Pending Approvals", value: String(pending) },
      { label: "Pending Transfers", value: String(transfers) },
    ];
  },
  "month-end": async (companyId) => {
    const [recs, exceptions] = await Promise.all([
      prisma.reconciliationRun.count({ where: { companyId } }),
      prisma.reconciliationException.count({ where: { companyId, resolved: false } }).catch(() => 0),
    ]);
    return [
      { label: "Reconciliations", value: String(recs) },
      { label: "Open Exceptions", value: String(exceptions), trend: exceptions > 0 ? "needs-attention" : "clear" },
    ];
  },
  reporting: async (companyId) => {
    const [reports, definitions] = await Promise.all([
      prisma.financialReportExecution.count({ where: { companyId } }).catch(() => 0),
      prisma.financialReportDefinition.count({ where: { companyId, isActive: true } }).catch(() => 0),
    ]);
    return [
      { label: "Report Executions", value: String(reports) },
      { label: "Active Definitions", value: String(definitions) },
    ];
  },
  audit: async (companyId) => {
    const [violations, auditEntries] = await Promise.all([
      prisma.policyViolation.count({ where: { companyId, status: "OPEN" } }).catch(() => 0),
      prisma.auditLog.count({ where: { companyId } }).catch(() => 0),
    ]);
    return [
      { label: "Open Violations", value: String(violations), trend: violations > 0 ? "warning" : "clear" },
      { label: "Audit Entries", value: String(auditEntries) },
    ];
  },
  procurement: async (companyId) => {
    const pendingTxs = await prisma.transaction.count({
      where: { companyId, status: "PENDING_APPROVAL" },
    }).catch(() => 0);
    return [
      { label: "Pending Transactions", value: String(pendingTxs) },
    ];
  },
  "cash-management": async (companyId) => {
    const [cash, forecasts, alerts] = await Promise.all([
      prisma.treasuryCashPosition.aggregate({
        where: { companyId },
        _sum: { totalBalance: true, availableBalance: true },
      }),
      prisma.treasuryCashForecast.count({ where: { companyId } }).catch(() => 0),
      prisma.riskAlert.count({
        where: { companyId, status: "OPEN" },
      }).catch(() => 0),
    ]);
    return [
      { label: "Total Balance", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cash._sum.totalBalance ?? 0)) },
      { label: "Available Balance", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cash._sum.availableBalance ?? 0)) },
      { label: "Forecasts", value: String(forecasts) },
      { label: "Risk Alerts", value: String(alerts), trend: alerts > 0 ? "warning" : "clear" },
    ];
  },
  "financial-ops": async (companyId) => {
    const [pendingTxs, pendingApprovals] = await Promise.all([
      prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL" } }).catch(() => 0),
      prisma.transactionApproval.count({ where: { companyId, status: "PENDING" } }),
    ]);
    return [
      { label: "Pending Transactions", value: String(pendingTxs) },
      { label: "Pending Approvals", value: String(pendingApprovals) },
    ];
  },
};

const WORKSPACE_DESCRIPTIONS: Record<string, string> = {
  treasury: "Cash positioning, transfers, and liquidity management",
  "month-end": "Close management, reconciliations, and checklists",
  reporting: "Financial reports, board packs, and analytics",
  audit: "Audit trail, compliance checks, and evidence management",
  procurement: "Vendor management, purchase orders, and approvals",
  "cash-management": "Daily cash positioning, forecasting, and optimization",
  "financial-ops": "AP/AR, reconciliations, and financial controls",
};

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const workspace = await prisma.workspace.findUnique({
    where: { companyId_slug: { companyId: ctx.companyId, slug } },
  });

  if (!workspace) notFound();

  const fetcher = WORKSPACE_KPI_FETCHERS[slug];
  const kpis = fetcher ? await fetcher(ctx.companyId) : [];

  const config = workspace.config as Record<string, unknown> | null;
  const lastSync = config?.lastSync ? String(config.lastSync) : null;

  const Icon = workspace.icon && ICON_MAP[workspace.icon] ? ICON_MAP[workspace.icon] : Building2;

  return (
    <PageContainer>
      <div className="mb-2">
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Workspaces
        </Link>
      </div>

      <EnterprisePageHeader
        title={workspace.name}
        description={WORKSPACE_DESCRIPTIONS[slug] ?? workspace.description ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border bg-zinc-900/40 p-4 ${
              kpi.trend === "warning" || kpi.trend === "needs-attention"
                ? "border-amber-500/20"
                : "border-white/[0.06]"
            }`}
          >
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{kpi.value}</p>
            {kpi.trend && (
              <span
                className={`mt-1 inline-block text-xs font-medium ${
                  kpi.trend === "clear" ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {kpi.trend === "clear" ? "Clear" : "Needs Attention"}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                <Icon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{workspace.name}</h2>
                <p className="text-sm text-zinc-500">{WORKSPACE_DESCRIPTIONS[slug] ?? workspace.description ?? "No description"}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-500">Status</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    workspace.isActive
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {workspace.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {lastSync && (
                <div className="rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3">
                  <p className="text-xs text-zinc-500">Last Sync</p>
                  <p className="mt-1 text-sm text-zinc-300">{lastSync}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href={`/${slug}`}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <BarChart3 className="h-4 w-4 text-amber-400" />
              Open Dashboard
            </Link>
            {workspace.isActive && (
              <button className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                <Building2 className="h-4 w-4 text-amber-400" />
                Configure Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
