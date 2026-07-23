"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nav-recent-pages";
const MAX_RECENT = 5;

export function useRecentPages() {
  const [recent, setRecent] = useState<{ href: string; label: string; timestamp: number }[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const visit = useCallback((href: string, label: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.href !== href);
      const next = [{ href, label, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { recent, visit };
}

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  wallets: "Wallets",
  accounts: "Accounts",
  transactions: "Transactions",
  approvals: "Approvals",
  reconciliation: "Reconciliation",
  insights: "Executive Insights",
  platform: "Platform Health",
  operations: "Operations",
  ledger: "Ledger",
  "audit-logs": "Audit Logs",
  policies: "Policies",
  risk: "Risk Center",
  governance: "Governance",
  "automation-studio": "Automation Studio",
  connectors: "Connectors",
  notifications: "Notifications",
  settings: "Settings",
};

function hrefToLabel(href: string): string {
  const segs = href.split("/").filter(Boolean);
  const key = segs[0] ?? "";
  return LABEL_MAP[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

interface SidebarRecentPagesProps {
  recent: { href: string; label: string; timestamp: number }[];
}

export function SidebarRecentPages({ recent }: SidebarRecentPagesProps) {
  const pathname = usePathname();

  if (recent.length === 0) return null;

  return (
    <div className="space-y-1 px-4 py-3">
      <div className="flex items-center gap-1.5 px-4 py-1.5">
        <History className="h-3 w-3 text-zinc-500" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Recent</span>
      </div>
      {recent.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150",
              active
                ? "bg-white/[0.06] text-white"
                : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300",
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
