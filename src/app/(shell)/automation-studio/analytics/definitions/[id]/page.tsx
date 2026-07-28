import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { prisma } from "@/server/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "text-zinc-400", icon: Clock },
  VALIDATED: { label: "Validated", color: "text-blue-400", icon: Activity },
  RUNNING: { label: "Running", color: "text-emerald-400", icon: Activity },
  WAITING: { label: "Waiting", color: "text-amber-400", icon: Clock },
  PAUSED: { label: "Paused", color: "text-amber-400", icon: XCircle },
  COMPLETED: { label: "Completed", color: "text-[#d4af37]", icon: CheckCircle2 },
  FAILED: { label: "Failed", color: "text-red-400", icon: AlertTriangle },
  CANCELLED: { label: "Cancelled", color: "text-zinc-500", icon: XCircle },
};

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms >= 86400000) return `${Math.round(ms / 86400000)}d`;
  if (ms >= 3600000) return `${Math.round(ms / 3600000)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
  return `${ms}ms`;
}

export default async function DefinitionDetailPage({ params }: { params: { id: string } }) {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx) return notFound();
  
    const [definition, instances] = await Promise.all([
      prisma.workflowDefinition.findFirst({
        where: { id: params.id, companyId: ctx.tenant.companyId },
      }),
      prisma.workflowInstance.findMany({
        where: { definitionId: params.id, companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);
  
    if (!definition) return notFound();
  
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/automation-studio/analytics">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Go back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{definition.name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {definition.category} &middot; v{definition.version} &middot; Created {formatDateTime(definition.createdAt.toISOString())}
              </p>
            </div>
          </div>
          <Badge variant={definition.status === "ACTIVE" ? "success" : "secondary"}>
            {definition.status}
          </Badge>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>All Instances ({instances.length})</CardTitle>
            <CardDescription>
              {instances.filter((i) => i.status === "COMPLETED").length} completed &middot;{" "}
              {instances.filter((i) => i.status === "FAILED").length} failed &middot;{" "}
              {instances.filter((i) => i.status === "RUNNING").length} running
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {instances.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-zinc-500">No instances for this definition.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                      <th className="px-6 py-3 font-medium">ID</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Started</th>
                      <th className="px-6 py-3 font-medium">Completed</th>
                      <th className="px-6 py-3 font-medium">Duration</th>
                      <th className="px-6 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {instances.map((inst) => {
                      const cfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.PENDING;
                      const duration = inst.startedAt && inst.completedAt
                        ? inst.completedAt.getTime() - inst.startedAt.getTime()
                        : null;
                      return (
                        <tr key={inst.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-3 font-mono text-xs text-zinc-400">
                            {inst.id.slice(0, 12)}...
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                              <span className={cfg.color}>{cfg.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-zinc-300">
                            {inst.startedAt ? formatDateTime(inst.startedAt.toISOString()) : "—"}
                          </td>
                          <td className="px-6 py-3 text-zinc-300">
                            {inst.completedAt ? formatDateTime(inst.completedAt.toISOString()) : "—"}
                          </td>
                          <td className="px-6 py-3 text-zinc-300">{formatDuration(duration)}</td>
                          <td className="px-6 py-3">
                            <Link href={`/automation-studio/workflows/${inst.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
  
        {definition.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">{definition.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  });
}
