"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WorkspaceData, WorkspaceSlug } from "@/modules/enterprise-experience/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const workspaceIcons: Record<string, string> = {
  treasury: "💰",
  "month-end": "📊",
  reporting: "📈",
  audit: "🔍",
  procurement: "📋",
  "cash-management": "💵",
  "financial-ops": "⚙️",
};

interface WorkspaceNavigationProps {
  workspaces: WorkspaceData[];
  activeSlug?: WorkspaceSlug;
  onSelect: (slug: WorkspaceSlug) => void;
}

export function WorkspaceNavigation({ workspaces, activeSlug, onSelect }: WorkspaceNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 shadow-lg hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {workspaces.map((ws) => {
          const isActive = ws.slug === activeSlug;
          return (
            <button
              key={ws.id}
              onClick={() => onSelect(ws.slug)}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-amber-400/15 text-amber-400"
                  : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="workspace-active"
                  className="absolute inset-0 rounded-full border border-amber-400/30"
                />
              )}
              <span>{workspaceIcons[ws.slug] ?? "📁"}</span>
              <span>{ws.name}</span>
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 shadow-lg hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
