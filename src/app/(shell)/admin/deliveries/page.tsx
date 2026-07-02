"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { AlertCircle, CheckCircle2, RotateCcw, Send } from "lucide-react";

type DeliveryRow = {
  id: string;
  webhook?: { name?: string };
  webhookName?: string;
  event: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PENDING: "warning",
  DELIVERED: "success",
  FAILED: "danger",
};

export default function DeliveriesPage() {
  const [items, setItems] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/deliveries", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { deliveries?: DeliveryRow[]; items?: DeliveryRow[] };
      setItems(body.deliveries ?? body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const retryDelivery = useCallback(async (id: string) => {
    try {
      await fetch(`/api/v1/admin/deliveries/${id}/retry`, { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    const ac = new AbortController();
    await load(ac.signal);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Webhook Deliveries</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Monitor webhook delivery status and retry failures.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
            <Send className="h-4 w-4 text-perionyx-gold" />Delivery Log
          </CardTitle>
          <CardDescription>{items.length} delivery record{items.length !== 1 ? "s" : ""}.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : items.length === 0 ? (
            <EmptyState title="No deliveries" description="Deliveries will appear once webhooks are triggered." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Last Error</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.webhook?.name ?? d.webhookName ?? "—"}</TableCell>
                    <TableCell className="text-perionyx-text-muted">{d.event}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status] ?? "default"}>
                        {d.status === "DELIVERED" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : d.status === "FAILED" ? <AlertCircle className="mr-1 h-3 w-3" /> : null}
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-perionyx-text-muted">{d.attempts}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-perionyx-text-muted">{d.lastError ?? "—"}</TableCell>
                    <TableCell className="text-perionyx-text-muted">{formatDateTime(d.createdAt)}</TableCell>
                    <TableCell>
                      {d.status === "FAILED" ? (
                        <Button size="sm" variant="outline" onClick={() => void retryDelivery(d.id)}>
                          <RotateCcw className="mr-1 h-3 w-3" />Retry
                        </Button>
                      ) : null}
                    </TableCell>
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
