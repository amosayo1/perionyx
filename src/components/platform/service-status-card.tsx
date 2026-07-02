import { cn } from "@/lib/utils";
import type { PlatformService } from "./types";

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  healthy: {
    label: "Healthy",
    dot: "bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.3)]",
    bg: "border-[#d4af37]/10 bg-[#d4af37]/[0.03]",
  },
  warning: {
    label: "Warning",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
    bg: "border-amber-500/10 bg-amber-500/[0.03]",
  },
  offline: {
    label: "Offline",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
    bg: "border-red-500/10 bg-red-500/[0.03]",
  },
};

export function ServiceStatusCard({ service }: { service: PlatformService }) {
  const cfg = statusConfig[service.status] ?? statusConfig.healthy;

  return (
    <div className={cn("rounded-xl border p-3 transition-all", cfg.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="text-sm font-medium text-white">{service.name}</span>
        </div>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", service.status === "healthy" && "text-[#d4af37]", service.status === "warning" && "text-amber-400", service.status === "offline" && "text-red-400")}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{service.description}</p>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
        <span>Latency: {service.latency}</span>
        <span>Checked: {service.lastChecked}</span>
        <span>Uptime: {service.uptime}</span>
      </div>
    </div>
  );
}
