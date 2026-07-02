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

type Report = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  summary: string;
};

type ReportDetail = Report & {
  items: Array<{
    walletId: string;
    walletName: string;
    expectedAmount: string;
    actualAmount: string;
    difference: string;
    currency: string;
    status: string;
  }>;
};

export default function ReconciliationReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/reconciliation/reports", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Report[] };
      setReports(Array.isArray(body.items) ? body.items : []);
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
      const res = await fetch(`/api/v1/reconciliation/reports/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as ReportDetail;
      setDetail(body);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Reconciliation Reports</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Review past reconciliation reports.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Reports</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {reports.length} report{reports.length !== 1 ? "s" : ""} available.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No reports" description="Run a reconciliation to generate reports." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Summary</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => void openDetail(r.id)}>
                      <TableCell className="text-sm font-medium text-perionyx-text-primary">{r.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden max-w-[300px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                        {r.summary}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detail?.title ?? "Report"}</DialogTitle>
            <DialogDescription className="font-mono text-xs">{detail?.id ?? ""}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-sm text-perionyx-text-muted">Loading…</div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Type</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.type}</div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-perionyx-text-muted">{detail.summary}</p>

              {detail.items && detail.items.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-perionyx-text-subtle">Items</div>
                  <TableScroll>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Wallet</TableHead>
                          <TableHead className="text-right">Expected</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Difference</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.items.map((i, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm text-perionyx-text-muted">
                              {i.walletName || i.walletId}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-perionyx-text-primary">
                              {formatMoney(i.expectedAmount, i.currency)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-perionyx-text-primary">
                              {formatMoney(i.actualAmount, i.currency)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-perionyx-text-primary">
                              {formatMoney(i.difference, i.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={i.status === "MATCH" ? "success" : "danger"}>{i.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableScroll>
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
