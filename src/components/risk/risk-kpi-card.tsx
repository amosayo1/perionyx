"use client";

interface RiskKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable" | "improving" | "deteriorating";
  status?: "good" | "warning" | "critical";
  icon?: React.ReactNode;
}

export function RiskKPICard({ title, value, subtitle, trend, status, icon }: RiskKPICardProps) {
  const trendColor = trend === "up" || trend === "deteriorating"
    ? "text-red-400"
    : trend === "down" || trend === "improving"
      ? "text-emerald-400"
      : "text-gray-400";
  const statusDot = status === "critical"
    ? "bg-red-500"
    : status === "warning"
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          {status && <div className={`h-2 w-2 rounded-full ${statusDot}`} />}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs ${trendColor}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "improving" ? "↓" : trend === "deteriorating" ? "↑" : "→"}
            {" "}
            {trend === "up" || trend === "deteriorating" ? "Deteriorating"
              : trend === "down" || trend === "improving" ? "Improving"
                : "Stable"}
          </span>
        </div>
      )}
    </div>
  );
}