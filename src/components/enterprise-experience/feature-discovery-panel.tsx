"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, expandCollapse } from "@/components/enterprise/motion/tokens";
import type { FeatureFlagData, FeatureCategory } from "@/modules/enterprise-experience/types";
import { ChevronDown, ChevronRight, Lock, ToggleLeft, ToggleRight, FlaskConical } from "lucide-react";

const categoryConfig: Record<FeatureCategory, { label: string; color: string; icon: string }> = {
  onboarding: { label: "Onboarding", color: "border-blue-500/20 bg-blue-500/10 text-blue-400", icon: "🚀" },
  advanced: { label: "Advanced", color: "border-purple-500/20 bg-purple-500/10 text-purple-400", icon: "⚡" },
  expert: { label: "Expert", color: "border-amber-500/20 bg-amber-500/10 text-amber-400", icon: "🎯" },
  beta: { label: "Beta", color: "border-rose-500/20 bg-rose-500/10 text-rose-400", icon: "🧪" },
};

interface FeatureCardProps {
  feature: FeatureFlagData;
  userRole: string;
  onToggle: (slug: string, enabled: boolean) => void;
}

function FeatureCard({ feature, userRole, onToggle }: FeatureCardProps) {
  const locked = feature.requiredRole !== undefined && feature.requiredRole !== userRole;

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-zinc-900/40 p-3",
        locked ? "border-zinc-800 opacity-60" : "border-white/[0.06]",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{feature.name}</p>
          {feature.isBeta && (
            <span className="flex items-center gap-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              <FlaskConical className="h-2.5 w-2.5" />
              Beta
            </span>
          )}
          <span className={cn("rounded-full px-2 py-0.5 text-[10px]", categoryConfig[feature.category].color)}>
            {feature.category}
          </span>
        </div>
        {feature.description && (
          <p className="mt-0.5 text-xs text-zinc-500">{feature.description}</p>
        )}
        {locked && (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
            <Lock className="h-3 w-3" />
            Requires {feature.requiredRole} role
          </p>
        )}
      </div>
      {locked ? (
        <Lock className="mt-1 h-5 w-5 text-zinc-600" />
      ) : (
        <button
          onClick={() => onToggle(feature.slug, !feature.isEnabled)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            feature.isEnabled
              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700",
          )}
        >
          {feature.isEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {feature.isEnabled ? "On" : "Off"}
        </button>
      )}
    </motion.div>
  );
}

interface FeatureDiscoveryPanelProps {
  features: FeatureFlagData[];
  userRole: string;
  onToggle: (slug: string, enabled: boolean) => void;
}

export function FeatureDiscoveryPanel({ features, userRole, onToggle }: FeatureDiscoveryPanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    return features.reduce<Record<FeatureCategory, FeatureFlagData[]>>((acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    }, {} as Record<FeatureCategory, FeatureFlagData[]>);
  }, [features]);

  const toggleCollapse = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const items = Object.entries(grouped) as [FeatureCategory, FeatureFlagData[]][];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <h2 className="mb-1 text-lg font-semibold text-white">Feature Discovery</h2>
      <p className="mb-4 text-sm text-zinc-500">Explore and enable features for your workspace</p>

      <div className="space-y-3">
        {items.map(([category, catFeatures]) => {
          const cfg = categoryConfig[category];
          const isCollapsed = collapsed[category] ?? false;
          return (
            <div key={category} className="rounded-lg border border-white/[0.06] bg-zinc-900/30">
              <button
                onClick={() => toggleCollapse(category)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                <span className="text-sm font-medium text-white">{cfg.label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px]", cfg.color)}>
                  {catFeatures.length}
                </span>
                <span className="flex-1 text-right text-xs text-zinc-500">
                  {catFeatures.filter((f) => f.isEnabled).length} enabled
                </span>
              </button>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    variants={expandCollapse}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                  >
                    <div className="space-y-1.5 border-t border-white/[0.06] px-3 pb-3 pt-2">
                      {catFeatures.map((feature) => (
                        <FeatureCard
                          key={feature.id}
                          feature={feature}
                          userRole={userRole}
                          onToggle={onToggle}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
