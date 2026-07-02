import { cn } from "@/lib/utils";

interface Props {
  points?: number[];
  color?: string;
  className?: string;
}

export function LineChartPlaceholder({
  points = [20, 35, 28, 45, 38, 52, 48, 58, 52, 62, 58, 68, 62, 72],
  color = "emerald",
  className,
}: Props) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const colorClasses: Record<string, string> = {
    emerald: "bg-[#d4af37]/20",
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
    red: "bg-red-500/20",
    purple: "bg-purple-500/20",
  };

  return (
    <div className={cn("flex items-end gap-[3px] w-full h-full", className)}>
      {points.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm relative"
          style={{ height: "100%" }}
        >
          <div
            className={cn(
              "absolute bottom-0 w-full rounded-sm transition-all",
              colorClasses[color] ?? colorClasses.emerald,
            )}
            style={{ height: `${((p - min) / range) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}
