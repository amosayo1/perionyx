"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowRightLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/ExportButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getErrorMessage } from "@/lib/client-api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DataTable, FilterBuilder, InspectorPanel, InspectorRow, InspectorSection } from "@/components/data-table";
import type { Column, FilterDef, FilterValue, Density } from "@/components/data-table";

type Wallet = { id: string; name: string; currency: string; kind?: string };

type LedgerRow = {
  id: string;
  transactionId: string;
  walletId: string;
  side: string;
  amount: string;
  currency: string;
  sequence: number;
  createdAt: string;
  wallet?: { id: string; name: string | null };
  transaction?: { id: string; type: string; status: string; reference: string | null; createdAt: string };
};

type TxSummary = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  currency: string;
  amount: string;
  fromWalletId?: string;
  toWalletId?: string;
  fromLabel: string;
  toLabel: string;
  reference?: string | null;
};

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
}

function groupLedgerToTxSummaries(ledger: LedgerRow[], wallets: Wallet[]) {
  const walletNameById = new Map<string, string>();
  for (const w of wallets) {
    walletNameById.set(w.id, w.name);
  }
  const systemWalletName = (walletId: string) => walletNameById.get(walletId) ?? "System wallet";

  const byTxn = new Map<string, LedgerRow[]>();
  for (const row of ledger) {
    if (!byTxn.has(row.transactionId)) byTxn.set(row.transactionId, []);
    byTxn.get(row.transactionId)!.push(row);
  }

  const out: TxSummary[] = [];
  for (const [txnId, rows] of byTxn) {
    const sorted = [...rows].sort((a, b) => a.sequence - b.sequence);
    const tx = sorted[0]?.transaction;
    const type = tx?.type ?? "—";
    const status = tx?.status ?? "—";
    const createdAt = tx?.createdAt ?? sorted[0]?.createdAt ?? new Date().toISOString();
    const currency = sorted[0]?.currency ?? "—";

    const debit = sorted.find((r) => r.side === "DEBIT");
    const credit = sorted.find((r) => r.side === "CREDIT");
    const amount = credit?.amount ?? debit?.amount ?? "0";

    const fromWalletId = debit?.walletId;
    const toWalletId = credit?.walletId;
    const fromLabel = fromWalletId ? systemWalletName(fromWalletId) : "—";
    const toLabel = toWalletId ? systemWalletName(toWalletId) : "—";

    out.push({
      id: txnId,
      type,
      status,
      createdAt,
      currency,
      amount,
      fromWalletId,
      toWalletId,
      fromLabel,
      toLabel,
      reference: tx?.reference,
    });
  }

  return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const filterDefs: FilterDef[] = [
  { id: "status", label: "Status", type: "select", options: [] },
  { id: "wallet", label: "Wallet", type: "select", options: [] },
  { id: "amountFrom", label: "Min Amount", type: "number", placeholder: "0.00" },
  { id: "amountTo", label: "Max Amount", type: "number", placeholder: "0.00" },
  { id: "dateFrom", label: "Start Date", type: "date" },
  { id: "dateTo", label: "End Date", type: "date" },
];

export default function TransactionsPage() {
  const [items, setItems] = useState<TxSummary[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [density, setDensity] = useState<Density>("comfortable");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  // Inspector state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTx, setInspectorTx] = useState<TxSummary | null>(null);

  const [transferOpen, setTransferOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [creditWalletId, setCreditWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reloadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadError(null);
      const [lRes, wRes] = await Promise.all([
        fetch("/api/v1/ledger?limit=200", { credentials: "include", signal }),
        fetch("/api/v1/wallets", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      const walletsJson = wRes.ok ? ((await wRes.json()) as Wallet[]) : [];
      setWallets(
        Array.isArray(walletsJson)
          ? walletsJson.filter((x) => (x.kind ?? "STANDARD") === "STANDARD")
          : [],
      );

      if (lRes.ok) {
        const body = (await lRes.json()) as { items: LedgerRow[] };
        const ledgerItems = Array.isArray(body.items) ? body.items : [];
        setItems(groupLedgerToTxSummaries(ledgerItems, walletsJson));
      } else {
        setItems([]);
        setLoadError("Unable to load transactions.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void reloadData(ac.signal).catch(() => {});
    });
    return () => ac.abort();
  }, [reloadData]);

  const statuses = useMemo(() => ["ALL", ...new Set(items.map((t) => t.status))], [items]);

  // Dynamic filter defs with populated options
  const dynamicFilterDefs = useMemo(() => [
    { id: "status", label: "Status", type: "select" as const, options: statuses.map((s) => ({ value: s, label: s })) },
    { id: "wallet", label: "Wallet", type: "select" as const, options: wallets.map((w) => ({ value: w.id, label: w.name })) },
    { id: "amountFrom", label: "Min Amount", type: "number" as const, placeholder: "0.00" },
    { id: "amountTo", label: "Max Amount", type: "number" as const, placeholder: "0.00" },
    { id: "dateFrom", label: "Start Date", type: "date" as const },
    { id: "dateTo", label: "End Date", type: "date" as const },
  ], [statuses, wallets]);

  const filtered = useMemo(() => {
    let result = items.filter((t) => {
      for (const fv of filterValues) {
        if (!fv.value && fv.operator !== "between") continue;
        if (fv.id === "status" && fv.value !== "ALL") {
          if (t.status !== fv.value) return false;
        }
        if (fv.id === "wallet" && fv.value) {
          if (t.fromWalletId !== fv.value && t.toWalletId !== fv.value) return false;
        }
        if (fv.id === "amountFrom") {
          const n = Number(t.amount);
          const v = Number(fv.value);
          if (!Number.isNaN(n) && !Number.isNaN(v) && n < v) return false;
        }
        if (fv.id === "amountTo") {
          const n = Number(t.amount);
          const v = Number(fv.value);
          if (!Number.isNaN(n) && !Number.isNaN(v) && n > v) return false;
        }
        if (fv.id === "dateFrom") {
          const d = new Date(t.createdAt);
          const s = new Date(`${fv.value}T00:00:00.000Z`);
          if (d < s) return false;
        }
        if (fv.id === "dateTo") {
          const d = new Date(t.createdAt);
          const e = new Date(`${fv.value}T23:59:59.999Z`);
          if (d > e) return false;
        }
      }
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === "amount") cmp = Number(a.amount) - Number(b.amount);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "fromLabel") cmp = a.fromLabel.localeCompare(b.fromLabel);
      else if (sortKey === "toLabel") cmp = a.toLabel.localeCompare(b.toLabel);
      else if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [items, filterValues, sortKey, sortDir]);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }, [sortKey]);

  const handleRowClick = useCallback((row: TxSummary) => {
    setInspectorTx(row);
    setInspectorOpen(true);
  }, []);

  async function submitTransfer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!fromId || !toId) { setError("Select both wallets."); return; }
      if (fromId === toId) { setError("Source and destination must be different."); return; }
      const res = await fetch("/api/v1/transactions/transfer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWalletId: fromId,
          toWalletId: toId,
          amount,
          idempotencyKey: newIdempotencyKey(),
          reference: reference || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setError(getErrorMessage(body)); return; }
      setTransferOpen(false);
      setAmount("");
      setReference("");
      await reloadData();
    } finally { setSaving(false); }
  }

  async function submitCredit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!creditWalletId) { setError("Select a wallet."); return; }
      const res = await fetch("/api/v1/transactions/credit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: creditWalletId,
          amount,
          idempotencyKey: newIdempotencyKey(),
          reference: reference || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setError(getErrorMessage(body)); return; }
      setCreditOpen(false);
      setAmount("");
      setReference("");
      await reloadData();
    } finally { setSaving(false); }
  }

  const columns: Column<TxSummary>[] = useMemo(() => [
    {
      id: "createdAt",
      header: "When",
      sortKey: "createdAt",
      accessor: (t) => <span className="whitespace-nowrap text-zinc-400">{formatDateTime(t.createdAt)}</span>,
      className: "hidden sm:table-cell",
    },
    {
      id: "id",
      header: "Txn",
      sortKey: "id",
      accessor: (t) => (
        <Link
          href={`/transactions/${t.id}`}
          className="font-mono text-xs font-medium text-[#d4af37] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {t.id.slice(0, 8)}...
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortKey: "status",
      accessor: (t) => <StatusBadge status={t.status} />,
    },
    {
      id: "fromLabel",
      header: "From",
      sortKey: "fromLabel",
      accessor: (t) => <span className="max-w-[200px] truncate text-sm text-zinc-400">{t.fromLabel}</span>,
    },
    {
      id: "toLabel",
      header: "To",
      sortKey: "toLabel",
      accessor: (t) => <span className="max-w-[200px] truncate text-sm text-zinc-400">{t.toLabel}</span>,
    },
    {
      id: "amount",
      header: "Amount",
      sortKey: "amount",
      className: "text-right",
      headerClassName: "text-right",
      accessor: (t) => (
        <span className="tabular-nums font-medium text-white">{formatMoney(t.amount, t.currency)}</span>
      ),
    },
  ], []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Transactions</h1>
          <p className="mt-1 text-sm text-zinc-500">Ledger-backed movements for the active company.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton type="transactions" />
          <Dialog open={transferOpen} onOpenChange={(open) => { setTransferOpen(open); if (open || creditOpen) startTransition(() => setError(null)); }}>
            <DialogTrigger asChild>
              <Button variant="outline"><ArrowRightLeft className="h-4 w-4" />Transfer</Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Internal transfer</DialogTitle>
                <DialogDescription>Move funds between two standard wallets in the same currency.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => void submitTransfer(e)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>From wallet</Label>
                    <Select required value={fromId} onChange={(e) => setFromId(e.target.value)}>
                      <option value="">Select…</option>
                      {wallets.map((w) => (<option key={w.id} value={w.id}>{w.name} ({w.currency})</option>))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To wallet</Label>
                    <Select required value={toId} onChange={(e) => setToId(e.target.value)}>
                      <option value="">Select…</option>
                      {wallets.map((w) => (<option key={w.id} value={w.id}>{w.name} ({w.currency})</option>))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-amt">Amount</Label>
                  <Input id="t-amt" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-ref">Reference (optional)</Label>
                  <Input id="t-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit transfer"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={creditOpen} onOpenChange={(open) => { setCreditOpen(open); if (open || transferOpen) startTransition(() => setError(null)); }}>
            <DialogTrigger asChild>
              <Button><ArrowDownLeft className="h-4 w-4" />Credit wallet</Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Credit wallet</DialogTitle>
                <DialogDescription>Posts a wallet credit paired with the system clearing account.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => void submitCredit(e)}>
                <div className="space-y-2">
                  <Label>Wallet</Label>
                  <Select required value={creditWalletId} onChange={(e) => setCreditWalletId(e.target.value)}>
                    <option value="">Select…</option>
                    {wallets.map((w) => (<option key={w.id} value={w.id}>{w.name} ({w.currency})</option>))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-amt">Amount</Label>
                  <Input id="c-amt" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-ref">Reference (optional)</Label>
                  <Input id="c-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreditOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit credit"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loadError ? (
        <Card className="border border-white/[0.06] bg-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white">Some data could not be loaded</CardTitle>
            <CardDescription className="text-zinc-500">Try refreshing. Filters and empty states will still render.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-500">{loadError}</CardContent>
        </Card>
      ) : null}

      {/* Filter builder */}
      <Card className="border border-white/[0.06] bg-zinc-900/40">
        <CardContent className="p-4">
          <FilterBuilder
            defs={dynamicFilterDefs}
            values={filterValues}
            onChange={setFilterValues}
          />
        </CardContent>
      </Card>

      {/* Data table */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(t) => t.id}
        loading={loading}
        error={loadError ?? undefined}
        emptyTitle={filterValues.some((v) => v.value) ? "No transactions match your filters" : "No transactions yet"}
        emptyDescription={filterValues.some((v) => v.value) ? "Try widening the date range or clearing filters." : "Transfers and wallet credits will appear here once posted."}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={handleRowClick}
        density={density}
        onDensityChange={setDensity}
        hiddenColumns={hiddenColumns}
        onHiddenColumnsChange={setHiddenColumns}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onCopyId={(id) => navigator.clipboard.writeText(id)}
        exportFilename={`transactions-${new Date().toISOString().split("T")[0]}.csv`}
      />

      {/* Inspector panel */}
      {inspectorTx && (
        <InspectorPanel
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          title={`Transaction ${inspectorTx.id.slice(0, 8)}...`}
          description={formatMoney(inspectorTx.amount, inspectorTx.currency)}
          sections={[
            {
              id: "summary",
              label: "Summary",
              icon: <ExternalLink className="h-3.5 w-3.5" />,
              content: (
                <div className="space-y-1">
                  <InspectorSection title="Details">
                    <InspectorRow label="Status" value={<StatusBadge status={inspectorTx.status} />} />
                    <InspectorRow label="Amount" value={formatMoney(inspectorTx.amount, inspectorTx.currency)} />
                    <InspectorRow label="From" value={inspectorTx.fromLabel} />
                    <InspectorRow label="To" value={inspectorTx.toLabel} />
                    <InspectorRow label="Reference" value={inspectorTx.reference ?? "—"} />
                    <InspectorRow label="Created" value={formatDateTime(inspectorTx.createdAt)} />
                  </InspectorSection>
                  <div className="pt-4">
                    <Button asChild variant="outline" size="sm" className="w-full gap-2">
                      <Link href={`/transactions/${inspectorTx.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Full Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
