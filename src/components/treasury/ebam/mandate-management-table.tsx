"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from "lucide-react";
import { MOCK_MANDATES } from "./data";
import type { Mandate, SigningAuthority, MandateStatus } from "./types";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const statusStyles: Record<MandateStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  expiring: "bg-amber-500/10 text-amber-400",
  expired: "bg-red-500/10 text-red-400",
  revoked: "bg-zinc-500/10 text-zinc-400",
  pending_renewal: "bg-blue-500/10 text-blue-400",
};

const authorityStyles: Record<SigningAuthority, string> = {
  sole: "bg-blue-500/10 text-blue-400",
  joint: "bg-purple-500/10 text-purple-400",
  any_two: "bg-cyan-500/10 text-cyan-400",
  any_three: "bg-teal-500/10 text-teal-400",
  manager: "bg-emerald-500/10 text-emerald-400",
  director: "bg-amber-500/10 text-amber-400",
  cfo: "bg-yellow-500/10 text-yellow-400",
  ceo: "bg-red-500/10 text-red-400",
};

const sorted = [...MOCK_MANDATES].sort(
  (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
);

const isExpiringSoon = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
};

export function MandateManagementTable() {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (m) =>
        m.mandateId.toLowerCase().includes(q) ||
        m.accountNumber.toLowerCase().includes(q) ||
        m.bank.toLowerCase().includes(q)
    );
  }, [search]);

  const display = showAll ? filtered : filtered.slice(0, 15);
  const totalCount = filtered.length;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">Mandate Management</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_MANDATES.length} mandates across all entities</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, account, bank..."
            aria-label="Search mandates"
            className="w-64 rounded-md border border-white/[0.06] bg-zinc-800/50 py-1.5 pl-8 pr-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Mandate register">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Mandate ID</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Bank</th>
              <th className="px-5 py-3 font-medium">Signatories</th>
              <th className="px-5 py-3 font-medium">Authority</th>
              <th className="px-5 py-3 text-right font-medium">Approval Limit</th>
              <th className="px-5 py-3 font-medium">Effective</th>
              <th className="px-5 py-3 font-medium">Expiry</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {display.map((m) => {
              const expiring = isExpiringSoon(m.expiryDate);
              return (
                <tr
                  key={m.id}
                  className={cn(
                    "border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30",
                    expiring && "bg-amber-500/5"
                  )}
                >
                  <td className="px-5 py-3 font-medium text-white">{m.mandateId}</td>
                  <td className="px-5 py-3 font-mono text-zinc-300">{m.accountNumber}</td>
                  <td className="px-5 py-3 text-zinc-300">{m.bank}</td>
                  <td className="px-5 py-3">
                    <div className="flex -space-x-1.5">
                      {m.signatories.slice(0, 3).map((s, i) => (
                        <div
                          key={i}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] font-medium text-zinc-400"
                          title={s}
                        >
                          {s.replace("SIG-", "").padStart(2, "0")}
                        </div>
                      ))}
                      {m.signatories.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-500">
                          +{m.signatories.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", authorityStyles[m.authorityType])}>
                      {m.authorityType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-zinc-300">{fmtCurrency(m.approvalLimit)}</td>
                  <td className="px-5 py-3 text-zinc-400">{m.effectiveDate}</td>
                  <td className="px-5 py-3 text-zinc-400">{m.expiryDate}</td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusStyles[m.status])}>
                      {m.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {m.renewalRequired ? (
                      <span className="inline-block rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">Yes</span>
                    ) : (
                      <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!showAll && totalCount > 15 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-5 py-3 text-[13px] text-amber-400 transition-colors hover:bg-zinc-800/30"
          aria-label={`View all ${totalCount} mandates`}
        >
          View All {totalCount} Mandates
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      {showAll && totalCount > 15 && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-5 py-3 text-[13px] text-zinc-500 transition-colors hover:bg-zinc-800/30"
          aria-label="Show fewer mandates"
        >
          Show Less
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}