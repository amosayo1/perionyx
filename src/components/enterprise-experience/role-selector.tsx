"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { scaleInDown } from "@/components/enterprise/motion/tokens";
import type { RoleType } from "@/modules/enterprise-experience/types";
import { ChevronDown, TrendingUp, CheckCircle2, Users, FileText, Shield, Eye, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const roleIcons: Record<RoleType, LucideIcon> = {
  cfo: TrendingUp,
  controller: CheckCircle2,
  treasurer: Users,
  "finance-manager": FileText,
  ap: FileText,
  ar: FileText,
  auditor: Eye,
  administrator: Settings,
};

const roleLabels: Record<RoleType, string> = {
  cfo: "CFO",
  controller: "Controller",
  treasurer: "Treasurer",
  "finance-manager": "Finance Manager",
  ap: "AP",
  ar: "AR",
  auditor: "Auditor",
  administrator: "Administrator",
};

interface RoleSelectorProps {
  currentRole: RoleType;
  onSelect: (role: RoleType) => void;
  roles?: Array<{ role: RoleType; label: string }>;
}

export function RoleSelector({ currentRole, onSelect, roles }: RoleSelectorProps) {
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

  const roleOptions = roles ?? Object.entries(roleLabels).map(([r, l]) => ({
    role: r as RoleType,
    label: l,
  }));

  const CurrentIcon = roleIcons[currentRole] ?? Users;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <CurrentIcon className="h-4 w-4 text-amber-400" />
        <span>{roleLabels[currentRole]}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={scaleInDown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-white/[0.06] bg-zinc-900 p-1.5 shadow-2xl"
          >
            {roleOptions.map(({ role, label }) => {
              const Icon = roleIcons[role] ?? Users;
              const isActive = role === currentRole;
              return (
                <button
                  key={role}
                  onClick={() => { onSelect(role); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-amber-400/10 text-amber-400"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
