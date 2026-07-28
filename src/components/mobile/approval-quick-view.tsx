"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRightLeft, AlertTriangle, FileText, History } from "lucide-react";

interface ApprovalItem {
  id: string;
  title: string;
  amount?: string;
  requester: string;
  department?: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

interface ApprovalQuickViewProps {
  approvals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelegate: (id: string) => void;
  onEscalate: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocuments: (id: string) => void;
  onViewAudit: (id: string) => void;
  className?: string;
}

const priorityStyles = {
  high: "border-l-red-500/60 bg-red-500/[0.03]",
  medium: "border-l-gold/60 bg-gold/[0.02]",
  low: "border-l-zinc-600 bg-transparent",
};

const priorityDot = {
  high: "bg-red-500",
  medium: "bg-gold",
  low: "bg-zinc-500",
};

export function ApprovalQuickView({
  approvals,
  onApprove,
  onReject,
  onDelegate,
  onEscalate,
  onViewDetails,
  onViewDocuments,
  onViewAudit,
  className,
}: ApprovalQuickViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {approvals.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <motion.div
            key={item.id}
            layout
            className={cn(
              "rounded-xl border border-white/[0.06] border-l-4 pl-3 pr-4 py-3",
              priorityStyles[item.priority],
            )}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", priorityDot[item.priority])} />
                  <span className="truncate text-sm font-medium text-zinc-200">{item.title}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
                  <span>{item.requester}</span>
                  {item.department && <span>{item.department}</span>}
                  <span>{item.timestamp}</span>
                </div>
              </div>
              {item.amount && (
                <span className="shrink-0 text-sm font-semibold text-zinc-200">{item.amount}</span>
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                    <button
                      onClick={() => onApprove(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-400 active:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-400 active:bg-red-500/20"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => onDelegate(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-[11px] font-medium text-blue-400 active:bg-blue-500/20"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Delegate
                    </button>
                    <button
                      onClick={() => onEscalate(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-400 active:bg-amber-500/20"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Escalate
                    </button>
                    <button
                      onClick={() => onViewDocuments(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[11px] font-medium text-zinc-400 active:bg-zinc-700"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Documents
                    </button>
                    <button
                      onClick={() => onViewAudit(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[11px] font-medium text-zinc-400 active:bg-zinc-700"
                    >
                      <History className="h-3.5 w-3.5" />
                      Audit Trail
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
