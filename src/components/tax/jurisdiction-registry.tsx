"use client";

import { useState, useMemo, memo } from "react";
import { Search, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxJurisdiction } from "./tax-types";

interface JurisdictionRegistryProps {
  jurisdictions: TaxJurisdiction[];
  onSelect?: (id: string) => void;
  className?: string;
}

const LEVEL_LABELS: Record<string, string> = {
  country: "Country",
  state: "State",
  region: "Region",
  city: "City",
};

export const JurisdictionRegistry = memo(function JurisdictionRegistry({ jurisdictions, onSelect, className }: JurisdictionRegistryProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return jurisdictions;
    const q = search.toLowerCase();
    return jurisdictions.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.country.toLowerCase().includes(q) ||
        (j.state && j.state.toLowerCase().includes(q))
    );
  }, [jurisdictions, search]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search jurisdictions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Country</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Level</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Tax Types</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Std Rate</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {filtered.map((j) => (
              <tr
                key={j.id}
                className={cn("transition-colors hover:bg-zinc-800/40", onSelect && "cursor-pointer")}
                onClick={() => onSelect?.(j.id)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-white">{j.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {j.country}
                  {j.state && <span className="text-zinc-500">, {j.state}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                    {LEVEL_LABELS[j.level] || j.level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {j.taxTypes.slice(0, 3).map((t) => (
                      <span key={t} className="inline-block rounded-md border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                        {t}
                      </span>
                    ))}
                    {j.taxTypes.length > 3 && (
                      <span className="inline-block rounded-md border border-zinc-500/20 bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                        +{j.taxTypes.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gold">{j.standardRate}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", j.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", j.isActive ? "bg-emerald-500" : "bg-zinc-500")} />
                    {j.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-2 py-3">
                  {onSelect && <ChevronRight className="h-4 w-4 text-zinc-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
