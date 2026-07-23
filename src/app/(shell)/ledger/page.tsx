"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { JsonPanel } from "@/components/investigation/JsonPanel";
import { EnterpriseTable } from "@/components/enterprise/table";
import { FilterBuilder } from "@/components/data-table/filter-builder";
import { InspectorPanel, InspectorRow, InspectorSection } from "@/components/data-table/inspector-panel";
import type { Column, FilterDef, FilterValue, Density } from "@/components/enterprise/table";
import { ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";

type LedgerRow = {
  id: string;
  companyId: string;
  transactionId: string;
  walletId: string;
  side: string;
  amount: string;
  currency: string;
  sequence: number;
  createdAt: string;
  wallet?: { name: string | null };
  transaction?: { type: string; status: string; createdAt: string };
};

type WalletRow = { id: string; name: string; currency: string; kind: string };

type LedgerDetail = {
  transaction: {
    id: string;
    type: string;
    status: string;
    primaryAmount: string;
    currency: string;
    reference: string | null;
    idempotencyKey: string | null;
    metadata: unknown;
    createdByUserId: string | null;
    createdAt: string;
  };
  ledgerEntries: Array<{
    id: string;
    walletId: string;
    side: string;
    amount: string;
    currency: string;
    sequence: number;
    createdAt: string;
    wallet: { id: string; name: string | null; kind: string; currency: string; companyId: string };
  }>;
};

function sumSide(rows: { side: string; amount: string }[], side: "DEBIT" | "CREDIT") {
  let n = 0;
  for (const r of rows) {
    if (r.side === side) {
      const v = Number(r.amount);
      if (Number.isFinite(v)) n += v;
    }
  }
  return n;
}

const filterDefs: FilterDef[] = [
  { id: "txSearch", label: "Transaction ID", type: "text", placeholder: "Search by txn id…" },
  { id: "wallet", label: "Wallet", type: "select", options: [] },
  { id: "dateFrom", label: "Start Date", type: "date" },
  { id: "dateTo", label: "End Date", type: "date" },
];

export default function LedgerPage() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>("comfortable");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  // Inspector state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorRow, setInspectorRow] = useState<LedgerRow | null>(null);
  const [detail, setDetail] = useState<LedgerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadWallets = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/v1/wallets", { credentials: "include", signal });
    if (!res.ok) {
      setLoadError("Unable to load wallets.");
      return [];
    }
    const body = (await res.json()) as WalletRow[];
    return Array.isArray(body) ? body : [];
  }, []);

  const loadLedger = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`/api/v1/ledger?limit=200`, { credentials: "include", signal });
    if (!res.ok) {
      setLoadError("Unable to load ledger entries.");
      return [];
    }
    const body = (await res.json()) as { items: LedgerRow[] };
    return Array.isArray(body.items) ? body.items : [];
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void (async () => {
        try {
          setLoadError(null);
          const [w, l] = await Promise.all([loadWallets(ac.signal), loadLedger(ac.signal)]);
          if (ac.signal.aborted) return;
          setWallets(w);
          setRows(l);
        } catch {
          setLoadError("Unable to load ledger data.");
        } finally {
          if (!ac.signal.aborted) setLoading(false);
        }
      })();
    });
    return () => ac.abort();
  }, [loadWallets, loadLedger]);

  const dynamicFilterDefs = useMemo(() => [
    { id: "txSearch", label: "Transaction ID", type: "text" as const, placeholder: "Search by txn id…" },
    { id: "wallet", label: "Wallet", type: "select" as const, options: wallets.map((w) => ({ value: w.id, label: w.name })) },
    { id: "dateFrom", label: "Start Date", type: "date" as const },
    { id: "dateTo", label: "End Date", type: "date" as const },
  ], [wallets]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      for (const fv of filterValues) {
        if (!fv.value) continue;
        if (fv.id === "txSearch") {
          if (!r.transactionId.toLowerCase().includes(fv.value.toLowerCase())) return false;
        }
        if (fv.id === "wallet" && fv.value) {
          if (r.walletId !== fv.value) return false;
        }
        if (fv.id === "dateFrom") {
          const d = new Date(r.createdAt);
          const s = new Date(`${fv.value}T00:00:00.000Z`);
          if (d < s) return false;
        }
        if (fv.id === "dateTo") {
          const d = new Date(r.createdAt);
          const e = new Date(`${fv.value}T23:59:59.999Z`);
          if (d > e) return false;
        }
      }
      return true;
    });
  }, [rows, filterValues]);

  const handleRowClick = useCallback(async (row: LedgerRow) => {
    setInspectorRow(row);
    setInspectorOpen(true);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/ledger/${encodeURIComponent(row.transactionId)}`, {
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailError("Unable to load transaction ledger details.");
        return;
      }
      setDetail(body as LedgerDetail);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const columns: Column<LedgerRow>[] = useMemo(() => [
    {
      id: "transactionId",
      header: "Transaction",
      accessor: (r) => (
        <span className="font-mono text-xs text-[#d4af37]">
          {r.transactionId.slice(0, 8)}...
        </span>
      ),
    },
    {
      id: "wallet",
      header: "Wallet",
      accessor: (r) => (
        <span className="max-w-[200px] truncate text-sm text-zinc-400">
          {r.wallet?.name ?? r.walletId}
        </span>
      ),
    },
    {
      id: "side",
      header: "Entry",
      accessor: (r) => (
        <Badge variant={r.side === "DEBIT" ? "outline" : "secondary"} className="font-normal">
          {r.side}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cellConfig: { type: "currency", currency: "USD", negativeRed: true },
      accessor: (r) => r.amount,
      sortKey: "amount",
    },
    {
      id: "createdAt",
      header: "When",
      cellConfig: { type: "date", dateStyle: "medium", timeStyle: "short" },
      accessor: (r) => r.createdAt,
    },
  ], []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Ledger</h1>
        <p className="mt-1 text-sm text-zinc-500">Double-entry ledger inspection for the active company.</p>
      </div>

      {loadError ? (
        <Card className="border border-white/[0.06] bg-zinc-900/40">
          <CardContent className="pt-4 text-sm text-zinc-500">{loadError}</CardContent>
        </Card>
      ) : null}

      <Card className="border border-white/[0.06] bg-zinc-900/40">
        <CardContent className="p-4">
          <FilterBuilder
            defs={dynamicFilterDefs}
            values={filterValues}
            onChange={setFilterValues}
          />
        </CardContent>
      </Card>

      <EnterpriseTable
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.id}
        loading={loading}
        error={loadError ?? undefined}
        emptyTitle="No ledger entries"
        emptyDescription="Try adjusting your filters, or check back after running transactions."
        onRowClick={handleRowClick}
        density={density}
        onDensityChange={setDensity}
        hiddenColumns={hiddenColumns}
        onHiddenColumnsChange={setHiddenColumns}
        exportable
        exportFormats={["csv", "xls"]}
        exportFilename={`ledger-${new Date().toISOString().split("T")[0]}`}
        pageSize={50}
      />

      {/* Inspector Panel */}
      {inspectorRow && (
        <InspectorPanel
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          title={`Ledger Entry ${inspectorRow.transactionId.slice(0, 8)}...`}
          description={formatMoney(inspectorRow.amount, inspectorRow.currency)}
          sections={[
            {
              id: "summary",
              label: "Summary",
              icon: <BookOpen className="h-3.5 w-3.5" />,
              content: detailLoading ? (
                <p className="text-sm text-zinc-600">Loading...</p>
              ) : detailError ? (
                <p role="alert" className="text-sm text-red-400">{detailError}</p>
              ) : detail ? (
                <div className="space-y-1">
                  <InspectorSection title="Transaction">
                    <InspectorRow label="Type" value={detail.transaction.type} />
                    <InspectorRow label="Status" value={<StatusBadge status={detail.transaction.status} />} />
                    <InspectorRow label="Primary Amount" value={formatMoney(detail.transaction.primaryAmount, detail.transaction.currency)} />
                    <InspectorRow label="Reference" value={detail.transaction.reference ?? "—"} />
                    <InspectorRow label="Created" value={formatDateTime(detail.transaction.createdAt)} />
                  </InspectorSection>
                  <InspectorSection title="Ledger Lines">
                    <div className="text-xs text-zinc-600 mb-2">
                      Debits: {sumSide(detail.ledgerEntries, "DEBIT")} · Credits: {sumSide(detail.ledgerEntries, "CREDIT")}
                    </div>
                    {detail.ledgerEntries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-500">#{e.sequence}</span>
                          <span className="text-xs text-zinc-400">{e.wallet?.name ?? e.walletId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={e.side === "DEBIT" ? "outline" : "secondary"} className="text-[10px] font-normal">
                            {e.side}
                          </Badge>
                          <span className="text-xs tabular-nums text-white">{formatMoney(e.amount, e.currency)}</span>
                        </div>
                      </div>
                    ))}
                  </InspectorSection>
                  {detail.transaction.metadata ? (
                    <InspectorSection title="Metadata">
                      <JsonPanel title="Transaction metadata" value={detail.transaction.metadata} />
                    </InspectorSection>
                  ) : null}
                  <div className="pt-4">
                    <Button asChild variant="outline" size="sm" className="w-full gap-2">
                      <Link href={`/transactions/${inspectorRow.transactionId}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Full Transaction Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">Select a row to view details.</p>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
