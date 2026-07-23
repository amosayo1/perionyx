"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, ArrowRightLeft, AlertTriangle,
  FileText, History, ChevronDown, Info, ExternalLink,
} from "lucide-react";

export interface ApprovalItem {
  id: string;
  title: string;
  amount: string;
  requester: string;
  department: string;
  timestamp: string;
  priority: "critical" | "high" | "medium" | "low";
  category?: string;
}

const priorityConfig = {
  critical: { border: "border-l-red-500", dot: "bg-red-500", label: "text-red-400", bg: "bg-red-500/[0.03]" },
  high: { border: "border-l-amber-500", dot: "bg-amber-400", label: "text-amber-400", bg: "bg-amber-500/[0.02]" },
  medium: { border: "border-l-blue-500", dot: "bg-blue-400", label: "text-blue-400", bg: "bg-blue-500/[0.02]" },
  low: { border: "border-l-zinc-600", dot: "bg-zinc-500", label: "text-zinc-500", bg: "bg-transparent" },
};

export function ApprovalCenter({
  approvals,
  onApprove,
  onReject,
  onDelegate,
  onEscalate,
  onViewDetails,
  className,
}: {
  approvals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelegate?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipedId(id);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, id: string) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx < -60) onApprove(id);
      else if (dx > 60) onReject(id);
      setSwipedId(null);
    },
    [onApprove, onReject],
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {approvals.map((item) => {
        const isExpanded = expandedId === item.id;
        const cfg = priorityConfig[item.priority];

        return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border border-white/[0.06] border-l-[3px]",
              cfg.border,
              cfg.bg,
            )}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onTouchEnd={(e) => handleTouchEnd(e, item.id)}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
              aria-expanded={isExpanded}
            >
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", cfg.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-200">{item.title}</span>
                  <span className="shrink-0 text-sm font-bold text-zinc-100">{item.amount}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-zinc-500">
                  <span>{item.requester}</span>
                  <span>{item.department}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-600 transition-transform", isExpanded && "rotate-180")} />
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
                  <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-4 pb-4 pt-3">
                    <ActionButton
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label="Approve"
                      onClick={() => onApprove(item.id)}
                      className="bg-emerald-500/10 text-emerald-400 active:bg-emerald-500/20"
                    />
                    <ActionButton
                      icon={<XCircle className="h-4 w-4" />}
                      label="Reject"
                      onClick={() => onReject(item.id)}
                      className="bg-red-500/10 text-red-400 active:bg-red-500/20"
                    />
                    {onDelegate && (
                      <ActionButton
                        icon={<ArrowRightLeft className="h-4 w-4" />}
                        label="Delegate"
                        onClick={() => onDelegate(item.id)}
                        className="bg-blue-500/10 text-blue-400 active:bg-blue-500/20"
                      />
                    )}
                    {onEscalate && (
                      <ActionButton
                        icon={<AlertTriangle className="h-4 w-4" />}
                        label="Escalate"
                        onClick={() => onEscalate(item.id)}
                        className="bg-amber-500/10 text-amber-400 active:bg-amber-500/20"
                      />
                    )}
                    <ActionButton
                      icon={<FileText className="h-4 w-4" />}
                      label="Documents"
                      onClick={() => onViewDetails?.(item.id)}
                      className="bg-zinc-800 text-zinc-400 active:bg-zinc-700"
                    />
                    <ActionButton
                      icon={<History className="h-4 w-4" />}
                      label="Audit Trail"
                      onClick={() => {}}
                      className="bg-zinc-800 text-zinc-400 active:bg-zinc-700"
                    />
                    <ActionButton
                      icon={<Info className="h-4 w-4" />}
                      label="Details"
                      onClick={() => onViewDetails?.(item.id)}
                      className="bg-zinc-800 text-zinc-400 active:bg-zinc-700"
                    />
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

function ActionButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn("flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-medium transition-colors min-h-[36px]", className)}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
