"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Home, ChevronRight, MoreHorizontal } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  "": "Home",
  "dashboard": "Executive Overview",
  "command-center": "Command Center",
  "executive": "Executive Office",
  "cfo": "CFO Advisor",
  "morning-briefing": "Morning Briefing",
  "insights": "Executive Insights",
  "executive-ai": "Executive AI",
  "copilot": "Copilot",
  "accounting": "Financial Operations",
  "general-ledger": "General Ledger",
  "financial-close": "Financial Close",
  "reconciliation": "Reconciliation",
  "fixed-assets": "Fixed Assets",
  "consolidation": "Consolidation",
  "order-to-cash": "Order-to-Cash",
  "accounts-receivable": "Accounts Receivable",
  "procurement": "Procurement",
  "transactions": "Transactions",
  "ledger": "Ledger",
  "treasury": "Treasury",
  "investments": "Investments",
  "wallets": "Wallets",
  "accounts": "Accounts",
  "fpa": "Planning & Strategy",
  "tax": "Tax",
  "risk": "Risk Center",
  "audit": "Audit",
  "compliance": "Compliance",
  "governance": "Governance",
  "approvals": "Approvals",
  "intelligence": "Intelligence Platform",
  "agents": "Agents",
  "automation-studio": "Automation Studio",
  "orchestration": "Orchestration",
  "finance": "Finance Collaboration",
  "platform": "Platform Health",
  "settings": "Settings",
  "admin": "Administration",
  "connectors": "Connectors",
  "integrations": "Integrations",
  "developer": "Developer Portal",
  "system": "System",
  "notifications": "Notifications",
  "calendar": "Calendar",
  "operations": "Operations",
  "incidents": "Incidents",
  "audit-logs": "Audit Logs",
  "investigation": "Investigation",
  "policies": "Policies",
  "risk-intelligence": "Risk Intelligence",
  "reports": "Reports",
  "api-keys": "API Keys",
  "webhooks": "Webhooks",
  "onboarding": "Onboarding",
  "users": "Users",
  "roles": "Roles",
  "approvers": "Approvers",
  "ai-providers": "AI Providers",
  "identity": "Enterprise Identity",
  "analytics": "Analytics",
  "rules": "Rules",
  "rates": "Exchange Rates",
  "fx": "FX Exposure",
  "queue": "Queue",
  "deliveries": "Deliveries",
  "settlements": "Settlements",
  "audits": "Audits",
  "alerts": "Alerts",
  "approval-matrix": "Approval Matrix",
  "business-rules": "Business Rules",
  "scheduler": "Scheduler",
  "templates": "Templates",
  "designer": "Designer",
  "monitoring": "Monitoring",
  "setup": "Setup",
  "cash": "Cash Position",
  "liquidity": "Liquidity",
  "forecasts": "Forecasts",
  "debt": "Debt Management",
  "banking": "Banking",
  "payments": "Payments",
  "risks": "Risks",
  "budgets": "Budgets",
  "variance": "Variance",
  "capital": "Capital Planning",
  "drivers": "Drivers",
  "provisions": "Provisions",
  "planning": "Planning",
  "transfer-pricing": "Transfer Pricing",
  "controls": "Controls",
  "findings": "Findings",
  "readiness": "Readiness",
  "violations": "Violations",
  "obligations": "Obligations",
  "board": "Board",
  "meetings": "Meetings",
  "resolutions": "Resolutions",
  "registry": "Registry",
  "memory": "Memory",
  "company": "Company",
  "overview": "Overview",
  "briefing": "Briefing",
  "recommendations": "Recommendations",
  "scenarios": "Scenarios",
};

interface BreadcrumbBarProps {
  maxItems?: number;
  className?: string;
}

export const BreadcrumbBar = memo(function BreadcrumbBar({ maxItems = 4, className }: BreadcrumbBarProps) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const items: { href: string; label: string; isLast: boolean }[] = [
      { href: "/dashboard", label: "Home", isLast: segments.length === 0 },
    ];

    let accumulated = "";
    let skipIndex = -1;

    for (let i = 0; i < segments.length; i++) {
      accumulated += `/${segments[i]}`;
      const label = LABEL_MAP[segments[i]] ?? segments[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({ href: accumulated, label, isLast: i === segments.length - 1 });

      if (i === segments.length - 2 && items.length > maxItems) {
        skipIndex = 1;
      }
    }

    if (items.length > maxItems + 1 && skipIndex > 0) {
      const truncated = [items[0]];
      truncated.push({ href: "#", label: "...", isLast: false } as any);
      truncated.push(...items.slice(-maxItems + 1));
      return truncated;
    }

    return items;
  }, [pathname, maxItems]);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-[12px]", className)}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href + i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-600" />}
          {crumb.isLast ? (
            <span className="font-medium text-zinc-300" aria-current="page">
              {crumb.label === "..." ? <MoreHorizontal className="h-3 w-3" /> : crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href === "#" ? "#" : crumb.href}
              className={cn(
                "text-zinc-500 transition-colors hover:text-zinc-300",
                crumb.label === "..." && "cursor-default",
              )}
              tabIndex={crumb.label === "..." ? -1 : 0}
            >
              {crumb.label === "..." ? <MoreHorizontal className="h-3 w-3" /> : crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
});
