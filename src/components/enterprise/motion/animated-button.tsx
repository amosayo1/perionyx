"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { hoverScale, tapScale } from "./tokens";
import { useMotion } from "./provider";
import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  status?: "idle" | "loading" | "success" | "error";
  statusDuration?: number;
}

const variantStyles: Record<string, string> = {
  primary: "bg-gold text-black hover:bg-[#c7a961]",
  secondary: "border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]",
  ghost: "text-zinc-400 hover:text-white hover:bg-white/[0.04]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "loading": return <Loader2 className="h-4 w-4 animate-spin" />;
    case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "error": return <AlertCircle className="h-4 w-4 text-red-400" />;
    default: return null;
  }
}

export function AnimatedButton({
  children, className, variant = "primary", status = "idle", disabled, ...props
}: AnimatedButtonProps) {
  const { enabled } = useMotion();

  const btn = (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        className,
      )}
      disabled={disabled || status === "loading"}
      {...props}
    >
      {children}
      <StatusIcon status={status} />
    </button>
  );

  if (!enabled) return btn;

  return (
    <motion.div
      whileHover={!disabled ? hoverScale : undefined}
      whileTap={!disabled ? tapScale : undefined}
      className="inline-flex"
    >
      {btn}
    </motion.div>
  );
}
