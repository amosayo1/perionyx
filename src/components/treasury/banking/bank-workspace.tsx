"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Globe, Landmark, Cable, PiggyBank, BarChart3, Activity, Handshake } from "lucide-react";

const TABS = [
  { href: "/treasury/banking", label: "Dashboard", icon: Globe, exact: true },
  { href: "/treasury/banking/banks", label: "Banks", icon: Building2 },
  { href: "/treasury/banking/accounts", label: "Accounts", icon: Landmark },
  { href: "/treasury/banking/providers", label: "Providers", icon: Activity },
  { href: "/treasury/banking/relationships", label: "Relationships", icon: Handshake },
  { href: "/treasury/banking/connections", label: "Connections", icon: Cable },
  { href: "/treasury/banking/cash", label: "Cash", icon: PiggyBank },
  { href: "/treasury/banking/liquidity", label: "Liquidity", icon: BarChart3 },
  { href: "/treasury/banking/analytics", label: "Analytics", icon: BarChart3 },
];

export function BankWorkspace({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("mx-auto max-w-7xl space-y-6", className)}>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06] pb-0">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors",
                active
                  ? "border-gold text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}