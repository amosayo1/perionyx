"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { VersionHistoryPanel } from "@/components/enterprise/version-history-panel";
import { ArrowLeft, Plus } from "lucide-react";
import { ConnectBankButton } from "@/components/plaid/ConnectBankButton";
import { BankConnectionCard } from "@/components/plaid/BankConnectionCard";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TransferRow = {
  id: string;
  fromAccountName: string;
  toAccountName: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
};

type AccountData = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  description: string | null;
  accountNumber: string | null;
  isActive: boolean;
  routingInfo: Record<string, any> | null;
  controls: Array<{ id: string; type: string; scope: string; value: string; description: string | null; enabled: boolean }>;
  recentTransfers: TransferRow[];
  createdAt: string;
  updatedAt: string;
  plaidAccountId: string | null;
  plaidItemId: string | null;
  lastSyncedAt: string | null;
};

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositRef, setDepositRef] = useState("");
  const [depositing, setDepositing] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/v1/treasury/accounts/${encodeURIComponent(params.id)}`, { credentials: "include", signal });
      if (signal?.aborted) return;
      if (!res.ok) { setError("Unable to load account details."); return; }
      setAccount((await res.json()) as AccountData);
    } catch { setError("Unable to load account details."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [params.id]);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    setDepositing(true);
    try {
      const res = await fetch(`/api/v1/treasury/accounts/${params.id}/deposit`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reference: depositRef || undefined }),
      });
      if (res.ok) {
        setDepositOpen(false);
        setDepositAmount("");
        setDepositRef("");
        const ac = new AbortController();
        await load(ac.signal);
      }
    } finally { setDepositing(false); }
  }, [depositAmount, depositRef, params.id, load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-48" /><Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/accounts" className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to accounts
        </Link>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader><CardTitle>Account not found</CardTitle><CardDescription>{error ?? "Does not exist."}</CardDescription></CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/accounts" className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to accounts
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">{account.name}</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">{account.description ?? account.currency}</p>
        </div>
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Deposit</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md">
            <DialogHeader><DialogTitle>Deposit to {account.name}</DialogTitle><DialogDescription>Add funds to this account.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input id="deposit-amount" type="number" min="0" step="0.01" placeholder="10000.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-reference">Reference (optional)</Label>
                <Input id="deposit-reference" placeholder="Initial deposit" value={depositRef} onChange={(e) => setDepositRef(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleDeposit()} disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}>
                {depositing ? "Depositing..." : "Deposit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-perionyx-text-muted">Balance</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-semibold text-perionyx-text-primary tabular-nums">{formatMoney(account.balance, account.currency)}</div></CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-perionyx-text-muted">Currency</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-semibold text-perionyx-text-primary">{account.currency}</div></CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-perionyx-text-muted">Account #</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-semibold text-perionyx-text-primary">{account.accountNumber ?? "—"}</div></CardContent>
        </Card>
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-perionyx-text-muted">Status</CardTitle></CardHeader>
          <CardContent><Badge variant={account.isActive ? "success" : "secondary"}>{account.isActive ? "Active" : "Inactive"}</Badge></CardContent>
        </Card>
      </div>

      <BankConnectionCard
        accountId={account.id}
        accountName={account.name}
        plaidAccountId={account.plaidAccountId}
        lastSyncedAt={account.lastSyncedAt}
        balance={account.balance}
        currency={account.currency}
        accountNumber={account.accountNumber}
        onSync={() => {
          const ac = new AbortController();
          void load(ac.signal);
        }}
        onUnlink={async () => {
          await fetch("/api/v1/plaid/unlink", {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId: account.id }),
          });
          const ac = new AbortController();
          void load(ac.signal);
        }}
        connectButton={
          !account.plaidAccountId ? (
            <ConnectBankButton
              accountId={account.id}
              accountName={account.name}
              onLinked={() => {
                const ac = new AbortController();
                void load(ac.signal);
              }}
            />
          ) : undefined
        }
      />

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3"><CardTitle>Controls</CardTitle><CardDescription>Active controls on this account.</CardDescription></CardHeader>
        <CardContent className="p-0">
          {account.controls.length === 0 ? (
            <div className="p-4"><EmptyState title="No controls" description="No controls configured." /></div>
          ) : (
            <TableScroll><Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Scope</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{account.controls.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm font-medium text-perionyx-text-primary">{c.type}</TableCell>
                  <TableCell className="text-sm text-perionyx-text-muted">{c.scope}</TableCell>
                  <TableCell className="text-right text-sm text-perionyx-text-primary">{c.value}</TableCell>
                  <TableCell><Badge variant={c.enabled ? "success" : "secondary"}>{c.enabled ? "Enabled" : "Disabled"}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table></TableScroll>
          )}
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3"><CardTitle>Recent Transfers</CardTitle><CardDescription>Latest transfers involving this account.</CardDescription></CardHeader>
        <CardContent className="p-0">
          {account.recentTransfers.length === 0 ? (
            <div className="p-4"><EmptyState title="No transfers" /></div>
          ) : (
            <TableScroll><Table>
              <TableHeader><TableRow><TableHead>Counterparty</TableHead><TableHead>Direction</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>{account.recentTransfers.map((t) => {
                const isOutgoing = t.fromAccountName === account.name;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-perionyx-text-muted">{isOutgoing ? t.toAccountName : t.fromAccountName}</TableCell>
                    <TableCell><Badge variant={isOutgoing ? "warning" : "success"}>{isOutgoing ? "Outgoing" : "Incoming"}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums text-perionyx-text-primary">{formatMoney(t.amount, t.currency)}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-perionyx-text-muted">{formatDateTime(t.createdAt)}</TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table></TableScroll>
          )}
        </CardContent>
      </Card>

      <VersionHistoryPanel entityType="TreasuryAccount" entityId={account.id} />
    </div>
  );
}
