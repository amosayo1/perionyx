"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, AlertTriangle, Shield, Info, CheckCircle } from "lucide-react";
import type { HealthAlertData } from "@/modules/intelligence-platform/types";

interface HealthAlertBannerProps {
  alerts: HealthAlertData[];
  onResolve: (id: string) => void;
}

const SEVERITY_CONFIG: Record<string, { border: string; bg: string; icon: typeof AlertTriangle; text: string }> = {
  critical: { border: "border-l-red-500", bg: "bg-red-500/[0.03]", icon: AlertTriangle, text: "text-red-400" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-500/[0.03]", icon: Shield, text: "text-amber-400" },
  normal: { border: "border-l-blue-500", bg: "bg-blue-500/[0.03]", icon: Info, text: "text-blue-400" },
  good: { border: "border-l-emerald-500", bg: "bg-emerald-500/[0.03]", icon: CheckCircle, text: "text-emerald-400" },
};

export function HealthAlertBanner({ alerts, onResolve }: HealthAlertBannerProps) {
  const active = alerts.filter((a) => !a.isResolved);

  if (active.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] px-4 py-3">
        <CheckCircle className="h-4 w-4 text-emerald-400" />
        <p className="text-xs font-medium text-emerald-400">All systems clear — no active alerts</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <AnimatePresence>
        {active.map((alert) => {
          const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.normal;
          const Icon = sev.icon;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg border border-white/[0.06] border-l-4 px-4 py-3",
                sev.border, sev.bg,
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", sev.text)} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white whitespace-nowrap">{alert.title}</p>
                {alert.message && (
                  <p className="mt-0.5 text-[11px] text-zinc-400 whitespace-nowrap">{alert.message}</p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onResolve(alert.id)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 transition-colors"
              >
                <X className="h-3 w-3" />
                Resolve
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
