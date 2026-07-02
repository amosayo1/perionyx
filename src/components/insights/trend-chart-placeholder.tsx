import { cn } from "@/lib/utils";

const points = [30, 45, 38, 52, 48, 62, 58, 72, 68, 82, 78, 92];

export function TrendChartPlaceholder({ className }: { className?: string }) {
  const max = Math.max(...points);
  const width = 100 / points.length;
  return (
    <div className={cn("flex items-end gap-[2px] w-full h-full", className)}>
      {points.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-[#d4af37]/20 group-hover:bg-[#d4af37]/30 transition-colors"
          style={{ height: `${(p / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
