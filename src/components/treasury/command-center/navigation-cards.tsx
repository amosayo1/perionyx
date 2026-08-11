"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Droplets, ArrowUpDown, Shield, Landmark, TrendingUp } from "lucide-react";
import { MOCK_NAVIGATION_CARDS } from "./data";

const CARD_ICONS: Record<string, React.ElementType> = {
  DollarSign, Droplets, ArrowUpDown, Shield, Landmark, TrendingUp,
};

export function NavigationCards({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Navigation cards">
      <h2 className="text-sm font-semibold text-white">Quick Access</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MOCK_NAVIGATION_CARDS.map((card, i) => {
          const Icon = CARD_ICONS[card.icon] || DollarSign;
          const isComing = card.status === "coming_soon";
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={cn(
                "rounded-lg border p-5 flex flex-col hover:border-zinc-600 transition-colors",
                isComing ? "border-white/[0.04] bg-zinc-900/30" : "border-white/[0.06] bg-zinc-900/50",
              )}
              role="article" aria-label={card.title}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                  <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                {isComing && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500 border border-white/[0.06]">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed flex-1">{card.description}</p>
              <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                {card.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">{m.label}</span>
                    <span className="text-[12px] font-medium text-white">{m.value}</span>
                  </div>
                ))}
              </div>
              {!isComing && (
                <Link href={card.route} className="mt-3 flex items-center gap-1 text-[11px] font-medium text-gold hover:text-gold/80 transition-colors" aria-label={`Open ${card.title}`}>
                  Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
