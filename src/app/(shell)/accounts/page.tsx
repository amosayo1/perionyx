"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Select } from "@/components/ui/select";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatMoney } from "@/lib/format";
import { Plus, Building2, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export/ExportButton";

type Account = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  isActive: boolean;
  accountNumber: string | null;
  description: string | null;
  controls: { id: string; type: string; scope: string; value: string; enabled: boolean }[];
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCurrency, setCreateCurrency] = useState("USD");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/treasury/accounts", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Account[] };
      setAccounts(Array.isArray(body.items) ? body.items : []);
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

  const createAccount = useCallback(async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/v1/treasury/accounts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), currency: createCurrency, description: createDescription || undefined }),
      });
      setCreateOpen(false);
      setCreateName("");
      setCreateDescription("");
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setCreating(false);
    }
  }, [createName, createCurrency, load]);

  async function deleteAccount(id: string) {
    setDeleting((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/v1/treasury/accounts/${id}`, { method: "DELETE", credentials: "include" });
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setConfirmDelete(null);
      const ac = new AbortController();
      await load(ac.signal);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Treasury Accounts</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Manage treasury accounts and controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="accounts" />
          <Button asChild variant="outline" className="gap-2">
            <Link href="/accounts/linked">
              <Building2 className="h-4 w-4" />
              Connected Banks
            </Link>
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
            <DialogHeader>
              <DialogTitle>Create Treasury Account</DialogTitle>
              <DialogDescription>Add a new treasury account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account name</Label>
                <Input placeholder="Operating Account" value={createName} onChange={(e) => setCreateName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={createCurrency} onChange={(e) => setCreateCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Operating account for payroll" value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => void createAccount()} disabled={creating || !createName.trim()}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Accounts</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} registered.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No accounts" description="Create your first treasury account." />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell">Number</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="hidden sm:table-cell">Controls</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-perionyx-text-primary">{a.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.currency}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">
                        {formatMoney(a.balance, a.currency)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-perionyx-text-muted sm:table-cell">{a.accountNumber ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={a.isActive ? "success" : "secondary"}>{a.isActive ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {a.controls?.length > 0
                            ? a.controls.slice(0, 3).map((c) => (
                                <Badge key={c.id} variant="outline" className="text-[10px]">
                                  {c.type}
                                </Badge>
                              ))
                            : <span className="text-xs text-perionyx-text-subtle">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setConfirmDelete(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>This action cannot be undone. The account will be removed from the treasury.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (confirmDelete) deleteAccount(confirmDelete); }} disabled={deleting.has(confirmDelete ?? "")}>
              {confirmDelete && deleting.has(confirmDelete) ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
