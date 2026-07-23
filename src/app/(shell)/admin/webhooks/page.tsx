"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { Cable, Globe, Plus, Trash2 } from "lucide-react";

const ALL_EVENTS = [
  "transaction.created",
  "transaction.completed",
  "transaction.failed",
  "risk.alert_created",
  "reconciliation.completed",
  "connector.activated",
  "connector.deactivated",
];

type WebhookRow = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
};

export default function WebhooksPage() {
  const [items, setItems] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["transaction.completed"]);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/webhooks", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { webhooks?: WebhookRow[]; items?: WebhookRow[] };
      setItems(body.webhooks ?? body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const toggleEvent = useCallback((event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }, []);

  const createWebhook = useCallback(async () => {
    if (!name.trim() || !url.trim()) return;
    await fetch("/api/v1/admin/webhooks", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), url: url.trim(), events: selectedEvents }),
    });
    setName("");
    setUrl("");
    setSelectedEvents(["transaction.completed"]);
    const ac = new AbortController();
    await load(ac.signal);
  }, [name, url, selectedEvents, load]);

  const deleteWebhook = useCallback(async (id: string) => {
    await fetch(`/api/v1/admin/webhooks/${id}`, { method: "DELETE", credentials: "include" });
    setItems((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Webhooks</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Manage outgoing webhook endpoints.</p>
        </div>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
            <Cable className="h-4 w-4 text-perionyx-gold" />New Webhook
          </CardTitle>
          <CardDescription>Register a new webhook endpoint.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-webhook-name">Name</Label>
              <Input id="admin-webhook-name" placeholder="My Webhook" value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="admin-webhook-url">URL</Label>
              <Input id="admin-webhook-url" placeholder="https://example.com/webhook" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Events</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_EVENTS.map((event) => (
                <label key={event} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-xs text-perionyx-text-muted hover:bg-[rgba(212,175,55,0.06)] has-[:checked]:border-perionyx-gold/40 has-[:checked]:bg-[rgba(212,175,55,0.1)] has-[:checked]:text-perionyx-gold">
                  <input type="checkbox" className="accent-perionyx-gold" checked={selectedEvents.includes(event)} onChange={() => toggleEvent(event)} />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={() => void createWebhook()} disabled={!name.trim() || !url.trim()}>
            <Plus className="mr-2 h-4 w-4" />Add Webhook
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Webhook Endpoints</CardTitle>
          <CardDescription>{items.length} webhook{items.length !== 1 ? "s" : ""} configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : items.length === 0 ? (
            <EmptyState title="No webhooks" description="Add your first webhook endpoint to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-perionyx-text-muted" title={w.url}>
                      <Globe className="mr-1 inline h-3 w-3 text-perionyx-text-subtle" />
                      {w.url}
                    </TableCell>
                    <TableCell className="text-perionyx-text-muted">{(w.events ?? []).join(", ")}</TableCell>
                    <TableCell>
                      <Badge variant={w.active ? "success" : "secondary"}>{w.active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-perionyx-text-muted">{formatDateTime(w.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => void deleteWebhook(w.id)}>
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
