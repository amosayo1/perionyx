"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Globe, ChevronRight } from "lucide-react";
import { REGIONS } from "./data";
import type { Region } from "./types";

interface RegionSelectorProps {
  selected: Region | null;
  onSelect: (region: Region) => void;
  className?: string;
}

export const RegionSelector = memo(function RegionSelector({
  selected,
  onSelect,
  className,
}: RegionSelectorProps) {
  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Select banking region">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Select Region</h2>
      </div>
      <p className="text-sm text-white/[0.5]">Choose the region where your bank operates. This determines which banking providers and institutions are available.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {REGIONS.map((region) => {
          const isSelected = selected?.id === region.id;
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelect(region)}
              className={cn(
                "group flex items-center gap-4 rounded-lg border p-4 text-left transition-all",
                isSelected
                  ? "border-gold bg-gold/[0.05]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
              )}
              aria-pressed={isSelected}
              aria-label={`${region.name} — ${region.countryCount} countries`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-lg" aria-hidden="true">
                {region.flag}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", isSelected ? "text-gold" : "text-white/[0.87]")}>
                    {region.name}
                  </span>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all",
                    isSelected ? "text-gold translate-x-0" : "text-white/[0.3] -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  )} aria-hidden="true" />
                </div>
                <p className="mt-0.5 text-xs text-white/[0.5]">{region.description}</p>
                <span className="mt-1 inline-block rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/[0.4]">
                  {region.countryCount} {region.countryCount === 1 ? "country" : "countries"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
