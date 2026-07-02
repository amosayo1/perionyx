import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/format";

const statusColors: Record<string, string> = {
  pending: "text-amber-400",
  completed: "text-[#d4af37]",
  failed: "text-red-400",
  PENDING: "text-amber-400",
  COMPLETED: "text-[#d4af37]",
  FAILED: "text-red-400",
};

const typeIcons: Record<string, any> = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  transfer: ArrowLeftRight,
  CREDIT: ArrowDownLeft,
  DEBIT: ArrowUpRight,
  TRANSFER: ArrowLeftRight,
};

type Transaction = {
  id: string;
  type: string;
  status: string;
  primaryAmount: string;
  currency: string;
  reference: string | null;
  createdAt: string;
};

export function ActivityTimeline({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-white/40">No recent activity</p>;
  }

  return (
    <div className="space-y-0">
      {transactions.slice(0, 5).map((txn, i) => {
        const Icon = typeIcons[txn.type] || ArrowLeftRight;
        return (
          <div key={txn.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < transactions.slice(0, 5).length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/5" />
            )}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800/50">
              <Icon className="h-3 w-3 text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white/90 truncate">
                  {txn.reference || `${txn.type} transaction`}
                </span>
                <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${statusColors[txn.status] || "text-white/60"}`}>
                  {txn.primaryAmount} {txn.currency}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-white/40">{formatDateTime(txn.createdAt)}</span>
                <span className={`text-[10px] font-medium uppercase ${statusColors[txn.status] || "text-white/40"}`}>
                  {txn.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
