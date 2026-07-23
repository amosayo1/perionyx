"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Search, Plus, Camera, Bell, History, Star } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

interface QuickActionBarProps {
  onApprove?: () => void;
  onReview?: () => void;
  onSearch?: () => void;
  onCreate?: () => void;
  onScan?: () => void;
  onNotifications?: () => void;
  onRecent?: () => void;
  className?: string;
}

export function QuickActionBar({
  onApprove,
  onReview,
  onSearch,
  onCreate,
  onScan,
  onNotifications,
  onRecent,
  className,
}: QuickActionBarProps) {
  const actions: QuickAction[] = [
    ...(onApprove ? [{ id: "approve", label: "Approve", icon: <CheckCircle className="h-5 w-5" />, onClick: onApprove, primary: true }] : []),
    ...(onReview ? [{ id: "review", label: "Review", icon: <Star className="h-5 w-5" />, onClick: onReview }] : []),
    ...(onSearch ? [{ id: "search", label: "Search", icon: <Search className="h-5 w-5" />, onClick: onSearch }] : []),
    ...(onCreate ? [{ id: "create", label: "Create", icon: <Plus className="h-5 w-5" />, onClick: onCreate }] : []),
    ...(onScan ? [{ id: "scan", label: "Scan", icon: <Camera className="h-5 w-5" />, onClick: onScan }] : []),
    ...(onNotifications ? [{ id: "notifications", label: "Alerts", icon: <Bell className="h-5 w-5" />, onClick: onNotifications }] : []),
    ...(onRecent ? [{ id: "recent", label: "Recent", icon: <History className="h-5 w-5" />, onClick: onRecent }] : []),
  ];

  return (
    <div className={cn("flex items-center gap-3 overflow-x-auto px-1 py-2 scrollbar-none", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3",
            action.primary
              ? "bg-[#d4af37]/10 text-[#d4af37] active:bg-[#d4af37]/20"
              : "bg-zinc-900/60 text-zinc-400 active:bg-zinc-800 active:text-zinc-300",
          )}
        >
          {action.icon}
          <span className="text-[10px] font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
