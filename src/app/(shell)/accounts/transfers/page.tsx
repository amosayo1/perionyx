"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Plus } from "lucide-react";

type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  fromAccountName?: string;
  toAccountName?: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
};

type Account = {
  id: string;
  name: string;
  currency: string;
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [tRes, aRes] = await Promise.all([
        fetch("/api/v1/treasury/transfers", { credentials: "include", signal }),
        fetch("/api/v1/treasury/accounts", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      const tBody = (await tRes.json()) as { items: Transfer[] };
      setTransfers(Array.isArray(tBody.items) ? tBody.items : []);
      const aBody = (await aRes.json()) as { items: Account[] };
      setAccounts(Array.isArray(aBody.items) ? aBody.items : []);
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

  const createTransfer = useCallback(async () => {
    if (!fromAccountId || !toAccountId || !amount) return;
    setCreating(true);
    try {
      await fetch("/api/v1/treasury/transfers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount,
          reference: reference.trim() || null,
        }),
      });
      setCreateOpen(false);
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setReference("");
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setCreating(false);
    }
  }, [fromAccountId, toAccountId, amount, reference, load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Transfers</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Internal transfers between treasury accounts.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md">
            <DialogHeader>
              <DialogTitle>New Transfer</DialogTitle>
              <DialogDescription>Transfer funds between accounts.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-from">From account</Label>
                <Select id="transfer-from" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-to">To account</Label>
                <Select id="transfer-to" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input id="transfer-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-reference">Reference (optional)</Label>
                <Input id="transfer-reference"
                  placeholder="Invoice #1234"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => void createTransfer()} disabled={creating || !fromAccountId || !toAccountId || !amount}>
                {creating ? "Creating..." : "Create Transfer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Transfers</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {transfers.length} transfer{transfers.length !== 1 ? "s" : ""} recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No transfers" description="Create a transfer to get started." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Reference</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-perionyx-text-muted">
                        {t.fromAccountName ?? t.fromAccountId}
                      </TableCell>
                      <TableCell className="text-sm text-perionyx-text-muted">
                        {t.toAccountName ?? t.toAccountId}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-perionyx-text-primary">
                        {formatMoney(t.amount, t.currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-sm text-perionyx-text-muted sm:table-cell">
                        {t.reference ?? "—"}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                        {formatDateTime(t.createdAt)}
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
