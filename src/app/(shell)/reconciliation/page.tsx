"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { RefreshCcw, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { ExportButton } from "@/components/export/ExportButton";

type ReconciliationRun = {
  id: string;
  status: string;
  type: string;
  createdAt: string;
  completedAt: string | null;
  exceptionCount: number;
  totalCount: number;
  matchedCount: number;
};

type HealthData = {
  lastRun: string | null;
  lastRunStatus: string | null;
  openExceptions: number;
  healthScore: number;
};

type ExceptionItem = {
  id: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
  description: string;
};

export default function ReconciliationPage() {
  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [runsRes, healthRes, excRes] = await Promise.all([
        fetch("/api/v1/reconciliation/runs", { credentials: "include", signal }),
        fetch("/api/v1/reconciliation/health", { credentials: "include", signal }),
        fetch("/api/v1/reconciliation/exceptions", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      const runsBody = (await runsRes.json()) as { items: ReconciliationRun[] };
      setRuns(Array.isArray(runsBody.items) ? runsBody.items : []);
      if (healthRes.ok) {
        const h = (await healthRes.json()) as HealthData;
        setHealth(h);
      }
      const excBody = (await excRes.json()) as { items: ExceptionItem[] };
      setExceptions(Array.isArray(excBody.items) ? excBody.items : []);
    } catch {
      // handled by empty state
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const runReconciliation = useCallback(async () => {
    setRunning(true);
    try {
      await fetch("/api/v1/reconciliation/runs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "FULL" }),
      });
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setRunning(false);
    }
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Reconciliation</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Reconciliation</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Monitor and manage reconciliation runs.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="reconciliation" />
          <Button onClick={runReconciliation} disabled={running}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
            {running ? "Running..." : "Run Full Reconciliation"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <CheckCircle2 className="h-4 w-4" />
              Last Run Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">
              {health?.lastRun ? (
                <StatusBadge status={health.lastRunStatus ?? "UNKNOWN"} />
              ) : (
                <span className="text-perionyx-text-subtle">No runs yet</span>
              )}
            </div>
            {health?.lastRun && (
              <p className="mt-1 text-xs text-perionyx-text-muted">{formatDateTime(health.lastRun)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <AlertTriangle className="h-4 w-4" />
              Open Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">{health?.openExceptions ?? 0}</div>
            <p className="mt-1 text-xs text-perionyx-text-muted">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <Activity className="h-4 w-4" />
              Reconciliation Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">
              {health?.healthScore != null ? `${health.healthScore}%` : "—"}
            </div>
            <p className="mt-1 text-xs text-perionyx-text-muted">Overall health score</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent Runs</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Latest reconciliation runs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {runs.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No reconciliation runs"
                description="Run a full reconciliation to get started."
              />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Matched</TableHead>
                    <TableHead className="text-right">Exceptions</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-perionyx-text-muted">{r.type}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.totalCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.matchedCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.exceptionCount}</TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {formatDateTime(r.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Open Exceptions</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Unresolved reconciliation exceptions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {exceptions.filter((e) => e.status !== "RESOLVED").length === 0 ? (
            <div className="p-4">
              <EmptyState title="No open exceptions" description="All clear." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions
                    .filter((e) => e.status !== "RESOLVED")
                    .slice(0, 10)
                    .map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-sm text-perionyx-text-muted">{e.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.severity === "HIGH" || e.severity === "CRITICAL"
                                ? "danger"
                                : e.severity === "MEDIUM"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {e.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden max-w-[300px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                          {e.description}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
                          {formatDateTime(e.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
