"use client";

import { cn } from "@/lib/utils";
import { memo, useState, useMemo } from "react";
import { Shield, Zap, Building2, BadgeCheck, ChevronRight, Search, Check } from "lucide-react";
import { PROMOTOS } from "./data";
import type { BankProvider, Country } from "./types";

interface ProviderSelectorProps {
  country: Country;
  selected: BankProvider | null;
  onSelect: (provider: BankProvider) => void;
  className?: string;
}

const LATENCY_COLORS = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
} as const;

export const ProviderSelector = memo(function ProviderSelector({
  country,
  selected,
  onSelect,
  className,
}: ProviderSelectorProps) {
  const [search, setSearch] = useState("");

  const providers = useMemo(() => {
    return PROMOTOS.filter((p) => p.regions.includes(country.region));
  }, [country.region]);

  const filtered = useMemo(
    () => providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [providers, search],
  );

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Select banking provider">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Select Provider</h2>
      </div>
      <p className="text-sm text-white/[0.5]">
        Recommended providers for <span className="text-white/[0.7]">{country.name}</span>. Compare capabilities, coverage, and ratings.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.3]" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search providers..."
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-white/[0.87] placeholder:text-white/[0.3] focus:border-gold/50 focus:outline-none"
          aria-label="Search providers"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((provider) => {
          const isSelected = selected?.id === provider.id;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelect(provider)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-all",
                isSelected
                  ? "border-gold bg-gold/[0.05]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-lg font-bold text-white/[0.3]">
                  {provider.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", isSelected ? "text-gold" : "text-white/[0.87]")}>
                      {provider.name}
                    </span>
                    {provider.recommended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/[0.1] px-2 py-0.5 text-[10px] font-medium text-gold">
                        <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                        Recommended
                      </span>
                    )}
                    {isSelected && <Check className="ml-auto h-4 w-4 text-gold" aria-hidden="true" />}
                  </div>
                  <p className="mt-1 text-xs text-white/[0.5] line-clamp-2">{provider.description}</p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/[0.4]">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" aria-hidden="true" />
                      {provider.supportedBankCount.toLocaleString()} institutions
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className={cn("h-3 w-3", LATENCY_COLORS[provider.latencyRating])} aria-hidden="true" />
                      {provider.enterpriseRating}/5 rating
                    </span>
                    <span>{provider.authTypes.join(", ")}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {provider.capabilities.slice(0, 4).map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/[0.5]"
                      >
                        {cap}
                      </span>
                    ))}
                    {provider.capabilities.length > 4 && (
                      <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/[0.3]">
                        +{provider.capabilities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "mt-2 h-4 w-4 shrink-0",
                  isSelected ? "text-gold" : "text-white/[0.2]",
                )} aria-hidden="true" />
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-white/[0.4]">No providers found for this country</p>
        )}
      </div>
    </div>
  );
});
