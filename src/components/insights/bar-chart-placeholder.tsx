import { cn } from "@/lib/utils";

interface Props {
  data: { label: string; value: number; color: string }[];
  className?: string;
}

export function BarChartPlaceholder({ data, className }: Props) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={cn("flex items-end gap-3 w-full h-full", className)}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
          <div
            className={cn(
              "w-full rounded-t-sm transition-all",
              item.color === "emerald" && "bg-gold/30",
              item.color === "blue" && "bg-blue-500/30",
              item.color === "purple" && "bg-purple-500/30",
              item.color === "amber" && "bg-amber-500/30",
              item.color === "zinc" && "bg-zinc-600/30",
            )}
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <span className="text-[9px] text-zinc-600 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
