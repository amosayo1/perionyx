"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MOCK_DORMANT_ACCOUNTS } from "./data";
import type { DormantAccount } from "./types";
import { Clock, AlertTriangle, DollarSign, Calendar, X, Ban, RefreshCw, Merge, ArrowRightLeft, Eye } from "lucide-react";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const actionStyles: Record<DormantAccount["recommendedAction"], string> = {
  close: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  reactivate: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  merge: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  transfer_funds: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  monitor: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20",
};

const actionIcons: Record<DormantAccount["recommendedAction"], typeof Ban> = {
  close: Ban,
  reactivate: RefreshCw,
  merge: Merge,
  transfer_funds: ArrowRightLeft,
  monitor: Eye,
};

const actionLabels: Record<DormantAccount["recommendedAction"], string> = {
  close: "Close",
  reactivate: "Reactivate",
  merge: "Merge",
  transfer_funds: "Transfer",
  monitor: "Monitor",
};

const dormantColor = (days: number) => {
  if (days > 365) return "text-red-400 bg-red-500/5 border-red-500/15";
  if (days > 180) return "text-amber-400 bg-amber-500/5 border-amber-500/15";
  return "text-blue-400 bg-blue-500/5 border-blue-500/15";
};

const sorted = [...MOCK_DORMANT_ACCOUNTS].sort((a, b) => b.dormantDays - a.dormantDays);

export function DormantAccountPanel() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(q) ||
        a.accountName.toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        a.bank.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleChecked = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checked.size === filtered.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(filtered.map((a) => a.id)));
    }
  };

  const totalBalance = MOCK_DORMANT_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalFees = MOCK_DORMANT_ACCOUNTS.reduce((s, a) => s + a.feesYearToDate, 0);
  const longestDormant = Math.max(...MOCK_DORMANT_ACCOUNTS.map((a) => a.dormantDays));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Dormant Account Management</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_DORMANT_ACCOUNTS.length} accounts dormant &gt;90 days</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search accounts..."
            aria-label="Search dormant accounts"
            className="w-48 rounded-md border border-white/[0.06] bg-zinc-800/50 py-1.5 px-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            disabled={checked.size === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              checked.size > 0
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
            )}
            aria-label={`Close ${checked.size} selected accounts`}
          >
            <Ban className="h-3.5 w-3.5" />
            Close Selected {checked.size > 0 && `(${checked.size})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-[12px] text-zinc-500">Dormant Accounts</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-white">{MOCK_DORMANT_ACCOUNTS.length}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-red-400" />
            <span className="text-[12px] text-zinc-500">Balance at Risk</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-red-400">{fmtCurrency(totalBalance)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-[12px] text-zinc-500">Annual Fees Wasted</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-amber-400">{fmtCurrency(totalFees)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-[12px] text-zinc-500">Longest Dormant</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-blue-400">{longestDormant} days</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]" role="table" aria-label="Dormant account list">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={checked.size === filtered.length ? "Deselect all" : "Select all"}
                    className="h-3.5 w-3.5 accent-amber-500"
                    checked={checked.size > 0 && checked.size === filtered.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-3 py-3 font-medium">Account</th>
                <th className="px-3 py-3 font-medium">Entity</th>
                <th className="px-3 py-3 font-medium">Bank</th>
                <th className="px-3 py-3 font-medium">Currency</th>
                <th className="px-3 py-3 text-right font-medium">Balance</th>
                <th className="px-3 py-3 text-right font-medium">Dormant Days</th>
                <th className="px-3 py-3 font-medium">Last Activity</th>
                <th className="px-3 py-3 text-right font-medium">Monthly Fees</th>
                <th className="px-3 py-3 text-right font-medium">Fees YTD</th>
                <th className="px-3 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const ActionIcon = actionIcons[a.recommendedAction];
                return (
                  <tr
                    key={a.id}
                    className={cn(
                      "border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30",
                      dormantColor(a.dormantDays)
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${a.accountNumber}`}
                        className="h-3.5 w-3.5 accent-amber-500"
                        checked={checked.has(a.id)}
                        onChange={() => toggleChecked(a.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-white">{a.accountName}</div>
                      <div className="font-mono text-[12px] text-zinc-500">{a.accountNumber}</div>
                    </td>
                    <td className="px-3 py-3 text-zinc-300">{a.entity}</td>
                    <td className="px-3 py-3 text-zinc-300">{a.bank}</td>
                    <td className="px-3 py-3 font-mono text-zinc-400">{a.currency}</td>
                    <td className={cn("px-3 py-3 text-right font-mono", a.balance !== 0 ? "text-zinc-300" : "text-zinc-600")}>
                      {fmtCurrency(a.balance)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                        a.dormantDays > 365 ? "bg-red-500/10 text-red-400" :
                        a.dormantDays > 180 ? "bg-amber-500/10 text-amber-400" :
                        "bg-blue-500/10 text-blue-400"
                      )}>
                        {a.dormantDays}d
                      </span>
                    </td>
                    <td className="px-3 py-3 text-zinc-500">{a.lastActivity}</td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400">{fmtCurrency(a.monthlyFees)}</td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400">{fmtCurrency(a.feesYearToDate)}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors", actionStyles[a.recommendedAction])}
                        aria-label={`${actionLabels[a.recommendedAction]} account ${a.accountNumber}`}
                      >
                        <ActionIcon className="h-3 w-3" />
                        {actionLabels[a.recommendedAction]}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}