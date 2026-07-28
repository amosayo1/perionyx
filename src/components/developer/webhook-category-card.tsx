import { cn } from "@/lib/utils";
import type { WebhookCategory } from "./types";

const statusConfig: Record<string, { label: string; dot: string }> = {
  healthy: { label: "Healthy", dot: "bg-gold" },
  warning: { label: "Warning", dot: "bg-amber-500" },
  degraded: { label: "Degraded", dot: "bg-red-500" },
};

export function WebhookCategoryCard({ category }: { category: WebhookCategory }) {
  const cfg = statusConfig[category.deliveryStatus];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{category.name}</span>
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className={cn("text-[10px] font-semibold", category.deliveryStatus === "healthy" && "text-gold", category.deliveryStatus === "warning" && "text-amber-400", category.deliveryStatus === "degraded" && "text-red-400")}>
            {cfg.label}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div><span className="text-zinc-600">Events</span><p className="text-zinc-300 font-medium">{category.eventCount}</p></div>
        <div><span className="text-zinc-600">Retry rate</span><p className="text-zinc-300 font-medium">{category.retryRate}</p></div>
        <div><span className="text-zinc-600">Last</span><p className="text-zinc-300 font-medium text-[10px]">{category.lastDelivery}</p></div>
      </div>
    </div>
  );
}
