import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { prisma } from "@/server/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms >= 86400000) return `${Math.round(ms / 86400000)}d`;
  if (ms >= 3600000) return `${Math.round(ms / 3600000)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
  return `${ms}ms`;
}

export default async function StepTypeDetailPage({
  params,
  searchParams,
}: {
  params: { type: string };
  searchParams: { focus?: string };
}) {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx) return notFound();
  
    const stepType = params.type;
    const focusFailures = searchParams.focus === "failures";
  
    const where: any = {
      stepType,
      instance: { companyId: ctx.tenant.companyId },
    };
  
    const [stepInstances, total, failed, completed] = await Promise.all([
      prisma.workflowStepInstance.findMany({
        where,
        orderBy: { startedAt: "desc" },
        take: 200,
        include: {
          instance: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              completedAt: true,
              definition: { select: { name: true } },
            },
          },
        },
      }),
      prisma.workflowStepInstance.count({ where }),
      prisma.workflowStepInstance.count({ where: { ...where, status: "FAILED" } }),
      prisma.workflowStepInstance.count({ where: { ...where, status: "COMPLETED" } }),
    ]);
  
    const displayInstances = focusFailures
      ? stepInstances.filter((s) => s.status === "FAILED")
      : stepInstances;
  
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
              <h1 className="text-xl font-bold text-white capitalize">{stepType.replace(/_/g, " ")}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Step type detail — {total} total executions</p>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/60">
                <Clock className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total</p>
                <p className="text-xl font-bold text-white">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Completed</p>
                <p className="text-xl font-bold text-emerald-400">{completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Failed</p>
                <p className="text-xl font-bold text-red-400">{failed}</p>
              </div>
            </CardContent>
          </Card>
        </div>
  
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step Instances ({displayInstances.length})</CardTitle>
                <CardDescription>
                  {focusFailures ? "Showing only failed steps" : "All steps of this type"}
                  {!focusFailures && failed > 0 && (
                    <Link href={`/automation-studio/analytics/step-types/${stepType}?focus=failures`} className="ml-2 text-red-400 underline underline-offset-2">
                      Show only failures ({failed})
                    </Link>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {displayInstances.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-zinc-500">
                {focusFailures ? "No failed steps of this type." : "No step instances found."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                      <th className="px-6 py-3 font-medium">Label</th>
                      <th className="px-6 py-3 font-medium">Workflow</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Started</th>
                      <th className="px-6 py-3 font-medium">Duration</th>
                      <th className="px-6 py-3 font-medium">Error</th>
                      <th className="px-6 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {displayInstances.map((s) => {
                      const duration = s.startedAt && s.completedAt
                        ? s.completedAt.getTime() - s.startedAt.getTime()
                        : null;
                      return (
                        <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-3 text-zinc-300 font-medium">
                            {s.label}
                          </td>
                          <td className="px-6 py-3 text-zinc-400">
                            {s.instance?.definition?.name ?? "—"}
                          </td>
                          <td className="px-6 py-3">
                            {s.status === "FAILED" ? (
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                <span className="text-red-400">Failed</span>
                              </div>
                            ) : s.status === "COMPLETED" ? (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Completed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                <span className="text-zinc-500">{s.status}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3 text-zinc-300">
                            {s.startedAt ? formatDateTime(s.startedAt.toISOString()) : "—"}
                          </td>
                          <td className="px-6 py-3 text-zinc-300">{formatDuration(duration)}</td>
                          <td className="px-6 py-3 max-w-[200px] truncate text-xs text-red-400">
                            {s.error ?? "—"}
                          </td>
                          <td className="px-6 py-3">
                            <Link href={`/automation-studio/workflows/${s.instanceId}`}>
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
      </div>
    );
  });
}
