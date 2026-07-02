"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Monitor, AlertTriangle, BarChart3, Landmark, BookOpen, ScrollText, Shield, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Platform overview" },
  { href: "/operations", label: "Operations", icon: Monitor, desc: "Mission control" },
  { href: "/operations/incidents", label: "Incidents", icon: AlertTriangle, desc: "Incident management" },
  { href: "/insights", label: "Executive Insights", icon: BarChart3, desc: "Strategic intelligence" },
  { href: "/treasury", label: "Treasury", icon: Landmark, desc: "Liquidity and accounts" },
  { href: "/ledger", label: "Ledger", icon: BookOpen, desc: "Journal entries" },
  { href: "/audit-logs", label: "Audit", icon: ScrollText, desc: "Event trail" },
  { href: "/risk", label: "Risk", icon: Shield, desc: "Risk assessment" },
  { href: "/settings", label: "Settings", icon: Settings, desc: "Configuration" },
];

export function QuickNavigation() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Quick Navigation</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Jump to related platform modules</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {links.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.025, duration: 0.25 }}
          >
            <Link
              href={link.href}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                <link.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{link.label}</p>
                <p className="text-[10px] text-zinc-600">{link.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
