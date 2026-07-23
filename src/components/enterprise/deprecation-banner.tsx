"use client";

import { memo } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeprecationBannerProps {
  /** The route this page is deprecated in favor of */
  redirectTo: string;
  /** Label for the destination */
  redirectLabel: string;
  className?: string;
}

export const DeprecationBanner = memo(function DeprecationBanner({
  redirectTo,
  redirectLabel,
  className,
}: DeprecationBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <p className="flex-1 text-[12px] text-amber-200">
        This page is{" "}
        <span className="font-semibold text-amber-300">deprecated</span>{" "}
        and will be removed in a future release.
      </p>
      <Link
        href={redirectTo}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
      >
        {redirectLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
});
