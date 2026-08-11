import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ShieldCheck, Clock } from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";
import { prisma } from "@/server/db/prisma";

const severityColor: Record<string, string> = {
  INFO: "text-zinc-400",
  WARNING: "text-amber-400",
  ERROR: "text-red-400",
  CRITICAL: "text-red-400",
};

interface ActivityEntry {
  key: string;
  createdAt: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  severity: string;
  detail?: string;
}

export default async function AuditTrailPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    const companyId = ctx.tenant.companyId;
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

    const [totalEvents, todayCount, recentGlobal, recentAp, apCount] = await Promise.all([
      prisma.auditLog.count({ where: { companyId } }),
      prisma.auditLog.count({ where: { companyId, createdAt: { gte: startOfDay } } }),
      prisma.auditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          action: true,
          resourceType: true,
          resourceId: true,
          severity: true,
          actor: { select: { name: true, email: true } },
          createdAt: true,
        },
      }),
      prisma.procurementAPAuditRecord.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          action: true,
          entityType: true,
          entityId: true,
          description: true,
          userId: true,
          userRole: true,
          createdAt: true,
        },
      }),
      prisma.procurementAPAuditRecord.count({ where: { companyId } }),
    ]);

    const activity: ActivityEntry[] = [
      ...recentGlobal.map((e) => ({
        key: `g-${e.createdAt.toISOString()}-${e.action}`,
        createdAt: e.createdAt.toISOString(),
        actor: e.actor?.name ?? e.actor?.email ?? "system",
        action: e.action,
        resourceType: e.resourceType,
        resourceId: e.resourceId ?? "",
        severity: e.severity,
      })),
      ...recentAp.map((e) => ({
        key: `ap-${e.createdAt.toISOString()}-${e.action}-${e.entityId}`,
        createdAt: e.createdAt.toISOString(),
        actor: `${e.userRole} (${e.userId.slice(0, 8)})`,
        action: e.action,
        resourceType: e.entityType,
        resourceId: e.entityId,
        severity: "INFO",
        detail: e.description,
      })),
    ]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 20);

    const stats = [
      {
        label: "Total Events",
        value: new Intl.NumberFormat("en-US").format(totalEvents + apCount),
        icon: ScrollText,
        color: "text-gold",
      },
      {
        label: "AP Append-Only Records",
        value: new Intl.NumberFormat("en-US").format(apCount),
        icon: ShieldCheck,
        color: "text-green-400",
      },
      {
        label: "Today",
        value: new Intl.NumberFormat("en-US").format(todayCount),
        icon: Clock,
        color: "text-blue-400",
      },
    ];

    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Audit Trail"
          description="Chronological record of system activities for compliance and investigation — sourced live from the audit log."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-white/[0.06] bg-zinc-900/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 border-white/[0.06] bg-zinc-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Activity</CardTitle>
            <CardDescription className="text-xs text-zinc-600">
              Latest audit log entries. Entries are append-only and payload-hashed where applicable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <ScrollText className="mx-auto h-8 w-8 text-zinc-700" />
                  <p className="mt-3 text-sm text-zinc-600">No audit events recorded yet.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
                      <th className="py-2 pr-4 font-medium">Timestamp</th>
                      <th className="py-2 pr-4 font-medium">Actor</th>
                      <th className="py-2 pr-4 font-medium">Action</th>
                      <th className="py-2 pr-4 font-medium">Resource</th>
                      <th className="py-2 text-right font-medium">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((e) => (
                      <tr key={e.key} className="border-b border-white/[0.03] text-zinc-300">
                        <td className="py-2.5 pr-4 font-mono text-xs text-zinc-500">
                          {e.createdAt.replace("T", " ").slice(0, 19)}
                        </td>
                        <td className="py-2.5 pr-4 text-xs">
                          {e.actor}
                        </td>
                        <td className="py-2.5 pr-4 text-xs font-medium" title={e.detail}>
                          {e.action}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-zinc-500">
                          {e.resourceType}
                          {e.resourceId ? ` · ${e.resourceId.slice(0, 8)}` : ""}
                        </td>
                        <td className={`py-2.5 text-right text-xs font-medium ${severityColor[e.severity] ?? "text-zinc-400"}`}>
                          {e.severity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    );
  });
}
