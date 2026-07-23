"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Check, X, Eye, RefreshCw, FileText, CreditCard, DollarSign, ArrowUpRight } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: typeof Check;
  granted: boolean;
  required: boolean;
}

interface PermissionReviewProps {
  permissions: Permission[];
  onToggle?: (id: string) => void;
  className?: string;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { id: "read_balance", name: "Read Balances", description: "Access account balance information", icon: DollarSign, granted: true, required: true },
  { id: "read_transactions", name: "Read Transactions", description: "View transaction history and details", icon: FileText, granted: true, required: true },
  { id: "read_accounts", name: "Read Accounts", description: "Discover and view account details", icon: Eye, granted: true, required: true },
  { id: "initiate_payments", name: "Initiate Payments", description: "Send ACH, wire, and internal transfers", icon: ArrowUpRight, granted: false, required: false },
  { id: "read_credit", name: "Read Credit Details", description: "Access credit card and loan information", icon: CreditCard, granted: false, required: false },
  { id: "sync_data", name: "Background Sync", description: "Automatically sync data in the background", icon: RefreshCw, granted: true, required: true },
];

export const PermissionReview = memo(function PermissionReview({
  permissions = DEFAULT_PERMISSIONS,
  onToggle,
  className,
}: PermissionReviewProps) {
  return (
    <div className={cn("space-y-3", className)} role="group" aria-label="Permission review">
      <h3 className="text-sm font-medium text-white/[0.87]">Permissions Required</h3>
      <p className="text-xs text-white/[0.5]">Review the permissions this connection requires. Required permissions cannot be removed.</p>
      <ul className="space-y-2">
        {permissions.map((perm) => (
          <li
            key={perm.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              perm.granted
                ? "border-white/[0.06] bg-white/[0.02]"
                : "border-white/[0.04] bg-white/[0.01] opacity-50",
            )}
          >
            <button
              type="button"
              onClick={() => onToggle?.(perm.id)}
              disabled={perm.required}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
                perm.required && "cursor-not-allowed",
                perm.granted
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.06] text-white/[0.3]",
              )}
              aria-label={`${perm.name}: ${perm.granted ? "Granted" : "Not granted"}${perm.required ? " (required)" : ""}`}
              aria-pressed={perm.granted}
            >
              {perm.granted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <perm.icon className="h-3.5 w-3.5 text-white/[0.5]" aria-hidden="true" />
                <span className="text-sm text-white/[0.87]">{perm.name}</span>
                {perm.required && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">Required</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-white/[0.5]">{perm.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});
