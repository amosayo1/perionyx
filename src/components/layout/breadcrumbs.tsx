"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const LABEL_OVERRIDES: Record<string, string> = {
  "": "Home",
  dashboard: "Dashboard",
  "command-center": "Command Center",
  wallets: "Wallets",
  accounts: "Accounts",
  transactions: "Transactions",
  approvals: "Approvals",
  reconciliation: "Reconciliation",
  insights: "Executive Insights",
  platform: "Platform Health",
  operations: "Operations",
  incidents: "Incidents",
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
  "api-keys": "API Keys",
  webhooks: "Webhooks",
  onboarding: "Onboarding",
  admin: "Admin",
  users: "Users",
  roles: "Roles",
  approvers: "Approvers",
  "ai-providers": "AI Providers",
  identity: "Enterprise Identity",
  analytics: "Analytics",
  rules: "Rules",
  rates: "Exchange Rates",
  fx: "FX Sync",
  queue: "Queue",
  deliveries: "Deliveries",
  "settlements": "Settlements",
  audits: "Audits",
  alerts: "Alerts",
  "approval-matrix": "Approval Matrix",
  "business-rules": "Business Rules",
  scheduler: "Scheduler",
  templates: "Templates",
  designer: "Designer",
  monitoring: "Monitoring",
  setup: "Setup",
};

interface BreadcrumbsProps {
  className?: string;
  homeLabel?: string;
  maxItems?: number;
}

export function Breadcrumbs({ className, homeLabel = "Home", maxItems = 6 }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const items = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABEL_OVERRIDES[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label, isLast: i === segments.length - 1 };
  });

  const truncated = items.length > maxItems ? items.slice(-maxItems) : items;
  const hasMore = items.length > maxItems;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-xs", className)}>
      <Link href="/dashboard" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      <ChevronRight className="h-3 w-3 text-zinc-700" />
      {hasMore && (
        <>
          <span className="text-zinc-600">...</span>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
        </>
      )}
      {truncated.map((item) => (
        <span key={item.href} className="flex items-center gap-1">
          {item.isLast ? (
            <span className="text-zinc-300 font-medium truncate max-w-[180px]" title={item.label}>{item.label}</span>
          ) : (
            <Link href={item.href} className="text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[140px]" title={item.label}>
              {item.label}
            </Link>
          )}
          {!item.isLast && <ChevronRight className="h-3 w-3 text-zinc-700" />}
        </span>
      ))}
    </nav>
  );
}
