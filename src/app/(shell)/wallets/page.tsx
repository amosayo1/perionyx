"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/client-api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { WalletKindBadge } from "@/components/badges/WalletKindBadge";

type Wallet = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  kind: string;
  createdAt: string;
};

const currencies = ["USD", "EUR", "GBP"] as const;

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reloadWallets = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/wallets", { credentials: "include", signal });
      if (signal?.aborted) {
        return;
      }
      if (!res.ok) {
        setWallets([]);
        return;
      }
      const data = (await res.json()) as Wallet[];
      setWallets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void reloadWallets(ac.signal).catch(() => {
        /* aborted */
      });
    });
    return () => ac.abort();
  }, [reloadWallets]);

  async function createWallet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldError("Wallet name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/v1/wallets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, currency }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(body));
        return;
      }
      setOpen(false);
      setName("");
      setCurrency("USD");
      await reloadWallets();
    } finally {
      setSaving(false);
    }
  }

  async function deleteWallet(id: string) {
    setDeleting((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/v1/wallets/${id}`, { method: "DELETE", credentials: "include" });
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setConfirmDelete(null);
      await reloadWallets();
    }
  }

  const standardWallets = wallets.filter((w) => w.kind === "STANDARD");
  const systemWallets = wallets.filter((w) => w.kind !== "STANDARD");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-perionyx-text-muted">Wallet operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-perionyx-text-primary">Wallets</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-perionyx-text-muted">Balances and accounts for the active company.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.08)] px-4 py-3 text-sm text-perionyx-gold shadow-soft">
            <Plus className="h-4 w-4" /> Premium treasury controls
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setError(null);
            setFieldError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            New wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create wallet</DialogTitle>
            <DialogDescription>Add a named wallet in the company&apos;s default currency.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void createWallet(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wname">Name</Label>
              <Input id="wname" required value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wcur">Currency</Label>
              <Select
                id="wcur"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            {fieldError ? <p className="text-sm text-perionyx-danger">{fieldError}</p> : null}
            {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {wallets.length === 0 ? (
            <EmptyState
              title="No wallets yet"
              description="Create your first wallet to begin moving balances."
              action={
                <Button onClick={() => setOpen(true)} className="mt-2">
                  <Plus className="h-4 w-4" />
                  New wallet
                </Button>
              }
            />
          ) : null}

          {standardWallets.length ? (
            <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-perionyx-text-primary">Standard wallets</CardTitle>
                <CardDescription className="text-perionyx-text-muted">Operational balances used for day-to-day treasury movement.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TableScroll>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standardWallets.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium text-perionyx-text-primary">
                            <Link href={`/wallets/${w.id}`} className="hover:text-perionyx-gold hover:underline">
                              {w.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs font-normal text-perionyx-text-muted border-perionyx-border bg-perionyx-bg-primary">
                              {w.currency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <WalletKindBadge kind={w.kind} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-perionyx-text-primary">
                            {formatMoney(w.balance, w.currency)}
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                            {formatDateTime(w.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setConfirmDelete(w.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableScroll>
              </CardContent>
            </Card>
          ) : null}

          {systemWallets.length ? (
            <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-perionyx-text-primary">System wallets</CardTitle>
                <CardDescription className="text-perionyx-text-muted">Contra accounts used to balance ledger flows.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TableScroll>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemWallets.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium text-perionyx-text-primary">
                            <Link href={`/wallets/${w.id}`} className="hover:text-perionyx-gold hover:underline">
                              {w.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs font-normal text-perionyx-text-muted border-perionyx-border bg-perionyx-bg-primary">
                              {w.currency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <WalletKindBadge kind={w.kind} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-perionyx-text-primary">
                            {formatMoney(w.balance, w.currency)}
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-sm text-perionyx-text-muted sm:table-cell">
                            {formatDateTime(w.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setConfirmDelete(w.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableScroll>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete wallet</DialogTitle>
            <DialogDescription>This action cannot be undone. The wallet will be removed from the ledger.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (confirmDelete) deleteWallet(confirmDelete); }} disabled={deleting.has(confirmDelete ?? "")}>
              {confirmDelete && deleting.has(confirmDelete) ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
