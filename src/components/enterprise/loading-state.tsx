"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  inline?: boolean;
  className?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: "min-h-[80px] p-4",
  md: "min-h-[140px] p-6",
  lg: "min-h-[240px] p-8",
};

export function LoadingState({ message = "Loading data...", size = "md", inline, className }: LoadingStateProps) {
  const content = (
    <div className={cn(
      "flex items-center justify-center gap-3 rounded-[24px] border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel text-perionyx-text-muted",
      SIZE_MAP[size],
      className,
    )}>
      <span className="inline-flex h-3.5 w-3.5 animate-pulse rounded-full bg-perionyx-gold" />
      <span className="text-sm">{message}</span>
    </div>
  );

  if (inline) return content;
  return <div className="w-full">{content}</div>;
}
