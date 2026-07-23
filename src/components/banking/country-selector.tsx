"use client";

import { cn } from "@/lib/utils";
import { memo, useState, useMemo } from "react";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { getCountriesByRegion } from "./data";
import type { Country, Region } from "./types";

interface CountrySelectorProps {
  region: Region;
  selected: Country | null;
  onSelect: (country: Country) => void;
  className?: string;
}

export const CountrySelector = memo(function CountrySelector({
  region,
  selected,
  onSelect,
  className,
}: CountrySelectorProps) {
  const [search, setSearch] = useState("");
  const countries = useMemo(() => getCountriesByRegion(region.id), [region.id]);

  const filtered = useMemo(
    () => countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [countries, search],
  );

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Select country">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Select Country</h2>
      </div>
      <p className="text-sm text-white/[0.5]">Choose the country where your bank is registered. Available providers and institutions are filtered by country.</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.3]" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-white/[0.87] placeholder:text-white/[0.3] focus:border-gold/50 focus:outline-none"
          aria-label="Search countries"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((country) => {
          const isSelected = selected?.code === country.code;
          return (
            <button
              key={country.code}
              type="button"
              onClick={() => onSelect(country)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                isSelected
                  ? "border-gold bg-gold/[0.05]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
              )}
              aria-pressed={isSelected}
              aria-label={country.name}
            >
              <span className="text-lg" aria-hidden="true">{country.flag}</span>
              <span className={cn("flex-1 text-sm", isSelected ? "text-gold font-medium" : "text-white/[0.87]")}>
                {country.name}
              </span>
              {isSelected && <ChevronRight className="h-4 w-4 text-gold" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/[0.4]">No countries match your search</p>
      )}
    </div>
  );
});
