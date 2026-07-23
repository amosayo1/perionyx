"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { Cable, Plus, Trash2 } from "lucide-react";

type ConnectorRow = {
  id: string;
  name: string;
  type: string;
  active: boolean;
  createdAt: string;
};

export default function ConnectorsPage() {
  const [items, setItems] = useState<ConnectorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("mock");

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/connectors", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { connectors?: ConnectorRow[]; items?: ConnectorRow[] };
      setItems(body.connectors ?? body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const createConnector = useCallback(async () => {
    if (!name.trim()) return;
    await fetch("/api/v1/admin/connectors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type }),
    });
    setName("");
    setType("mock");
    const ac = new AbortController();
    await load(ac.signal);
  }, [name, type, load]);

  const deleteConnector = useCallback(async (id: string) => {
    await fetch(`/api/v1/admin/connectors/${id}`, { method: "DELETE", credentials: "include" });
    setItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Connectors</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Manage payment connector integrations.</p>
        </div>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
            <Cable className="h-4 w-4 text-perionyx-gold" />New Connector
          </CardTitle>
          <CardDescription>Configure a new payment connector.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="connector-name">Name</Label>
              <Input id="connector-name" placeholder="My Connector" value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connector-type">Type</Label>
              <Select id="connector-type" value={type} onChange={(e) => setType(e.target.value)} className="w-36">
                <option value="mock">Mock</option>
                <option value="ach">ACH</option>
                <option value="wire">Wire</option>
                <option value="crypto">Crypto</option>
              </Select>
            </div>
            <Button onClick={() => void createConnector()} disabled={!name.trim()}>
              <Plus className="mr-2 h-4 w-4" />Add Connector
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Configured Connectors</CardTitle>
          <CardDescription>{items.length} connector{items.length !== 1 ? "s" : ""} configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : items.length === 0 ? (
            <EmptyState title="No connectors" description="Add your first connector to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-perionyx-text-muted">{c.type}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-perionyx-text-muted">{formatDateTime(c.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => void deleteConnector(c.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
