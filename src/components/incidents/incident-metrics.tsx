"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { incidents } from "./data";
import { useMemo } from "react";
import { AlertTriangle, Activity, Clock, CheckCircle2, Timer } from "lucide-react";

export function IncidentMetrics() {
  const metrics = useMemo(() => {
    const critical = incidents.filter((i) => i.severity === "critical").length;
    const open = incidents.filter(
      (i) => i.status === "open" || i.status === "investigating" || i.status === "awaiting_info" || i.status === "fix_in_progress",
    ).length;
    const breached = incidents.filter((i) => {
      if (i.slaResolvedAt) return false;
      return new Date(i.slaResponseDeadline).getTime() < Date.now();
    }).length;
    const resolved = incidents.filter(
      (i) => i.status === "resolved" || i.status === "closed",
    ).length;
    return { critical, open, breached, resolved };
  }, []);

  const cards = [
    {
      id: "critical",
      label: "Critical Incidents",
      value: metrics.critical,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      href: "/operations/incidents?severity=critical",
    },
    {
      id: "open",
      label: "Open Incidents",
      value: metrics.open,
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      href: "/operations/incidents?status=open",
    },
    {
      id: "breached",
      label: "Breached SLAs",
      value: metrics.breached,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      href: "/operations/incidents?status=open",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: metrics.resolved,
      icon: CheckCircle2,
      color: "text-[#d4af37]",
      bg: "bg-[#d4af37]/10",
      href: "/operations/incidents?status=resolved",
    },
    {
      id: "avg-time",
      label: "Avg Resolution",
      value: "4.2h",
      icon: Timer,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/operations/incidents",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={card.href}
              className="group block rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all duration-200 hover:bg-zinc-900/60 hover:border-white/[0.1]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", card.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", card.color)} />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">{card.label}</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">
                {card.value}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
