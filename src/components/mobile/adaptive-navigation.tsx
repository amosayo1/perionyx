"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, CheckCircle2, Wallet, Bell, BarChart3, Shield, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
}

const primaryNav: NavItem[] = [
  { label: "Executive Dashboard", href: "/mobile-dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Approvals", href: "/approvals", icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: "Treasury", href: "/wallets", icon: <Wallet className="h-4 w-4" /> },
  { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "Insights", href: "/insights", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Risk", href: "/risk", icon: <Shield className="h-4 w-4" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

interface AdaptiveNavigationProps {
  badgeCounts?: Record<string, number>;
  className?: string;
}

export function AdaptiveNavigation({ badgeCounts, className }: AdaptiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "phone";

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  if (!isMobile) return null;

  return (
    <>
      <div className={cn("flex items-center justify-between px-4 py-3", className)}>
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-400 active:bg-zinc-800 active:text-zinc-200"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={close}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/[0.06] bg-zinc-950 pt-4"
            >
              <div className="flex items-center justify-between px-4 pb-4">
                <span className="text-sm font-semibold text-white">Navigation</span>
                <button
                  onClick={close}
                  className="rounded-lg p-2 text-zinc-500 active:bg-zinc-800 active:text-zinc-300"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1 px-2">
                {primaryNav.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const badge = badgeCounts?.[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-[#d4af37]/10 text-[#d4af37]"
                          : "text-zinc-400 active:bg-zinc-800 active:text-zinc-200",
                      )}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                      <ExternalLink className="h-3 w-3 text-zinc-700" />
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
