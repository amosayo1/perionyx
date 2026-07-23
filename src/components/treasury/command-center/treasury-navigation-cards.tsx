"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Droplets,
  CreditCard,
  Building2,
  LineChart,
  TrendingDown,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { MOCK_NAVIGATION_CARDS } from "./data";
import type { NavigationCard } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign,
  Droplets,
  CreditCard,
  Building2,
  LineChart,
  TrendingDown,
  FileText,
  Settings,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function TreasuryNavigationCards({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <section aria-label="Treasury module navigation" className={cn("", className)}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {MOCK_NAVIGATION_CARDS.map((card) => (
          <NavigationCardItem key={card.id} card={card} router={router} />
        ))}
      </motion.div>
    </section>
  );
}

function NavigationCardItem({ card, router }: { card: NavigationCard; router: ReturnType<typeof useRouter> }) {
  const Icon = ICON_MAP[card.icon];
  const isActive = card.status === "active";

  return (
    <motion.div
      variants={item}
      role="article"
      aria-label={`${card.title}${!isActive ? " (coming soon)" : ""}`}
      tabIndex={isActive ? 0 : undefined}
      onKeyDown={
        isActive
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(card.route);
              }
            }
          : undefined
      }
      onClick={isActive ? () => router.push(card.route) : undefined}
      className={cn(
        "relative cursor-default rounded-xl border bg-zinc-900/50 p-5 transition-all duration-200",
        isActive
          ? "border-white/[0.06] hover:border-zinc-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
          : "border-white/[0.04] opacity-55",
      )}
    >
      {!isActive && (
        <span className="absolute right-3 top-3 rounded-full border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          Coming Soon
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isActive ? "bg-amber-500/10" : "bg-zinc-800/50",
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-amber-400" : "text-zinc-500",
              )}
              aria-hidden="true"
            />
          )}
        </div>
        <div>
          <h3 className={cn("text-sm font-semibold", isActive ? "text-white" : "text-zinc-400")}>
            {card.title}
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
            {card.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-3">
        {card.metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-[11px] text-zinc-500">{m.label}</p>
            <p className={cn(
              "mt-0.5 text-xs font-semibold",
              isActive ? "text-white" : "text-zinc-400",
            )}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
