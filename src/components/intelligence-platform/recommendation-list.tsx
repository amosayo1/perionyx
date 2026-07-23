"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RecommendationCard } from "./recommendation-card";
import { CheckCheck, AlertCircle, Zap, Shield, CheckCircle, Inbox } from "lucide-react";
import type { IntelligenceRecommendationData } from "@/modules/intelligence-platform/types";

interface RecommendationListProps {
  recommendations: IntelligenceRecommendationData[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  filter?: string;
}

const PRIORITY_ORDER = ["critical", "high", "normal", "low"];

const PRIORITY_GROUP: Record<string, { label: string; icon: typeof AlertCircle; color: string }> = {
  critical: { label: "Critical", icon: AlertCircle, color: "text-red-400" },
  high: { label: "High", icon: Zap, color: "text-amber-400" },
  normal: { label: "Normal", icon: Shield, color: "text-blue-400" },
  low: { label: "Low", icon: CheckCircle, color: "text-zinc-400" },
};

export function RecommendationList({ recommendations, onAcknowledge, onDismiss, filter }: RecommendationListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const filtered = filter
      ? recommendations.filter((r) => r.category === filter || r.priority === filter || r.status === filter)
      : recommendations;
    const groups: Record<string, IntelligenceRecommendationData[]> = {};
    for (const r of filtered) {
      const key = r.priority;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return PRIORITY_ORDER.map((p) => ({ priority: p, items: groups[p] ?? [] })).filter((g) => g.items.length > 0);
  }, [recommendations, filter]);

  const activeItems = useMemo(() => recommendations.filter((r) => r.status === "active"), [recommendations]);

  const total = recommendations.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="mb-3 h-10 w-10 text-zinc-700" />
        <p className="text-sm font-medium text-zinc-500">No recommendations</p>
        <p className="mt-1 text-xs text-zinc-600">All financial intelligence checks are passing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeItems.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{activeItems.length} active recommendation{activeItems.length !== 1 ? "s" : ""}</p>
          {activeItems.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => activeItems.forEach((r) => onAcknowledge(r.id))}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Acknowledge All
            </motion.button>
          )}
        </div>
      )}

      {grouped.map(({ priority, items }) => {
        const groupInfo = PRIORITY_GROUP[priority];
        const GroupIcon = groupInfo.icon;
        const isExpanded = expanded[priority] ?? true;

        return (
          <div key={priority} className="space-y-2">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [priority]: !prev[priority] }))}
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <GroupIcon className={cn("h-3.5 w-3.5", groupInfo.color)} />
              <span className="capitalize">{groupInfo.label}</span>
              <span className="text-zinc-600">({items.length})</span>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {items.map((r) => (
                    <RecommendationCard
                      key={r.id}
                      recommendation={r}
                      onAcknowledge={onAcknowledge}
                      onDismiss={onDismiss}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
