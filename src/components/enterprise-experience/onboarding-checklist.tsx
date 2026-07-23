"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import { CheckCircle2, Circle } from "lucide-react";

interface OnboardingChecklistProps {
  milestones: Array<{ slug: string; name: string; category: string; completed: boolean }>;
  percentComplete: number;
}

export function OnboardingChecklist({ milestones, percentComplete }: OnboardingChecklistProps) {
  const grouped = milestones.reduce<Record<string, typeof milestones>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Onboarding Progress</h2>
          <span className="text-sm font-medium text-amber-400">{Math.round(percentComplete)}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {category.replace("-", " ")}
            </p>
            <div className="space-y-1">
              {items.map((m) => (
                <motion.div
                  key={m.slug}
                  variants={fadeInUp}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.02]"
                >
                  <motion.div
                    initial={false}
                    animate={m.completed ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600" />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-sm",
                    m.completed ? "text-zinc-500 line-through" : "text-zinc-300",
                  )}>
                    {m.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
