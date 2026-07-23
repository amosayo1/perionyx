"use client";

import { cn } from "@/lib/utils";
import { memo, useState, useMemo } from "react";
import { Search, Building2, ChevronRight, Check, Banknote, Landmark, PiggyBank, Monitor } from "lucide-react";
import { getInstitutionsByCountry } from "./data";
import type { BankInstitution, BankProvider, Country } from "./types";

interface InstitutionSelectorProps {
  country: Country;
  provider: BankProvider;
  selected: BankInstitution | null;
  onSelect: (institution: BankInstitution) => void;
  className?: string;
}

const CATEGORY_CONFIG = {
  commercial: { label: "Commercial Banks", icon: Landmark, color: "text-blue-400" },
  investment: { label: "Investment Banks", icon: Banknote, color: "text-purple-400" },
  islamic: { label: "Islamic Banks", icon: PiggyBank, color: "text-emerald-400" },
  digital: { label: "Digital Banks", icon: Monitor, color: "text-cyan-400" },
} as const;

export const InstitutionSelector = memo(function InstitutionSelector({
  country,
  provider: _provider,
  selected,
  onSelect,
  className,
}: InstitutionSelectorProps) {
  const [search, setSearch] = useState("");
  const institutions = useMemo(() => getInstitutionsByCountry(country.code), [country.code]);

  const grouped = useMemo(() => {
    const filtered = institutions.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()),
    );
    const groups: Record<string, BankInstitution[]> = {};
    for (const inst of filtered) {
      const cat = inst.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(inst);
    }
    return groups;
  }, [institutions, search]);

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Select financial institution">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Select Institution</h2>
      </div>
      <p className="text-sm text-white/[0.5]">
        Choose your bank or financial institution in <span className="text-white/[0.7]">{country.name}</span>.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.3]" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search institutions..."
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-white/[0.87] placeholder:text-white/[0.3] focus:border-gold/50 focus:outline-none"
          aria-label="Search institutions"
        />
      </div>

      <div className="space-y-6">
        {(Object.entries(CATEGORY_CONFIG) as [string, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([cat, config]) => {
          const items = grouped[cat];
          if (!items?.length) return null;
          const Icon = config.icon;

          return (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} aria-hidden="true" />
                <h3 className="text-xs font-medium text-white/[0.5] uppercase tracking-wider">{config.label}</h3>
                <span className="text-xs text-white/[0.3]">({items.length})</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((inst) => {
                  const isSelected = selected?.id === inst.id;
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => onSelect(inst)}
                      disabled={!inst.supported}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        !inst.supported && "opacity-40 cursor-not-allowed",
                        isSelected
                          ? "border-gold bg-gold/[0.05]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${inst.name}${!inst.supported ? " (not supported)" : ""}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs font-bold text-white/[0.3]">
                        {inst.name.charAt(0)}
                      </div>
                      <span className={cn("flex-1 text-sm", isSelected ? "text-gold font-medium" : "text-white/[0.87]")}>
                        {inst.name}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
                      {!inst.supported && <span className="text-[10px] text-white/[0.3]">Unavailable</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <p className="text-center text-sm text-white/[0.4]">No institutions match your search</p>
        )}
      </div>
    </div>
  );
});
