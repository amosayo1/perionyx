import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Activity, HeartPulse, Clock, Settings, FileText,
  RefreshCw, ArrowUpDown, Plug,
} from "lucide-react";
import { prisma } from "@/server/db/prisma";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/enterprise/page-container";
import { StatusChip } from "@/components/enterprise/status-chip";
import { formatDateTime } from "@/lib/format";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "sync-history", label: "Sync History", icon: ArrowUpDown },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "audit", label: "Audit", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return "—";
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(1)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
  return `${ms}ms`;
}

export default async function IntegrationDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [instance, syncHistory, healthRecords, auditRecords] = await Promise.all([
      prisma.integrationInstance.findFirst({
        where: { id: params.id, companyId: ctx.tenant.companyId },
        include: { connectorDef: true },
      }),
      prisma.syncHistory.findMany({
        where: { instanceId: params.id, companyId: ctx.tenant.companyId },
        orderBy: { startedAt: "desc" },
        take: 50,
      }),
      prisma.integrationHealth.findMany({
        where: { instanceId: params.id, companyId: ctx.tenant.companyId },
        orderBy: { checkedAt: "desc" },
        take: 20,
      }),
      prisma.integrationAudit.findMany({
        where: { instanceId: params.id, companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
  
    if (!instance) return notFound();
  
    const activeTab = searchParams.tab ?? "overview";
  
    const healthMap: Record<string, "success" | "error" | "warning" | "neutral"> = {
      healthy: "success",
      degraded: "warning",
      unhealthy: "error",
      unknown: "neutral",
    };
  
    return (
      <PageContainer>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/integration-platform/connectors"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{instance.name}</h1>
                <StatusChip status={healthMap[instance.healthStatus] ?? "neutral"} label={instance.healthStatus} />
                <div className="flex h-7 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-400">
                  <Plug className="h-3 w-3" />
                  {instance.status}
                </div>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">
                {instance.connectorDef?.name ?? instance.connectorDefId}
                {instance.connectorDef?.version && ` v${instance.connectorDef.version}`}
              </p>
            </div>
          </div>
          <Link href={`/integration-platform/settings?id=${instance.id}`}>
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </Link>
        </div>
  
        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={`/integration-platform/${instance.id}?tab=${tab.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
  
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Total Syncs" value={syncHistory.length} />
              <StatCard label="Successful" value={syncHistory.filter((s) => s.status === "completed").length} color="text-emerald-400" />
              <StatCard label="Failed" value={syncHistory.filter((s) => s.status === "failed").length} color="text-red-400" />
              <StatCard label="Health Checks" value={healthRecords.length} />
            </div>
  
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Recent Syncs</h3>
                {syncHistory.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-zinc-500">No sync history</p>
                ) : (
                  <div className="space-y-2">
                    {syncHistory.slice(0, 5).map((sync) => (
                      <div key={sync.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatusChip status={sync.status === "completed" ? "success" : sync.status === "failed" ? "error" : "neutral"} dotOnly />
                          <span className="text-xs text-zinc-300 capitalize">{sync.syncType}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="text-emerald-400">{sync.inserted}</span>
                          <span className="text-blue-400">{sync.updated}</span>
                          <span className="text-red-400">{sync.failed}</span>
                          <span>{formatDuration(sync.durationMs)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Health History</h3>
                {healthRecords.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-zinc-500">No health records</p>
                ) : (
                  <div className="space-y-2">
                    {healthRecords.slice(0, 5).map((h) => {
                      const hMap: Record<string, "success" | "error" | "warning" | "neutral"> = {
                        healthy: "success", degraded: "warning", unhealthy: "error", unknown: "neutral",
                      };
                      return (
                        <div key={h.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <StatusChip status={hMap[h.status] ?? "neutral"} dotOnly />
                            <span className="text-xs capitalize text-zinc-300">{h.status}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span>{formatDuration(h.responseTimeMs)}</span>
                            <span>{formatDateTime(h.checkedAt.toISOString())}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
  
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Recent Audit Events</h3>
              {auditRecords.slice(0, 10).length === 0 ? (
                <p className="text-sm text-zinc-500">No audit records</p>
              ) : (
                <div className="space-y-2">
                  {auditRecords.slice(0, 10).map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 capitalize">{audit.action}</span>
                        <span className="text-xs text-zinc-300">{audit.entityType}</span>
                      </div>
                      <span className="text-xs text-zinc-500">{formatDateTime(audit.createdAt.toISOString())}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
  
        {activeTab === "sync-history" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Sync History ({syncHistory.length})</h3>
            {syncHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No sync history for this instance</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Started</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Inserted</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-4 py-3 font-medium">Failed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {syncHistory.map((sync) => (
                      <tr key={sync.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-xs capitalize text-zinc-300">{sync.syncType}</td>
                        <td className="px-4 py-3">
                          <StatusChip
                            status={sync.status === "completed" ? "success" : sync.status === "failed" ? "error" : sync.status === "running" ? "warning" : "neutral"}
                            label={sync.status}
                          />
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{formatDateTime(sync.startedAt.toISOString())}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{formatDuration(sync.durationMs)}</td>
                        <td className="px-4 py-3 text-xs text-emerald-400">{sync.inserted}</td>
                        <td className="px-4 py-3 text-xs text-blue-400">{sync.updated}</td>
                        <td className="px-4 py-3 text-xs text-red-400">{sync.failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
  
        {activeTab === "health" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Health Records ({healthRecords.length})</h3>
            {healthRecords.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No health records for this instance</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Checked At</th>
                      <th className="px-4 py-3 font-medium">Response Time</th>
                      <th className="px-4 py-3 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {healthRecords.map((h) => {
                      const hMap: Record<string, "success" | "error" | "warning" | "neutral"> = {
                        healthy: "success", degraded: "warning", unhealthy: "error", unknown: "neutral",
                      };
                      return (
                        <tr key={h.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <StatusChip status={hMap[h.status] ?? "neutral"} label={h.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400">{formatDateTime(h.checkedAt.toISOString())}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400">{formatDuration(h.responseTimeMs)}</td>
                          <td className="px-4 py-3 text-xs text-red-400 max-w-[200px] truncate">{h.error ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
  
        {activeTab === "audit" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Audit Log ({auditRecords.length})</h3>
            {auditRecords.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No audit records for this instance</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Entity</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {auditRecords.map((audit) => (
                      <tr key={audit.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 capitalize">{audit.action}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-300">{audit.entityType}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{audit.userId?.slice(0, 12) ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{formatDateTime(audit.createdAt.toISOString())}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{audit.ipAddress ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
  
        {activeTab === "settings" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-12">
            <Settings className="mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-400">Full settings available on the settings page</p>
            <Link href={`/integration-platform/settings?id=${instance.id}`}>
              <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20 transition-colors hover:bg-amber-500/20">
                <Settings className="h-4 w-4" />
                Open Settings
              </button>
            </Link>
          </div>
        )}
      </PageContainer>
    );
  });
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold text-white", color)}>{value}</p>
    </div>
  );
}
