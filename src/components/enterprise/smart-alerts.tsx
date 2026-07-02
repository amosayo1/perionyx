"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, Ban, Zap, ShieldAlert, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SmartAlertData {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  category: string;
  action: { label: string; href: string } | null;
  timestamp: string;
}

const alertIcons: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4 text-red-400" />,
  warning: <TrendingDown className="h-4 w-4 text-amber-400" />,
  info: <Zap className="h-4 w-4 text-[#d4af37]" />,
};

const severityBg: Record<string, string> = {
  critical: "bg-red-500/5 border-red-500/15",
  warning: "bg-amber-500/5 border-amber-500/15",
  info: "bg-[#d4af37]/5 border-[#d4af37]/15",
};

export function SmartAlerts({ alerts: initialAlerts }: { alerts: SmartAlertData[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = initialAlerts.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-[#d4af37]" />
        <span className="text-xs font-semibold text-white">Smart Alerts</span>
      </div>
      <AnimatePresence>
        {visible.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={cn("rounded-xl border p-3", severityBg[alert.severity])}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">{alertIcons[alert.severity]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-white">{alert.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{alert.description}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
                    className="shrink-0 rounded p-0.5 text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-zinc-600 uppercase">{alert.category}</span>
                  <span className="text-[10px] text-zinc-700">{alert.timestamp}</span>
                  {alert.action && (
                    <Link
                      href={alert.action.href}
                      className="ml-auto inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-zinc-300 hover:bg-white/[0.1] hover:text-white transition-colors"
                    >
                      {alert.action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
