"use client";

import { cn } from "@/lib/utils";

interface ChartLegendItem {
  label: string;
  color: string;
  dashed?: boolean;
  value?: string;
  active?: boolean;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  onItemClick?: (label: string) => void;
  className?: string;
  direction?: "horizontal" | "vertical";
}

export function ChartLegend({ items, onItemClick, className, direction = "horizontal" }: ChartLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-3",
        direction === "vertical" && "flex-col gap-1.5",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => onItemClick?.(item.label)}
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] transition-opacity",
            onItemClick && "cursor-pointer hover:opacity-80",
            item.active === false ? "opacity-30" : "opacity-70",
          )}
        >
          <span className="relative inline-flex items-center">
            <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
              <line
                x1="1" y1="6" x2="11" y2="6"
                stroke={item.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={item.dashed ? "3 2" : undefined}
              />
            </svg>
          </span>
          <span className="text-zinc-400">{item.label}</span>
          {item.value && <span className="ml-0.5 text-zinc-300 font-medium">{item.value}</span>}
        </button>
      ))}
    </div>
  );
}
