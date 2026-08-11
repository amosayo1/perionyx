"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChipDef {
  value: string;
  label: string;
  count?: number;
}

export function FilterChips({ chips }: { chips: ChipDef[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeFilter = searchParams.get("filter") ?? "";

  const handleClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("filter") === value) {
        params.delete("filter");
      } else {
        params.set("filter", value);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const isActive = activeFilter === chip.value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => handleClick(chip.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              "border border-white/[0.06]",
              isActive
                ? "bg-gold/10 text-gold border-gold/20"
                : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-[16px] items-center justify-center rounded px-1 text-[10px] tabular-nums",
                  isActive ? "bg-gold/20 text-gold" : "bg-white/[0.06] text-zinc-500",
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
