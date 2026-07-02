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

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  description: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

type IncidentDetail = Incident & {
  alerts: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
  }>;
  timeline: Array<{
    action: string;
    details: string | null;
    createdAt: string;
  }>;
};

export default function RiskIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/risk/incidents", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Incident[] };
      setIncidents(Array.isArray(body.items) ? body.items : []);
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
      const res = await fetch(`/api/v1/risk/incidents/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as IncidentDetail;
      setDetail(body);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Risk Incidents</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">
          {incidents.filter((i) => i.status !== "RESOLVED").length} open incidents.
        </p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Incidents</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""} recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No incidents" description="No risk incidents recorded." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((i) => (
                    <TableRow key={i.id} className="cursor-pointer" onClick={() => void openDetail(i.id)}>
                      <TableCell className="text-sm font-medium text-perionyx-text-primary">{i.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            i.severity === "CRITICAL"
                              ? "danger"
                              : i.severity === "HIGH"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {i.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-perionyx-text-muted">{i.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={i.status} />
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {formatDateTime(i.createdAt)}
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
            <DialogTitle>{detail?.title ?? "Incident"}</DialogTitle>
            <DialogDescription className="font-mono text-xs">{detail?.id ?? ""}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-sm text-perionyx-text-muted">Loading…</div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Severity</div>
                  <Badge
                    variant={
                      detail.severity === "CRITICAL"
                        ? "danger"
                        : detail.severity === "HIGH"
                          ? "warning"
                          : "secondary"
                    }
                    className="mt-1"
                  >
                    {detail.severity}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-perionyx-text-subtle">Category</div>
                  <div className="mt-1 text-sm font-medium text-perionyx-text-primary">{detail.category}</div>
                </div>
              </div>

              {detail.description && (
                <p className="text-sm text-perionyx-text-muted">{detail.description}</p>
              )}

              {detail.alerts && detail.alerts.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-perionyx-text-subtle">Related Alerts</div>
                  <div className="space-y-1">
                    {detail.alerts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface px-3 py-2"
                      >
                        <span className="text-sm text-perionyx-text-primary">{a.title}</span>
                        <Badge variant={a.severity === "CRITICAL" ? "danger" : "warning"}>{a.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.timeline && detail.timeline.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-perionyx-text-subtle">Timeline</div>
                  <div className="space-y-2">
                    {detail.timeline.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-perionyx-gold" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-perionyx-text-primary">{t.action}</div>
                          {t.details && <div className="text-xs text-perionyx-text-muted">{t.details}</div>}
                          <div className="text-xs text-perionyx-text-subtle">{formatDateTime(t.createdAt)}</div>
                        </div>
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
