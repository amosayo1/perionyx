"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeftRight, FileText, Shield, Users, GitBranch, Wallet, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: any;
  description?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Transaction", href: "/transactions", icon: ArrowLeftRight, description: "Create a payment or transfer" },
  { label: "Create Wallet", href: "/wallets", icon: Wallet, description: "Add a new treasury wallet" },
  { label: "Risk Report", href: "/risk", icon: Shield, description: "View current risk posture" },
  { label: "Generate Report", href: "/reports", icon: FileText, description: "Export treasury data" },
  { label: "Manage Users", href: "/admin/users", icon: Users, description: "Add or manage team members" },
  { label: "Automation", href: "/automation-studio", icon: GitBranch, description: "Create workflow automations" },
];

interface QuickActionsPanelProps {
  className?: string;
}

export function QuickActionsPanel({ className }: QuickActionsPanelProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("gap-1.5 rounded-xl text-xs text-zinc-400 hover:text-white", className)}
      >
        <Plus className="h-3.5 w-3.5" />
        Quick Actions
      </Button>
    );
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm", className)}>
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-gold/20 hover:bg-gold/5"
            >
              <action.icon className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-white">{action.label}</span>
              {action.description && (
                <span className="text-[10px] text-zinc-500">{action.description}</span>
              )}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-600">
          Press <kbd className="rounded border border-white/[0.06] px-1 py-0.5">Q</kbd> to open
        </p>
      </div>
    </div>
  );
}
