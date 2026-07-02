"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Building2, RefreshCw, Loader2, Unlink, Banknote } from "lucide-react";
import Link from "next/link";

type LinkedAccount = {
  id: string;
  name: string;
  plaidAccountId: string | null;
  plaidItemId: string | null;
  lastSyncedAt: string | null;
  balance: string;
  currency: string;
  accountNumber: string | null;
};

export default function LinkedAccountsPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/plaid/accounts", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: LinkedAccount[] };
      setAccounts(Array.isArray(body.items) ? body.items : []);
    } catch {
      // handled
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const handleSyncBalance = useCallback(async (accountId: string) => {
    setSyncingId(accountId);
    try {
      await fetch("/api/v1/plaid/sync", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, type: "balance" }),
      });
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setSyncingId(null);
    }
  }, [load]);

  const handleUnlink = useCallback(async (accountId: string) => {
    await fetch("/api/v1/plaid/unlink", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const ac = new AbortController();
    await load(ac.signal);
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Linked Bank Accounts</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Bank accounts connected via Plaid.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/accounts">
            <Banknote className="h-4 w-4" />
            View All Accounts
          </Link>
        </Button>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Connected Banks</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {accounts.length} bank connection{accounts.length !== 1 ? "s" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              title="No banks linked"
              description="Connect a bank account from the Accounts page."
            />
          ) : (
            <div className="space-y-3">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.1)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(212,175,55,0.1)]">
                      <Building2 className="h-5 w-5 text-perionyx-gold" />
                    </div>
                    <div>
                      <Link
                        href={`/accounts/${a.id}`}
                        className="font-medium text-perionyx-text-primary hover:text-perionyx-gold"
                      >
                        {a.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-perionyx-text-muted">
                        <Badge variant="outline" className="text-[10px]">{a.currency}</Badge>
                        {a.accountNumber && <span>{a.accountNumber}</span>}
                        {a.lastSyncedAt && <span>Synced {formatDateTime(a.lastSyncedAt)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums text-perionyx-text-primary">
                        {formatMoney(a.balance, a.currency)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleSyncBalance(a.id)}
                      disabled={syncingId === a.id}
                    >
                      {syncingId === a.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => void handleUnlink(a.id)}
                    >
                      <Unlink className="h-3 w-3" />
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
