"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Inbox, SearchX, AlertCircle, FileText, Plus } from "lucide-react";
import { EnterpriseButton } from "../buttons";

const emptyVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const icons = {
  default: <Inbox className="text-zinc-600" />,
  search: <SearchX className="text-zinc-600" />,
  error: <AlertCircle className="text-zinc-600" />,
  documents: <FileText className="text-zinc-600" />,
  create: <Plus className="text-zinc-600" />,
};

const sizeMap = {
  sm: { icon: "h-8 w-8", title: "text-[13px]", desc: "text-[11px]", gap: "gap-2", py: "py-6" },
  md: { icon: "h-10 w-10", title: "text-[15px]", desc: "text-[12px]", gap: "gap-3", py: "py-10" },
  lg: { icon: "h-12 w-12", title: "text-[17px]", desc: "text-[13px]", gap: "gap-4", py: "py-16" },
};

export function EmptyState({ icon, title, description, action, size = "md", className }: EmptyStateProps) {
  const s = sizeMap[size];
  return (
    <motion.div
      variants={emptyVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col items-center justify-center text-center", s.gap, s.py, className)}
    >
      <div className={cn("flex items-center justify-center opacity-40", s.icon)}>
        {icon ?? icons.default}
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className={cn("font-semibold text-zinc-300", s.title)}>{title}</h3>
        {description && <p className={cn("text-zinc-500", s.desc)}>{description}</p>}
      </div>
      {action && (
        <EnterpriseButton
          variant={action.variant ?? "primary"}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </EnterpriseButton>
      )}
    </motion.div>
  );
}
