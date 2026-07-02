import { cn } from "@/lib/utils";
import type { WebhookEndpoint } from "./types";

const statusConfig: Record<string, { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "bg-[#d4af37]" },
  disconnected: { label: "Disconnected", dot: "bg-red-500" },
  warning: { label: "Warning", dot: "bg-amber-500" },
  retrying: { label: "Retrying", dot: "bg-amber-500 animate-pulse" },
};

export function WebhookCard({ webhook }: { webhook: WebhookEndpoint }) {
  const cfg = statusConfig[webhook.status] ?? statusConfig.connected;
  const rateColor = webhook.successRate >= 99 ? "text-[#d4af37]" : webhook.successRate >= 97 ? "text-amber-400" : "text-red-400";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="text-sm font-medium text-white">{webhook.name}</span>
        </div>
        <span className={cn("text-[10px] font-semibold", webhook.status === "connected" && "text-[#d4af37]", webhook.status === "disconnected" && "text-red-400", (webhook.status === "warning" || webhook.status === "retrying") && "text-amber-400")}>
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={cn("text-lg font-semibold", rateColor)}>{webhook.successRate}%</span>
        <span className="text-[10px] text-zinc-600">success rate</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-600">
        <div>
          <span>Retries</span>
          <p className="text-zinc-400 font-medium">{webhook.retries}</p>
        </div>
        <div>
          <span>Failures</span>
          <p className="text-zinc-400 font-medium">{webhook.failures}</p>
        </div>
        <div>
          <span>Latency</span>
          <p className="text-zinc-400 font-medium">{webhook.avgLatency}</p>
        </div>
      </div>

      <p className="text-[10px] text-zinc-600 mt-2">Last delivery: {webhook.lastDelivery}</p>
    </div>
  );
}
