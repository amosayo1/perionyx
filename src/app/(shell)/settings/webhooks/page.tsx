"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { Cable, Plus, Trash2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

type WebhookRow = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  _count: { deliveries: number };
};

const EVENT_OPTIONS = [
  "RISK_ALERT_CREATED", "RISK_ALERT_RESOLVED",
  "TRANSFER_COMPLETED", "TRANSFER_FAILED",
  "RECONCILIATION_COMPLETED", "RECONCILIATION_FAILED",
  "POLICY_VIOLATION", "CONNECTOR_FAILURE",
  "PLAID_ACCOUNT_LINKED", "PLAID_ACCOUNT_UNLINKED", "PLAID_SYNC_FAILED",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [createEvents, setCreateEvents] = useState<string[]>(["TRANSFER_COMPLETED"]);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/webhooks", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: WebhookRow[] };
      setWebhooks(body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const createWebhook = useCallback(async () => {
    if (!createName.trim() || !createUrl.trim()) return;
    await fetch("/api/v1/webhooks", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName.trim(), url: createUrl.trim(), events: createEvents }),
    });
    setCreateOpen(false);
    setCreateName("");
    setCreateUrl("");
    const ac = new AbortController();
    await load(ac.signal);
  }, [createName, createUrl, createEvents, load]);

  const deleteWebhook = useCallback(async (id: string) => {
    await fetch("/api/v1/webhooks", {
      method: "DELETE", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await fetch("/api/v1/webhooks", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, active: !active } : w)));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Webhooks</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Send events to external URLs.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Webhook</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Configure an endpoint to receive events.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Slack notifications" value={createName} onChange={(e) => setCreateName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input placeholder="https://hooks.slack.com/..." value={createUrl} onChange={(e) => setCreateUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <Select
                  multiple
                  value={createEvents}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                    setCreateEvents(opts);
                  }}
                  className="h-32"
                >
                  {EVENT_OPTIONS.map((ev) => (
                    <option key={ev} value={ev}>{ev.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => void createWebhook()} disabled={!createName.trim() || !createUrl.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Endpoints</CardTitle>
          <CardDescription>{webhooks.length} endpoint{webhooks.length !== 1 ? "s" : ""} configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : webhooks.length === 0 ? (
            <EmptyState title="No webhooks" description="Add a webhook to receive events." />
          ) : (
            <div className="space-y-3">
              {webhooks.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(212,175,55,0.1)]">
                      <Cable className="h-4 w-4 text-perionyx-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-perionyx-text-primary">{w.name}</span>
                        <Badge variant={w.active ? "success" : "secondary"}>{w.active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-perionyx-text-muted">
                        <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono max-w-[300px] truncate">{w.url}</code>
                        <span>{w.events.length} event{w.events.length !== 1 ? "s" : ""}</span>
                        <span>{w._count.deliveries} delivery{w._count.deliveries !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {w.events.map((ev) => (
                          <Badge key={ev} variant="outline" className="text-[9px]">{ev}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => void toggleActive(w.id, w.active)}>
                      {w.active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => void deleteWebhook(w.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
