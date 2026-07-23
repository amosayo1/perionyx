"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  spacing?: "default" | "compact" | "tight";
  animate?: boolean;
}

const spacingClasses = {
  default: "space-y-5",
  compact: "space-y-3",
  tight: "space-y-2",
};

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  spacing = "default",
  animate = true,
}: DashboardSectionProps) {
  const content = (
    <>
      <div className={cn("flex items-start justify-between gap-4", spacing === "default" ? "mb-5" : spacing === "compact" ? "mb-3" : "mb-2")}>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-[24px] text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] leading-[20px] text-zinc-500">{description}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
      <div className={cn(spacingClasses[spacing])}>
        {children}
      </div>
    </>
  );

  if (!animate) return <section className={className}>{content}</section>;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {content}
    </motion.section>
  );
}
