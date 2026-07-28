"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Sparkles,
  UserCircle,
} from "lucide-react";

export type MobileTabId = "dashboard" | "timeline" | "approvals" | "ai" | "profile";

export interface MobileTab {
  id: MobileTabId;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const TABS: MobileTab[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/mobile" },
  { id: "timeline", label: "Timeline", icon: <Clock className="h-5 w-5" />, href: "/mobile/timeline" },
  { id: "approvals", label: "Approvals", icon: <CheckCircle2 className="h-5 w-5" />, href: "/mobile/approvals" },
  { id: "ai", label: "AI Brief", icon: <Sparkles className="h-5 w-5" />, href: "/mobile/ai" },
  { id: "profile", label: "Profile", icon: <UserCircle className="h-5 w-5" />, href: "/mobile/profile" },
];

export function MobileNavigationBar({
  tabs = TABS,
  badgeCounts,
  className,
}: {
  tabs?: MobileTab[];
  badgeCounts?: Partial<Record<MobileTabId, number>>;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (href: string) => {
      if (href === "/mobile") return pathname === "/mobile" || pathname === "/mobile-dashboard";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around border-t border-white/[0.06] bg-zinc-950/98 px-1",
        "pb-[env(safe-area-inset-bottom,0px)] pt-1.5",
        "backdrop-blur-2xl",
        "md:hidden",
        className,
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const badge = badgeCounts?.[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={cn(
              "relative flex flex-col items-center gap-0.5",
              "min-w-[56px] min-h-[44px]",
              "rounded-xl px-3 py-1.5",
              "transition-colors duration-150",
              active
                ? "text-gold"
                : "text-zinc-500 active:text-zinc-300",
            )}
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute -top-1.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gold"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <div className="relative">
              {tab.icon}
              {badge !== undefined && badge > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold leading-none text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </div>
            <span className={cn("text-[9px] font-semibold uppercase tracking-[0.08em]", active ? "text-gold" : "text-zinc-500")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
