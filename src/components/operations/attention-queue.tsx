"use client";

import { useMemo } from "react";
import { attentionItems } from "./data";
import { AttentionItem } from "./attention-item";
import { SectionHeader } from "./section-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const severityWeight: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function AttentionQueue() {
  const sorted = useMemo(
    () =>
      [...attentionItems].sort(
        (a, b) => severityWeight[a.severity] - severityWeight[b.severity],
      ),
    [],
  );

  const criticalCount = sorted.filter((i) => i.severity === "critical").length;

  return (
    <div className="space-y-3">
      <SectionHeader
        title={
          <div className="flex items-center gap-2">
            <span>Requires Attention</span>
            {criticalCount > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  "bg-red-500/20 text-red-400",
                )}
              >
                {criticalCount}
              </span>
            )}
          </div>
        }
        description="Prioritized operational issues sorted by severity"
        action={
          <Button asChild variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-white">
            <Link href="/approvals">View All</Link>
          </Button>
        }
      />

      <div className="space-y-2">
        {sorted.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <AttentionItem item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
