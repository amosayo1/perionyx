"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  "command-center": "Command Center",
  wallets: "Wallets",
  accounts: "Accounts",
  transactions: "Transactions",
  approvals: "Approvals",
  reconciliation: "Reconciliation",
  insights: "Insights",
  platform: "Platform Health",
  operations: "Operations",
  notifications: "Notifications",
  ledger: "Ledger",
  "audit-logs": "Audit Logs",
  investigation: "Investigation",
  policies: "Policies",
  risk: "Risk Center",
  "risk-intelligence": "Risk Intelligence",
  governance: "Governance",
  "automation-studio": "Automation Studio",
  connectors: "Connectors",
  integrations: "Integrations",
  developer: "Developer Portal",
  reports: "Reports",
  copilot: "Copilot",
  calendar: "Calendar",
  settings: "Settings",
  admin: "Admin",
  onboarding: "Onboarding",
  setup: "Setup",
};

function segmentToLabel(segment: string): string {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];
  return segment
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];

  const crumbs: BreadcrumbItem[] = items ?? segments.map((_, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentToLabel(segments[i]);
    return { label, href };
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-xs", className)}>
      {showHome && (
        <Link href="/dashboard" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Home className="h-3.5 w-3.5" />
        </Link>
      )}
      {showHome && <ChevronRight className="h-3 w-3 text-zinc-600" />}
      <AnimatePresence mode="popLayout">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <motion.span
              key={crumb.label ?? i}
              layout
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15, delay: i * 0.03 }}
              className="flex items-center gap-1"
            >
              {isLast ? (
                <span className="text-zinc-300 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.href ?? "#"}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight className="h-3 w-3 text-zinc-600" />
                </>
              )}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}
