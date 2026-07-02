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
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Connector = {
  id: string;
  name: string;
  type: string;
  status: string;
  lastRunAt: string | null;
  runCount: number;
  active: boolean;
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/connectors/list", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Connector[] };
      setConnectors(Array.isArray(body.items) ? body.items : []);
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Connectors</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Manage external system connectors.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Connectors</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {connectors.length} connector{connectors.length !== 1 ? "s" : ""} configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : connectors.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No connectors" description="No connectors configured yet." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Run</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectors.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-perionyx-text-primary">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.active ? "success" : "secondary"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{c.runCount}</TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {c.lastRunAt ? formatDateTime(c.lastRunAt) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/connectors/${c.id}`}>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </Link>
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
