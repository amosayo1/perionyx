"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[#d4a800] text-black hover:bg-[#c49a00] active:bg-[#b48a00] shadow-lg shadow-gold-500/15 font-semibold",
  secondary: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/50",
  ghost: "bg-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
  outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:bg-zinc-800/40 hover:text-white",
  danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-lg shadow-red-500/15 font-semibold",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-500/15 font-semibold",
  warning: "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 shadow-lg shadow-amber-500/15 font-semibold",
  executive: "bg-gradient-to-r from-[#d4a800] to-[#c49a00] text-black hover:from-[#c49a00] hover:to-[#b48a00] shadow-lg shadow-gold-500/20 font-bold tracking-wide",
  ai: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/15 font-semibold",
  toolbar: "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800 rounded-md",
};

const sizes = {
  xs: "px-2 py-1 text-[11px] gap-1",
  sm: "px-2.5 py-1.5 text-[12px] gap-1.5",
  md: "px-3.5 py-2 text-[13px] gap-2",
  lg: "px-5 py-2.5 text-[14px] gap-2",
  xl: "px-6 py-3 text-[15px] gap-2.5",
};

export interface EnterpriseButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export const EnterpriseButton = forwardRef<HTMLButtonElement, EnterpriseButtonProps>(
  function EnterpriseButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      disabled,
      children,
      onClick,
      type = "button",
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-[#d4a800]/40 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        aria-label={ariaLabel}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span className="truncate">{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  },
);

export function ToolbarButton({ active, ...props }: EnterpriseButtonProps & { active?: boolean }) {
  return (
    <EnterpriseButton
      variant="toolbar"
      size="sm"
      className={cn(active && "bg-zinc-700 text-zinc-200")}
      {...props}
    />
  );
}

export function IconButton({ size = "md", ...props }: EnterpriseButtonProps) {
  return (
    <EnterpriseButton
      variant="ghost"
      size={size}
      className={cn("p-0 aspect-square")}
      {...props}
    />
  );
}
