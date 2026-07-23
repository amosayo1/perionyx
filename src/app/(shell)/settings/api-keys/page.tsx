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
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  lastChars: string;
  scopes: string[];
  active: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  usedCount: number;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/api-keys", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: ApiKeyRow[] };
      setKeys(body.items ?? []);
    } catch { /* ignore */ }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const createKey = useCallback(async () => {
    if (!createName.trim()) return;
    const res = await fetch("/api/v1/api-keys", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName.trim(), scopes: ["read:accounts", "read:transactions"] }),
    });
    const data = await res.json();
    setNewKeyValue(data.key);
    setCreateName("");
    setCreateOpen(false);
    const ac = new AbortController();
    await load(ac.signal);
  }, [createName, load]);

  const deleteKey = useCallback(async (id: string) => {
    await fetch("/api/v1/api-keys", {
      method: "DELETE", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await fetch("/api/v1/api-keys", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: !active } : k)));
  }, []);

  const copyToClipboard = useCallback(async (val: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">API Keys</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Manage API keys for programmatic access.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Key</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Give your key a name to identify it.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="apikey-name">Key name</Label>
                <Input id="apikey-name" placeholder="CI/CD Pipeline" value={createName} onChange={(e) => setCreateName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => void createKey()} disabled={!createName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {newKeyValue && (
        <Card className="border-perionyx-gold/30 bg-[rgba(212,175,55,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-perionyx-gold">Key created — copy it now</CardTitle>
            <CardDescription>This is the only time you will see this key value.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-lg bg-black/30 p-3">
              <code className="flex-1 break-all font-mono text-sm text-perionyx-text-primary">{newKeyValue}</code>
              <Button size="sm" variant="ghost" onClick={() => void copyToClipboard(newKeyValue)}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Keys</CardTitle>
          <CardDescription>{keys.length} key{keys.length !== 1 ? "s" : ""} configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : keys.length === 0 ? (
            <EmptyState title="No API keys" description="Create your first API key to get started." />
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(212,175,55,0.1)]">
                      <Key className="h-4 w-4 text-perionyx-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-perionyx-text-primary">{k.name}</span>
                        <Badge variant={k.active ? "success" : "secondary"}>{k.active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-perionyx-text-muted">
                        <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono">{k.prefix}...{k.lastChars}</code>
                        <span>{k.scopes.join(", ")}</span>
                        {k.lastUsedAt && <span>Last used {formatDateTime(k.lastUsedAt)}</span>}
                        <span>{k.usedCount} use{k.usedCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => void toggleActive(k.id, k.active)}>
                      {k.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => void deleteKey(k.id)}>
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
