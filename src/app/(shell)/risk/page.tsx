"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { AlertTriangle, ShieldAlert, Activity, Sparkles } from "lucide-react";

type RiskSummary = {
  openAlerts: number;
  criticalAlerts: number;
  incidents: number;
  lastEvaluated: string | null;
};

type Alert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  createdAt: string;
};

export default function RiskPage() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/api/v1/risk/summary", { credentials: "include", signal }),
        fetch("/api/v1/risk/alerts?limit=10", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      if (sRes.ok) {
        const s = (await sRes.json()) as RiskSummary;
        setSummary(s);
      }
      const aBody = (await aRes.json()) as { items: Alert[] };
      setAlerts(Array.isArray(aBody.items) ? aBody.items : []);
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

  const generateAlerts = useCallback(async () => {
    setGenerating(true);
    try {
      await fetch("/api/v1/risk/alerts/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setGenerating(false);
    }
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Risk Overview</h1>
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
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Risk Overview</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Monitor risk alerts and incidents.</p>
        </div>
        <Button onClick={() => void generateAlerts()} disabled={generating}>
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? "Generating..." : "Auto-generate Alerts"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <AlertTriangle className="h-4 w-4" />
              Open Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">{summary?.openAlerts ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <ShieldAlert className="h-4 w-4" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">{summary?.criticalAlerts ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-muted">
              <Activity className="h-4 w-4" />
              Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">{summary?.incidents ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent Alerts</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Latest risk alerts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No alerts" description="No risk alerts at this time." />
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
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => (
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
                        <Badge variant={a.status === "OPEN" ? "warning" : "success"}>{a.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
                        {formatDateTime(a.createdAt)}
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
