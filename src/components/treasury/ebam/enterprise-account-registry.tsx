"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { MOCK_ACCOUNTS } from "./data";
import type { BankAccount, AccountStatus, LifecycleStage, RiskRating } from "./types";
import { EnterpriseTable } from "@/components/enterprise/table/data-table";
import type { Column } from "@/components/enterprise/table/types";

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  dormant: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  restricted: "bg-red-500/15 text-red-400 border-red-500/25",
  frozen: "bg-red-500/15 text-red-400 border-red-500/25",
  closing: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  pending_approval: "bg-blue-500/15 text-blue-400 border-blue-500/25",
};

const LIFECYCLE_STYLES: Record<LifecycleStage, string> = {
  requested: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  opening: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  pending_documentation: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  kyc_review: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  approval: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  dormant: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  restricted: "bg-red-500/15 text-red-400 border-red-500/25",
  closing: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

const RISK_STYLES: Record<RiskRating, string> = {
  low: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-red-500/15 text-red-400",
  critical: "bg-red-500/20 text-red-300 animate-pulse",
};

function buildColumns(showMasked: boolean): Column<BankAccount>[] {
  return [
    {
      id: "maskedNumber",
      header: "Account Number",
      accessor: (r) => (
        <span className="text-[13px] font-mono text-white">
          {showMasked ? r.maskedNumber : `#${r.accountNumber.replace("****", "****")}`}
        </span>
      ),
      sortKey: "maskedNumber",
      comparator: (a, b) => a.maskedNumber.localeCompare(b.maskedNumber),
    },
    {
      id: "iban",
      header: "IBAN",
      accessor: (r) => <span className="text-[12px] font-mono text-zinc-400">{r.iban}</span>,
      sortKey: "iban",
      comparator: (a, b) => a.iban.localeCompare(b.iban),
    },
    {
      id: "swift",
      header: "SWIFT",
      accessor: (r) => <span className="text-[12px] font-mono text-zinc-400">{r.swift}</span>,
      sortKey: "swift",
      comparator: (a, b) => a.swift.localeCompare(b.swift),
    },
    {
      id: "accountName",
      header: "Account Name",
      accessor: (r) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="text-[13px] text-white">{r.accountName}</span>
        </div>
      ),
      sortKey: "accountName",
      comparator: (a, b) => a.accountName.localeCompare(b.accountName),
    },
    {
      id: "legalEntity",
      header: "Legal Entity",
      accessor: (r) => <span className="text-[13px] text-zinc-300">{r.legalEntity}</span>,
      sortKey: "legalEntity",
      comparator: (a, b) => a.legalEntity.localeCompare(b.legalEntity),
    },
    {
      id: "businessUnit",
      header: "Business Unit",
      accessor: (r) => <span className="text-[12px] text-zinc-400">{r.businessUnit}</span>,
      sortKey: "businessUnit",
      comparator: (a, b) => a.businessUnit.localeCompare(b.businessUnit),
    },
    {
      id: "bank",
      header: "Bank",
      accessor: (r) => <span className="text-[13px] text-zinc-300">{r.bank}</span>,
      sortKey: "bank",
      comparator: (a, b) => a.bank.localeCompare(b.bank),
    },
    {
      id: "country",
      header: "Country",
      accessor: (r) => <span className="text-[12px] text-zinc-400">{r.country}</span>,
      sortKey: "country",
      comparator: (a, b) => a.country.localeCompare(b.country),
    },
    {
      id: "currency",
      header: "Currency",
      accessor: (r) => <span className="text-[13px] font-medium text-zinc-300">{r.currency}</span>,
      sortKey: "currency",
      comparator: (a, b) => a.currency.localeCompare(b.currency),
    },
    {
      id: "accountType",
      header: "Account Type",
      accessor: (r) => <span className="text-[12px] capitalize text-zinc-400">{r.accountType.replace(/_/g, " ")}</span>,
      sortKey: "accountType",
      comparator: (a, b) => a.accountType.localeCompare(b.accountType),
    },
    {
      id: "ownership",
      header: "Ownership",
      accessor: (r) => <span className="text-[12px] capitalize text-zinc-400">{r.ownership.replace(/_/g, " ")}</span>,
      sortKey: "ownership",
      comparator: (a, b) => a.ownership.localeCompare(b.ownership),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => (
        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[r.status])}>
          {r.status.replace(/_/g, " ")}
        </span>
      ),
      sortKey: "status",
      comparator: (a, b) => a.status.localeCompare(b.status),
      cellConfig: { type: "status" },
    },
    {
      id: "lifecycle",
      header: "Lifecycle",
      accessor: (r) => (
        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", LIFECYCLE_STYLES[r.lifecycle])}>
          {r.lifecycle.replace(/_/g, " ")}
        </span>
      ),
      sortKey: "lifecycle",
      comparator: (a, b) => a.lifecycle.localeCompare(b.lifecycle),
      cellConfig: { type: "status" },
    },
    {
      id: "risk",
      header: "Risk",
      accessor: (r) => (
        <span className={cn("inline-block rounded-md px-2 py-0.5 text-[11px] font-medium capitalize", RISK_STYLES[r.risk])}>
          {r.risk}
        </span>
      ),
      sortKey: "risk",
      comparator: (a, b) => a.risk.localeCompare(b.risk),
      cellConfig: { type: "status" },
    },
    {
      id: "balance",
      header: "Balance",
      accessor: (r) => (
        <span className={cn("text-[13px] font-mono tabular-nums", r.balance < 0 ? "text-red-400" : "text-white")}>
          {r.balance < 0
            ? `-$${Math.abs(r.balance).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
            : `$${r.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}`}
        </span>
      ),
      sortKey: "balance",
      comparator: (a, b) => a.balance - b.balance,
      cellConfig: { type: "currency", currency: "USD", align: "right", negativeRed: true },
    },
    {
      id: "relationshipManager",
      header: "RM",
      accessor: (r) => <span className="text-[12px] text-zinc-400">{r.relationshipManager}</span>,
      sortKey: "relationshipManager",
      comparator: (a, b) => a.relationshipManager.localeCompare(b.relationshipManager),
    },
  ];
}

export function EnterpriseAccountRegistry() {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [showMasked, setShowMasked] = useState(true);
  const [sortKey, setSortKey] = useState<string>("accountName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const visible = showAll ? MOCK_ACCOUNTS : MOCK_ACCOUNTS.slice(0, 20);

  const filtered = useMemo(() => {
    if (!search.trim()) return visible;
    const q = search.toLowerCase();
    return visible.filter(
      (a) =>
        a.accountName.toLowerCase().includes(q) ||
        a.maskedNumber.toLowerCase().includes(q) ||
        a.legalEntity.toLowerCase().includes(q) ||
        a.bank.toLowerCase().includes(q) ||
        a.iban.toLowerCase().includes(q),
    );
  }, [search, visible]);

  const cols = useMemo(() => buildColumns(showMasked), [showMasked]);

  return (
    <div className="space-y-4" role="region" aria-label="Enterprise Account Registry">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowMasked((m) => !m)}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
          aria-label={showMasked ? "Show full account numbers" : "Mask account numbers"}
        >
          {showMasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showMasked ? "Masked" : "Unmasked"}
        </button>
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="rounded-lg border border-gold/20 bg-gold/10 px-4 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold/20"
            aria-label={`View all ${MOCK_ACCOUNTS.length} accounts`}
          >
            View All {MOCK_ACCOUNTS.length.toLocaleString()} Accounts
          </button>
        )}
        {showAll && (
          <span className="text-[12px] text-zinc-500">
            Showing {MOCK_ACCOUNTS.length.toLocaleString()} accounts
          </span>
        )}
      </div>

      <EnterpriseTable
        data={filtered}
        columns={cols}
        keyExtractor={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by account name, number, entity, bank..."
        emptyTitle="No accounts"
        emptyDescription="No accounts match your search"
        stickyHeader
        exportable
        exportFilename="enterprise-account-registry"
      />
    </div>
  );
}
