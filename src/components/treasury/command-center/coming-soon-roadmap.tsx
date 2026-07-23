"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, Zap, Database, FileCheck, Layers, Link, Clock } from "lucide-react";
import { MOCK_COMING_SOON_MODULES } from "./data";

const MODULE_ICONS: Record<string, React.ElementType> = {
  BrainCircuit, Zap, Database, FileCheck, Layers, Link,
};

export function ComingSoonRoadmap({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Coming soon roadmap">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Coming Soon</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MOCK_COMING_SOON_MODULES.map((mod, i) => {
          const Icon = MODULE_ICONS[mod.icon] || BrainCircuit;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-5 text-center"
              role="article" aria-label={`Coming soon: ${mod.title}`}
            >
              <div className="flex justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.06]">
                  <Icon className="h-6 w-6 text-zinc-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">{mod.description}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-3 py-1">
                <span className="text-[10px] font-medium text-[#c9a84c]">ETA</span>
                <span className="text-[10px] font-semibold text-[#c9a84c]">{mod.eta}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
