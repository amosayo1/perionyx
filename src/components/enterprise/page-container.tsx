"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageTransition } from "./motion/page-transition";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "full" | "narrow";
}

const SIZE_MAP: Record<string, string> = {
  default: "max-w-7xl",
  full: "max-w-full",
  narrow: "max-w-5xl",
};

export function PageContainer({ children, className, size = "default" }: PageContainerProps) {
  return (
    <PageTransition>
      <div className={cn("mx-auto space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8", SIZE_MAP[size], className)}>
        {children}
      </div>
    </PageTransition>
  );
}
