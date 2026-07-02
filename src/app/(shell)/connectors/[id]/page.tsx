"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

type ConnectorDetail = {
  id: string;
  name: string;
  type: string;
  active: boolean;
  config: Record<string, unknown>;
  lastRunAt: string | null;
  runCount: number;
};

type ConnectorRun = {
  id: string;
  status: string;
  event: string | null;
  startedAt: string;
  completedAt: string | null;
};

export default function ConnectorDetailPage() {
  const params = useParams<{ id: string }>();
  const [connector, setConnector] = useState<ConnectorDetail | null>(null);
  const [runs, setRuns] = useState<ConnectorRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const [cRes, rRes] = await Promise.all([
          fetch(`/api/v1/connectors/${encodeURIComponent(params.id)}`, { credentials: "include", signal }),
          fetch(`/api/v1/connectors/runs?connectorId=${encodeURIComponent(params.id)}`, {
            credentials: "include",
            signal,
          }),
        ]);
        if (signal?.aborted) return;
        if (!cRes.ok) {
          setError("Unable to load connector details.");
          return;
        }
        const cBody = (await cRes.json()) as ConnectorDetail;
        setConnector(cBody);
        const rBody = (await rRes.json()) as { items: ConnectorRun[] };
        setRuns(Array.isArray(rBody.items) ? rBody.items : []);
      } catch {
        setError("Unable to load connector data.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [params.id],
  );

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const triggerRun = useCallback(async () => {
    setTriggering(true);
    try {
      await fetch("/api/v1/connectors/runs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: params.id }),
      });
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setTriggering(false);
    }
  }, [params.id, load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !connector) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/connectors"
          className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to connectors
        </Link>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-medium text-perionyx-text-primary">Connector not found</CardTitle>
            <CardDescription className="text-perionyx-text-muted">
              {error ?? "The connector does not exist."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/connectors"
        className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to connectors
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">{connector.name}</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">{connector.type}</p>
        </div>
        <Button onClick={() => void triggerRun()} disabled={triggering}>
          <Play className="mr-2 h-4 w-4" />
          {triggering ? "Triggering..." : "Trigger Run"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-perionyx-text-muted">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={connector.active ? "success" : "secondary"}>
              {connector.active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-perionyx-text-muted">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-perionyx-text-primary">{connector.runCount}</div>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-perionyx-text-muted">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-perionyx-text-primary">
              {connector.lastRunAt ? formatDateTime(connector.lastRunAt) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Configuration</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Connector configuration settings.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(connector.config).length === 0 ? (
            <p className="text-sm text-perionyx-text-subtle">No configuration.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(connector.config).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface px-3 py-2">
                  <div className="text-xs text-perionyx-text-subtle">{key}</div>
                  <div className="mt-0.5 text-sm text-perionyx-text-primary font-mono">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent Runs</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Recent connector runs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {runs.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No runs" description="Trigger a run to get started." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="hidden sm:table-cell">Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 20).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="hidden max-w-[300px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                        {r.event ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">
                        {formatDateTime(r.startedAt)}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {r.completedAt ? formatDateTime(r.completedAt) : "—"}
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
