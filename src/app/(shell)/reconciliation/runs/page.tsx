"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";

type ReconciliationRun = {
  id: string;
  status: string;
  type: string;
  createdAt: string;
  completedAt: string | null;
  exceptionCount: number;
  totalCount: number;
  matchedCount: number;
  unmatchedSource: number;
  unmatchedExternal: number;
};

type RunDetail = ReconciliationRun & {
  exceptions: Array<{
    id: string;
    type: string;
    severity: string;
    status: string;
    description: string;
  }>;
};

export default function ReconciliationRunsPage() {
  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/reconciliation/runs", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: ReconciliationRun[] };
      setRuns(Array.isArray(body.items) ? body.items : []);
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

  const openDetail = useCallback(async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/reconciliation/runs/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as RunDetail;
      setDetail(body);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Reconciliation Runs</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">All reconciliation runs across all types.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Runs</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {runs.length} run{runs.length !== 1 ? "s" : ""} recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No runs" description="Run a reconciliation to get started." />
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
                    <TableHead className="hidden sm:table-cell">Completed</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => void openDetail(r.id)}>
                      <TableCell className="text-sm text-perionyx-text-muted">{r.type}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.totalCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.matchedCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.exceptionCount}</TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {r.completedAt ? formatDateTime(r.completedAt) : "—"}
                      </TableCell>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Run details</DialogTitle>
            <DialogDescription className="font-mono text-xs">{detail?.id ?? ""}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-sm text-perionyx-text-muted">Loading…</div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Type</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.type}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Exceptions</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.exceptionCount}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Matched</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">
                    {detail.matchedCount} / {detail.totalCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Unmatched (source)</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.unmatchedSource}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Unmatched (external)</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.unmatchedExternal}</div>
                </div>
              </div>

              {detail.exceptions && detail.exceptions.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-perionyx-text-subtle">Exceptions</div>
                  <div className="space-y-2">
                    {detail.exceptions.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface px-3 py-2"
                      >
                        <div>
                          <span className="text-sm text-perionyx-text-primary">{e.type}</span>
                          <p className="text-xs text-perionyx-text-muted">{e.description}</p>
                        </div>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
