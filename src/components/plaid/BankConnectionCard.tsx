"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Unlink, Building2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";

type Props = {
  accountId: string;
  accountName: string;
  plaidAccountId: string | null;
  lastSyncedAt: string | null;
  balance: string;
  currency: string;
  accountNumber: string | null;
  onSync: () => void;
  onUnlink: () => void;
};

export function BankConnectionCard({
  accountId,
  accountName,
  plaidAccountId,
  lastSyncedAt,
  balance,
  currency,
  accountNumber,
  onSync,
  onUnlink,
  connectButton,
}: Props & { connectButton?: React.ReactNode }) {
  const [syncing, setSyncing] = useState<"balance" | "transactions" | null>(null);

  const handleSync = useCallback(async (type: "balance" | "transactions") => {
    setSyncing(type);
    try {
      await fetch("/api/v1/plaid/sync", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, type }),
      });
      onSync();
    } finally {
      setSyncing(null);
    }
  }, [accountId, onSync]);

  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-perionyx-text-muted" />
            <div>
              <CardTitle className="text-base font-medium text-perionyx-text-primary">Bank Connection</CardTitle>
              <CardDescription className="text-perionyx-text-muted">
                {plaidAccountId ? `Linked account: ${plaidAccountId}` : "Not connected"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={plaidAccountId ? "success" : "outline"}>
            {plaidAccountId ? "Connected" : "Not linked"}
          </Badge>
        </div>
      </CardHeader>
      {plaidAccountId ? (
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-perionyx-text-muted">Last synced</p>
              <p className="text-sm text-perionyx-text-primary tabular-nums">
                {lastSyncedAt ? formatDateTime(lastSyncedAt) : "Never"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-perionyx-text-muted">Account number</p>
              <p className="text-sm text-perionyx-text-primary tabular-nums">{accountNumber ?? "—"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleSync("balance")}
              disabled={syncing !== null}
            >
              {syncing === "balance" ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3 w-3" />
              )}
              Sync Balance
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleSync("transactions")}
              disabled={syncing !== null}
            >
              {syncing === "transactions" ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3 w-3" />
              )}
              Sync Transactions
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300"
              onClick={onUnlink}
            >
              <Unlink className="mr-1 h-3 w-3" />
              Unlink
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className="mb-4 text-sm text-perionyx-text-muted">
            Link this account to a real bank via Plaid to sync balances and transactions automatically.
          </p>
          {connectButton}
        </CardContent>
      )}
    </Card>
  );
}
