"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = [
  { href: "/system/operations", label: "Operations" },
  { href: "/system/performance", label: "Performance" },
  { href: "/system/status", label: "Status" },
  { href: "/system/deployment", label: "Deployment" },
];

export function SystemTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1" aria-label="System navigation">
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/system" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              active ? "text-[#d4a843]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
            )}
          >
            {active && (
              <motion.div
                layoutId="system-tab-indicator"
                className="absolute inset-0 rounded-lg bg-[#d4a843]/10 border border-[#d4a843]/20"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
