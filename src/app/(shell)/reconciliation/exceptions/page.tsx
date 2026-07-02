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
import { CheckCircle2 } from "lucide-react";

type Exception = {
  id: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
  description: string;
};

export default function ReconciliationExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [resolving, setResolving] = useState<Set<string>>(new Set());

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/reconciliation/exceptions", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Exception[] };
      setExceptions(Array.isArray(body.items) ? body.items : []);
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

  const resolveException = useCallback(async (id: string) => {
    setResolving((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/v1/reconciliation/exceptions/${encodeURIComponent(id)}/resolve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, status: "RESOLVED" } : e)));
    } finally {
      setResolving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const filtered = useMemo(() => {
    return exceptions.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (severityFilter !== "ALL" && e.severity !== severityFilter) return false;
      return true;
    });
  }, [exceptions, statusFilter, severityFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Reconciliation Exceptions</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">
          {exceptions.filter((e) => e.status !== "RESOLVED").length} unresolved exceptions.
        </p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
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
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Exceptions</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {filtered.length} of {exceptions.length} exceptions shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No exceptions" description="No exceptions match your filters." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
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
                      <TableCell>
                        <Badge variant={e.status === "RESOLVED" ? "success" : "warning"}>{e.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden max-w-[300px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                        {e.description}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
                        {formatDateTime(e.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {e.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resolving.has(e.id)}
                            onClick={() => void resolveException(e.id)}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {resolving.has(e.id) ? "..." : "Resolve"}
                          </Button>
                        )}
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
