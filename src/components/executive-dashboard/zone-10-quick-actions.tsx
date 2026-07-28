"use client";

import { memo } from "react";
import Link from "next/link";
import {
  FileText, ArrowLeftRight, Wallet, BookOpen, CheckCircle2,
  BarChart3, UserPlus, Building2, GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";

interface Zone10Props {
  className?: string;
}

const actions = [
  { id: "invoice", label: "New Invoice", icon: FileText, href: "/transactions/new", color: "text-blue-400 bg-blue-500/10" },
  { id: "payment", label: "Payment", icon: Wallet, href: "/transactions/new", color: "text-emerald-400 bg-emerald-500/10" },
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight, href: "/transactions/new", color: "text-gold bg-gold-500/10" },
  { id: "journal", label: "Journal", icon: BookOpen, href: "/ledger", color: "text-purple-400 bg-purple-500/10" },
  { id: "approval", label: "Approval", icon: CheckCircle2, href: "/approvals", color: "text-amber-400 bg-amber-500/10" },
  { id: "report", label: "Report", icon: BarChart3, href: "/reports", color: "text-cyan-400 bg-cyan-500/10" },
  { id: "customer", label: "Customer", icon: UserPlus, href: "/settings", color: "text-pink-400 bg-pink-500/10" },
  { id: "supplier", label: "Supplier", icon: Building2, href: "/settings", color: "text-orange-400 bg-orange-500/10" },
  { id: "workflow", label: "Workflow", icon: GitBranch, href: "/automation-studio", color: "text-violet-400 bg-violet-500/10" },
];

export const Zone10QuickActions = memo(function Zone10QuickActions({ className }: Zone10Props) {
  return (
    <DashboardCard
      title="Quick Actions"
      description="Frequently used operations"
      size="third"
      className={className}
    >
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition-all",
                "hover:bg-zinc-800/40 focus:outline-none focus:ring-1 focus:ring-zinc-600",
                "group/action cursor-pointer",
              )}
              aria-label={action.label}
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-md transition-transform group-hover/action:scale-110", action.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-medium text-zinc-500 group-hover/action:text-zinc-300 transition-colors text-center leading-tight">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
});
