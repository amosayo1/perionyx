"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "./motion/tokens";

interface EnterprisePageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function EnterprisePageHeader({ title, description, actions, className }: EnterprisePageHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn("flex items-center justify-between", className)}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
