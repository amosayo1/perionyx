"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, scaleInDown } from "@/components/enterprise/motion/tokens";
import type { ProductGuidanceData, UserGuidanceProgressData } from "@/modules/enterprise-experience/types";
import { HelpCircle, Play, CheckCircle2 } from "lucide-react";

interface GuidanceTourTriggerProps {
  availableTours: ProductGuidanceData[];
  userProgress: Record<string, UserGuidanceProgressData>;
  onStart: (slug: string) => void;
}

export function GuidanceTourTrigger({ availableTours, userProgress, onStart }: GuidanceTourTriggerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const incompleteTours = availableTours.filter((t) => !userProgress[t.slug]?.isCompleted);
  const completedTours = availableTours.filter((t) => userProgress[t.slug]?.isCompleted);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Available tours"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <HelpCircle className="h-4.5 w-4.5" />
        {incompleteTours.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
            {incompleteTours.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={scaleInDown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/[0.06] bg-zinc-900 p-2 shadow-2xl"
          >
            {incompleteTours.length === 0 && completedTours.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-zinc-500">No tours available</p>
            ) : (
              <>
                {incompleteTours.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Available ({incompleteTours.length})
                    </p>
                    {incompleteTours.map((tour) => {
                      const prog = userProgress[tour.slug];
                      const pct = prog ? Math.round((prog.stepIndex / tour.steps.length) * 100) : 0;
                      return (
                        <button
                          key={tour.id}
                          onClick={() => { onStart(tour.slug); setOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{tour.title}</p>
                            <p className="text-xs text-zinc-500">{tour.steps.length} steps</p>
                          </div>
                          {prog && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-zinc-500">{pct}%</span>
                            </div>
                          )}
                          <Play className="h-4 w-4 flex-shrink-0 text-amber-400" />
                        </button>
                      );
                    })}
                  </div>
                )}
                {completedTours.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Completed ({completedTours.length})
                    </p>
                    {completedTours.map((tour) => (
                      <div
                        key={tour.id}
                        className="flex items-center gap-3 rounded-lg px-2 py-2"
                      >
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-400 line-through">{tour.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
