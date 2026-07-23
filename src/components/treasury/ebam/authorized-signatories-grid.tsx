"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { User, AlertTriangle, FileText } from "lucide-react";
import { MOCK_SIGNATORIES } from "./data";
import type { Signatory, SigningAuthority } from "./types";
import { EnterpriseTable } from "@/components/enterprise/table/data-table";
import type { Column } from "@/components/enterprise/table/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  expired: "bg-red-500/15 text-red-400 border-red-500/25",
  revoked: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

const AUTH_STYLES: Record<SigningAuthority, string> = {
  sole: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  joint: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  any_two: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  any_three: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  manager: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  director: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  cfo: "bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/25",
  ceo: "bg-red-500/15 text-red-400 border-red-500/25",
};

const DAY_MS = 86400000;

const isExpiringSoon = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff <= 30 * DAY_MS;
};

const authLabel = (a: SigningAuthority) =>
  a === "any_two" ? "Any 2" : a === "any_three" ? "Any 3" : a.charAt(0).toUpperCase() + a.slice(1);

const columns: Column<Signatory>[] = [
  {
    id: "person",
    header: "Person",
    accessor: (r) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
          <User className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <span className="text-[13px] text-white">{r.person}</span>
      </div>
    ),
    sortKey: "person",
    comparator: (a, b) => a.person.localeCompare(b.person),
  },
  {
    id: "role",
    header: "Role",
    accessor: (r) => <span className="text-[12px] text-zinc-400">{r.role}</span>,
    sortKey: "role",
    comparator: (a, b) => a.role.localeCompare(b.role),
  },
  {
    id: "entity",
    header: "Entity",
    accessor: (r) => <span className="text-[13px] text-zinc-300">{r.entity}</span>,
    sortKey: "entity",
    comparator: (a, b) => a.entity.localeCompare(b.entity),
  },
  {
    id: "bank",
    header: "Bank",
    accessor: (r) => <span className="text-[12px] text-zinc-400">{r.bank}</span>,
    sortKey: "bank",
    comparator: (a, b) => a.bank.localeCompare(b.bank),
  },
  {
    id: "accountsCount",
    header: "Accounts",
    accessor: (r) => <span className="text-[13px] font-mono text-zinc-300">{r.accounts.length}</span>,
    sortKey: "accountsCount",
    comparator: (a, b) => a.accounts.length - b.accounts.length,
  },
  {
    id: "signingAuthority",
    header: "Signing Authority",
    accessor: (r) => (
      <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium", AUTH_STYLES[r.signingAuthority])}>
        {authLabel(r.signingAuthority)}
      </span>
    ),
    sortKey: "signingAuthority",
    comparator: (a, b) => a.signingAuthority.localeCompare(b.signingAuthority),
  },
  {
    id: "approvalLimit",
    header: "Approval Limit",
    accessor: (r) => (
      <span className="text-[13px] font-mono tabular-nums text-white">
        ${r.approvalLimit.toLocaleString("en-US", { minimumFractionDigits: 0 })}
      </span>
    ),
    sortKey: "approvalLimit",
    comparator: (a, b) => a.approvalLimit - b.approvalLimit,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => (
      <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[r.status])}>
        {r.status}
      </span>
    ),
    sortKey: "status",
    comparator: (a, b) => a.status.localeCompare(b.status),
    cellConfig: { type: "status" },
  },
  {
    id: "expirationDate",
    header: "Expiration",
    accessor: (r) => (
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-mono text-zinc-400">{r.expirationDate}</span>
        {isExpiringSoon(r.expirationDate) && (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-label="Expiring within 30 days" />
        )}
      </div>
    ),
    sortKey: "expirationDate",
    comparator: (a, b) => a.expirationDate.localeCompare(b.expirationDate),
  },
  {
    id: "reviewDate",
    header: "Review Date",
    accessor: (r) => <span className="text-[12px] font-mono text-zinc-500">{r.reviewDate}</span>,
    sortKey: "reviewDate",
    comparator: (a, b) => a.reviewDate.localeCompare(b.reviewDate),
  },
  {
    id: "documents",
    header: "Documents",
    accessor: (r) => (
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3 text-zinc-500" />
        <span className="text-[12px] text-zinc-500">{r.documents.length} docs</span>
      </div>
    ),
    sortKey: "documents",
    comparator: (a, b) => a.documents.length - b.documents.length,
  },
];

export function AuthorizedSignatoriesGrid() {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("person");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const visible = showAll ? MOCK_SIGNATORIES : MOCK_SIGNATORIES.slice(0, 20);

  const filtered = useMemo(() => {
    if (!search.trim()) return visible;
    const q = search.toLowerCase();
    return visible.filter(
      (s) =>
        s.person.toLowerCase().includes(q) ||
        s.entity.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.bank.toLowerCase().includes(q),
    );
  }, [search, visible]);

  return (
    <div className="space-y-4" role="region" aria-label="Authorized Signatories">
      {!showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/10 px-4 py-2 text-[12px] font-medium text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/20"
          aria-label={`View all ${MOCK_SIGNATORIES.length} signatories`}
        >
          View All {MOCK_SIGNATORIES.length.toLocaleString()} Signatories
        </button>
      )}
      {showAll && (
        <span className="text-[12px] text-zinc-500">
          Showing {MOCK_SIGNATORIES.length.toLocaleString()} signatories
        </span>
      )}

      <EnterpriseTable
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, entity, role..."
        emptyTitle="No signatories"
        emptyDescription="No signatories match your search"
        stickyHeader
        exportable
        exportFilename="authorized-signatories"
      />
    </div>
  );
}
