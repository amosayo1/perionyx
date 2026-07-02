"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Monitor,
  AlertTriangle,
  Landmark,
  ArrowLeftRight,
  CheckSquare,
  BookOpen,
  ScrollText,
  Shield,
  RefreshCw,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Platform overview and metrics" },
  { href: "/operations", label: "Operations", icon: Monitor, desc: "Mission control and queues" },
  { href: "/operations/incidents", label: "Incidents", icon: AlertTriangle, desc: "Incident management" },
  { href: "/treasury", label: "Treasury", icon: Landmark, desc: "Liquidity and accounts" },
  { href: "/transactions", label: "Payments", icon: ArrowLeftRight, desc: "Transaction management" },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, desc: "Approval workflows" },
  { href: "/ledger", label: "Ledger", icon: BookOpen, desc: "Journal entries and postings" },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, desc: "Event trail and history" },
  { href: "/risk", label: "Risk", icon: Shield, desc: "Risk assessment and alerts" },
  { href: "/reconciliation", label: "Reconciliation", icon: RefreshCw, desc: "Match and reconcile" },
];

export function QuickNavigation() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Quick Navigation</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Jump to any module in the platform
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {links.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.025, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={link.href}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all duration-200 hover:bg-zinc-900/60 hover:border-white/[0.1]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                <link.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {link.label}
                </p>
                <p className="text-[10px] text-zinc-600 leading-tight">{link.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
