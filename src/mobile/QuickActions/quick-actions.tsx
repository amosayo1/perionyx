"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, FileText, CreditCard, UserPlus, ArrowRightLeft,
  BarChart3, Search, Sparkles,
} from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: "gold" | "emerald" | "blue" | "amber" | "purple" | "red" | "zinc";
}

const colorMap = {
  gold: "bg-gold/10 text-gold active:bg-gold/20 border-gold/15",
  emerald: "bg-emerald-500/10 text-emerald-400 active:bg-emerald-500/20 border-emerald-500/15",
  blue: "bg-blue-500/10 text-blue-400 active:bg-blue-500/20 border-blue-500/15",
  amber: "bg-amber-500/10 text-amber-400 active:bg-amber-500/20 border-amber-500/15",
  purple: "bg-purple-500/10 text-purple-400 active:bg-purple-500/20 border-purple-500/15",
  red: "bg-red-500/10 text-red-400 active:bg-red-500/20 border-red-500/15",
  zinc: "bg-zinc-900/60 text-zinc-400 active:bg-zinc-800 border-zinc-800",
};

const DEFAULT_ACTIONS: QuickAction[] = [
  { id: "approve", label: "Approve", icon: <CheckCircle2 className="h-5 w-5" />, onClick: () => {}, color: "emerald" },
  { id: "invoice", label: "Invoice", icon: <FileText className="h-5 w-5" />, onClick: () => {}, color: "gold" },
  { id: "expense", label: "Expense", icon: <CreditCard className="h-5 w-5" />, onClick: () => {}, color: "amber" },
  { id: "vendor", label: "Vendor", icon: <UserPlus className="h-5 w-5" />, onClick: () => {}, color: "blue" },
  { id: "transfer", label: "Transfer", icon: <ArrowRightLeft className="h-5 w-5" />, onClick: () => {}, color: "purple" },
  { id: "report", label: "Report", icon: <BarChart3 className="h-5 w-5" />, onClick: () => {}, color: "zinc" },
  { id: "search", label: "Search", icon: <Search className="h-5 w-5" />, onClick: () => {}, color: "zinc" },
  { id: "ask-ai", label: "Ask AI", icon: <Sparkles className="h-5 w-5" />, onClick: () => {}, color: "gold" },
];

export function QuickActions({
  actions = DEFAULT_ACTIONS,
  columns = 4,
  className,
}: {
  actions?: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className={cn("grid gap-2", gridCols, className)}>
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileTap={{ scale: 0.93 }}
          onClick={action.onClick}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors",
            "min-h-[56px] min-w-[56px]",
            colorMap[action.color ?? "zinc"],
          )}
          aria-label={action.label}
        >
          {action.icon}
          <span className="text-[9px] font-semibold uppercase tracking-wider">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
