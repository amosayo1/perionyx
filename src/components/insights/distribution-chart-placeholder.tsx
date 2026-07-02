import { cn } from "@/lib/utils";

interface Props {
  data: { label: string; value: number; color: string }[];
  className?: string;
}

const colorMap: Record<string, string> = {
  emerald: "bg-[#d4af37]",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  zinc: "bg-zinc-600",
};

export function DistributionChartPlaceholder({ data, className }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Stacked bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800">
        {data.map((item) => (
          <div
            key={item.label}
            className={cn("transition-all", colorMap[item.color] ?? "bg-zinc-600")}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                colorMap[item.color] ?? "bg-zinc-600",
              )}
            />
            <span className="text-[11px] text-zinc-500">{item.label}</span>
            <span className="text-[11px] text-zinc-400 ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
