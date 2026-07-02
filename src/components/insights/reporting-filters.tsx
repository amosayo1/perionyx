"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const periodOptions = ["This Month", "Last Month", "This Quarter", "This Year"];
const orgOptions = ["All Organizations", "Acme Corp", "Globex Inc", "Initech Group", "Hooli LLC"];
const unitOptions = ["All Business Units", "Engineering", "Finance", "Operations", "Sales", "Legal"];
const currencyOptions = ["All Currencies", "USD", "EUR", "GBP", "JPY", "CHF"];

interface FilterState {
  period: string;
  org: string;
  unit: string;
  currency: string;
}

export function ReportingFilters() {
  const [filters, setFilters] = useState<FilterState>({
    period: "This Month",
    org: "All Organizations",
    unit: "All Business Units",
    currency: "All Currencies",
  });

  const cycle = (key: keyof FilterState, options: string[]) => {
    setFilters((prev) => {
      const idx = options.indexOf(prev[key]);
      const next = options[(idx + 1) % options.length];
      toast.info(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${next}`);
      return { ...prev, [key]: next };
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-3.5 w-3.5 text-zinc-500" />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-zinc-400"
        onClick={() => cycle("period", periodOptions)}
      >
        {filters.period}
        <ChevronDown className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-zinc-400"
        onClick={() => cycle("org", orgOptions)}
      >
        {filters.org}
        <ChevronDown className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-zinc-400"
        onClick={() => cycle("unit", unitOptions)}
      >
        {filters.unit}
        <ChevronDown className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-zinc-400"
        onClick={() => cycle("currency", currencyOptions)}
      >
        {filters.currency}
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
