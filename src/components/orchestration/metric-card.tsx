"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; direction: "up" | "down" | "flat" };
}

export function MetricCard({ label, value, subtitle, trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
      {trend && (
        <p className={`mt-1 text-xs ${trend.direction === "up" ? "text-green-400" : trend.direction === "down" ? "text-red-400" : "text-zinc-500"}`}>
          {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}%
        </p>
      )}
    </div>
  );
}
