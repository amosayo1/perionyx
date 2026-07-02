"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { CheckCircle2, Eye } from "lucide-react";
import { ExportButton } from "@/components/export/ExportButton";

type Alert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  description: string | null;
  createdAt: string;
};

export default function RiskAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/risk/alerts", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Alert[] };
      setAlerts(Array.isArray(body.items) ? body.items : []);
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

  const updateAlert = useCallback(async (id: string, action: "ACKNOWLEDGE" | "RESOLVE") => {
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/v1/risk/alerts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: action === "ACKNOWLEDGE" ? "ACKNOWLEDGED" : "RESOLVED" }
            : a,
        ),
      );
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const categories = useMemo(() => {
    const set = new Set(alerts.map((a) => a.category));
    return Array.from(set);
  }, [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (severityFilter !== "ALL" && a.severity !== severityFilter) return false;
      if (categoryFilter !== "ALL" && a.category !== categoryFilter) return false;
      return true;
    });
  }, [alerts, statusFilter, severityFilter, categoryFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Risk Alerts</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">
            {alerts.filter((a) => a.status === "OPEN").length} open alerts.
          </p>
        </div>
        <ExportButton type="risk-alerts" />
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">All severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Alerts</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {filtered.length} of {alerts.length} alerts shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No alerts" description="No alerts match your filters." />
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-medium text-perionyx-text-primary">{a.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            a.severity === "CRITICAL"
                              ? "danger"
                              : a.severity === "HIGH"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {a.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-perionyx-text-muted">{a.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            a.status === "RESOLVED"
                              ? "success"
                              : a.status === "ACKNOWLEDGED"
                                ? "secondary"
                                : "warning"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {formatDateTime(a.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "OPEN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading.has(a.id)}
                              onClick={() => void updateAlert(a.id, "ACKNOWLEDGE")}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Acknowledge
                            </Button>
                          )}
                          {(a.status === "OPEN" || a.status === "ACKNOWLEDGED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading.has(a.id)}
                              onClick={() => void updateAlert(a.id, "RESOLVE")}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Resolve
                            </Button>
                          )}
                        </div>
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
