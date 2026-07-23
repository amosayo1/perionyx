import { prisma } from "@/server/db/prisma";
import type { UserContext, PageContext, TimeContext } from "./types";

export class ContextResolver {
  async resolveUser(userId: string, companyId: string): Promise<UserContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    const membership = await prisma.companyMembership.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    const userRoles = await prisma.userRole.findMany({
      where: { userId, companyId },
      include: { role: { select: { id: true, name: true } } },
    });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    return {
      userId: user?.id ?? userId,
      userName: user?.name ?? user?.email ?? userId,
      email: user?.email ?? "",
      roles: userRoles.map((ur) => ur.role.name),
      permissions: new Set<string>(),
      companyId,
      companyName: company?.name ?? companyId,
    };
  }

  async resolvePage(page: string): Promise<PageContext> {
    const moduleMap: Record<string, string> = {
      dashboard: "analytics",
      treasury: "treasury",
      payments: "payments",
      transactions: "payments",
      approvals: "approvals",
      workflows: "workflows",
      "workflow-designer": "workflows",
      "approval-matrix": "approvals",
      "business-rules": "policies",
      scheduler: "automation",
      templates: "automation",
      monitoring: "workflows",
      analytics: "analytics",
      reports: "reports",
      risk: "risk",
      compliance: "compliance",
      audit: "audit",
      settings: "administration",
      users: "users",
      organization: "organization",
      search: "search",
    };

    const currentModule = moduleMap[page] ?? "general";
    return { currentPage: page, currentModule };
  }

  getTimeContext(): TimeContext {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return {
      now: now.toISOString(),
      todayStart: startOfDay.toISOString(),
      thisWeekStart: startOfWeek.toISOString(),
      thisMonthStart: startOfMonth.toISOString(),
      thisQuarterStart: startOfQuarter.toISOString(),
      thisYearStart: startOfYear.toISOString(),
    };
  }
}

export const contextResolver = new ContextResolver();
