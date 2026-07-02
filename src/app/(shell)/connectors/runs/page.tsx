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
import { formatDateTime } from "@/lib/format";

type ConnectorRun = {
  id: string;
  connectorId: string;
  connectorName: string;
  status: string;
  event: string | null;
  startedAt: string;
  completedAt: string | null;
  output: string | null;
  error: string | null;
};

export default function ConnectorRunsPage() {
  const [runs, setRuns] = useState<ConnectorRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ConnectorRun | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/connectors/runs", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: ConnectorRun[] };
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
      const res = await fetch(`/api/v1/connectors/runs/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as ConnectorRun;
      setDetail(body);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Connector Runs</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">All connector runs across all connectors.</p>
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
              <EmptyState title="No runs" description="Trigger a connector run to get started." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Connector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => void openDetail(r.id)}>
                      <TableCell className="text-sm font-medium text-perionyx-text-primary">{r.connectorName}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="hidden max-w-[300px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                        {r.event ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
                        {formatDateTime(r.startedAt)}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Connector</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.connectorName}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Event</div>
                  <div className="mt-1 text-sm text-perionyx-text-muted">{detail.event ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Started</div>
                  <div className="mt-1 text-sm text-perionyx-text-muted">{formatDateTime(detail.startedAt)}</div>
                </div>
              </div>

              {detail.output && (
                <div>
                  <div className="mb-1 text-xs font-medium text-perionyx-text-subtle">Output</div>
                  <pre className="max-h-48 overflow-auto rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface p-3 text-xs text-perionyx-text-muted font-mono">
                    {detail.output}
                  </pre>
                </div>
              )}

              {detail.error && (
                <div>
                  <div className="mb-1 text-xs font-medium text-perionyx-danger">Error</div>
                  <pre className="max-h-48 overflow-auto rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface p-3 text-xs text-perionyx-danger font-mono">
                    {detail.error}
                  </pre>
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
