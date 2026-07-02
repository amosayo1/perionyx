"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { Banknote, CheckCircle2, Clock, XCircle } from "lucide-react";

type SettlementRecord = {
  id: string;
  connectorName: string;
  status: string;
  externalId: string;
  attempts: number;
  createdAt: string;
};

export default function ReconciliationPage() {
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/settlements", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { settlements?: SettlementRecord[]; items?: SettlementRecord[] };
      setRecords(body.settlements ?? body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const total = records.length;
  const pending = records.filter((r) => r.status === "PENDING" || r.status === "pending").length;
  const delivered = records.filter((r) => r.status === "DELIVERED" || r.status === "delivered" || r.status === "COMPLETED").length;
  const failed = records.filter((r) => r.status === "FAILED" || r.status === "failed").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Settlement Reconciliation</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Track and reconcile settlement records.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-primary">
              <Banknote className="h-4 w-4 text-perionyx-gold" />Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-perionyx-text-primary">{loading ? "—" : total}</p>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-primary">
              <Clock className="h-4 w-4 text-perionyx-gold" />Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-perionyx-text-primary">{loading ? "—" : pending}</p>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-primary">
              <CheckCircle2 className="h-4 w-4 text-green-400" />Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-perionyx-text-primary">{loading ? "—" : delivered}</p>
          </CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-perionyx-text-primary">
              <XCircle className="h-4 w-4 text-red-400" />Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-perionyx-text-primary">{loading ? "—" : failed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent Settlements</CardTitle>
          <CardDescription>{records.length} record{records.length !== 1 ? "s" : ""}.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : records.length === 0 ? (
            <EmptyState title="No settlement records" description="Settlement data will appear once connectors process payments." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.connectorName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        r.status === "DELIVERED" || r.status === "delivered" || r.status === "COMPLETED" ? "success" :
                        r.status === "FAILED" || r.status === "failed" ? "danger" : "warning"
                      }>
                        {r.status === "DELIVERED" || r.status === "delivered" || r.status === "COMPLETED" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                        {r.status === "FAILED" || r.status === "failed" ? <XCircle className="mr-1 h-3 w-3" /> : null}
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-perionyx-text-muted">{r.externalId}</TableCell>
                    <TableCell className="text-perionyx-text-muted">{r.attempts}</TableCell>
                    <TableCell className="text-perionyx-text-muted">{formatDateTime(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
