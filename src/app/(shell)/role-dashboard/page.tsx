import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { RoleDashboard } from "@/components/enterprise-experience/role-dashboard";
import type { RoleType, FinancialHighlight } from "@/modules/enterprise-experience/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const COMPANY_ROLE_TO_ROLE_TYPE: Record<string, RoleType> = {
  OWNER: "administrator",
  ADMIN: "administrator",
  TREASURER: "treasurer",
  MEMBER: "finance-manager",
  VIEWER: "auditor",
};

const ROLE_LABELS: Record<string, string> = {
  cfo: "CFO Dashboard",
  controller: "Controller Dashboard",
  treasurer: "Treasurer Dashboard",
  "finance-manager": "Finance Manager Dashboard",
  ap: "AP Dashboard",
  ar: "AR Dashboard",
  auditor: "Auditor Dashboard",
  administrator: "Administrator Dashboard",
  OWNER: "Owner Dashboard",
  ADMIN: "Administrator Dashboard",
  TREASURER: "Treasurer Dashboard",
  MEMBER: "Finance Dashboard",
  VIEWER: "Auditor Dashboard",
};

export default async function RoleDashboardPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx.tenant.companyId) redirect("/onboarding");
  
    const companyRole = ctx.tenant.role ?? "MEMBER";
    const roleType: RoleType = COMPANY_ROLE_TO_ROLE_TYPE[companyRole] ?? "finance-manager";
  
    const [dashboardRecord, cashAgg, pendingCount, pendingAmountTxs, recRun, riskCount, userRecord] =
      await Promise.all([
        prisma.roleDashboard.findUnique({
          where: { companyId_role: { companyId: ctx.tenant.companyId, role: roleType } },
        }),
        prisma.treasuryCashPosition.aggregate({
          where: { companyId: ctx.tenant.companyId },
          _sum: { totalBalance: true, availableBalance: true },
        }),
        prisma.transactionApproval.count({
          where: { companyId: ctx.tenant.companyId, status: "PENDING" },
        }),
        prisma.transaction.findMany({
          where: { companyId: ctx.tenant.companyId, status: "PENDING_APPROVAL" },
          select: { primaryAmount: true },
        }),
        prisma.reconciliationRun.findFirst({
          where: { companyId: ctx.tenant.companyId },
          orderBy: { createdAt: "desc" },
          select: { status: true },
        }),
        prisma.riskAlert.count({
          where: { companyId: ctx.tenant.companyId, status: "OPEN" },
        }),
        prisma.user.findUnique({
          where: { id: ctx.tenant.userId },
          select: { name: true },
        }),
      ]);
  
    const totalCash = Number(cashAgg._sum.totalBalance ?? 0);
    const availableCash = Number(cashAgg._sum.availableBalance ?? 0);
    const pendingAmount = pendingAmountTxs.reduce((s, t) => s + Number(t.primaryAmount), 0);
  
    const highlightMap: Record<string, FinancialHighlight[]> = {
      cfo: [
        { label: "Total Cash Position", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalCash), change: 0, direction: totalCash >= 0 ? "up" : "down" },
        { label: "Pending Approvals", value: String(pendingCount), change: pendingCount, direction: pendingCount > 5 ? "down" : "flat" },
        { label: "Available Cash", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(availableCash), change: totalCash > 0 ? Math.round((availableCash / totalCash) * 100 - 100) : 0, direction: "up" },
        { label: "Open Risks", value: String(riskCount), change: riskCount, direction: riskCount > 0 ? "down" : "flat" },
      ],
      treasurer: [
        { label: "Total Cash", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalCash), change: 0, direction: "up" },
        { label: "Available Balance", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(availableCash), change: 0, direction: "up" },
        { label: "Pending Transfers", value: String(pendingCount), change: pendingCount, direction: pendingCount > 0 ? "down" : "flat" },
      ],
      controller: [
        { label: "Reconciliation Status", value: recRun?.status ?? "Never Run", change: 0, direction: recRun?.status === "COMPLETED" ? "up" : "down" },
        { label: "Pending Approvals", value: String(pendingCount), change: pendingCount, direction: pendingCount > 3 ? "down" : "flat" },
        { label: "Pending Amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingAmount), change: 0, direction: "flat" },
      ],
      "finance-manager": [
        { label: "Pending Approvals", value: String(pendingCount), change: pendingCount, direction: pendingCount > 5 ? "down" : "flat" },
        { label: "Pending Amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingAmount), change: 0, direction: "flat" },
        { label: "Open Risks", value: String(riskCount), change: riskCount, direction: riskCount > 0 ? "down" : "flat" },
      ],
      auditor: [
        { label: "Open Risks", value: String(riskCount), change: riskCount, direction: riskCount > 0 ? "down" : "flat" },
        { label: "Pending Approvals", value: String(pendingCount), change: pendingCount, direction: "flat" },
      ],
      administrator: [
        { label: "Total Cash", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalCash), change: 0, direction: "up" },
        { label: "Team Members", value: String(await prisma.companyMembership.count({ where: { companyId: ctx.tenant.companyId } })), change: 0, direction: "flat" },
        { label: "Open Risks", value: String(riskCount), change: riskCount, direction: riskCount > 0 ? "down" : "flat" },
      ],
      ap: [
        { label: "Pending Approvals", value: String(pendingCount), change: pendingCount, direction: pendingCount > 5 ? "down" : "flat" },
        { label: "Pending Amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingAmount), change: 0, direction: "flat" },
      ],
      ar: [
        { label: "Pending Amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingAmount), change: 0, direction: "flat" },
      ],
    };
  
    const highlights = highlightMap[roleType] ?? highlightMap["finance-manager"];
    const config = dashboardRecord?.config as any;
    const dashboardConfig = config ?? {
      layout: { widgets: [], columns: 2 },
      kpis: [],
      reports: [],
      quickActions: [],
      approvals: false,
      notifications: true,
      recommendations: false,
    };
  
    return (
      <PageContainer>
        <RoleDashboard
          role={roleType}
          dashboard={dashboardConfig}
          userName={userRecord?.name ?? "User"}
          highlights={highlights}
        />
      </PageContainer>
    );
  });
}
