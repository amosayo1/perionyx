import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCard({
  title,
  value,
  description,
  variant,
}: {
  title: string;
  value: ReactNode;
  description?: string;
  variant?: "default" | "muted";
}) {
  return (
    <Card className={`relative overflow-hidden border-[rgba(212,175,55,0.14)] ${variant === "muted" ? "bg-perionyx-bg-panel" : "bg-perionyx-bg-surface"}`}>
      {/* Cinematic gold accent glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[rgba(212,175,55,0.18)] via-[rgba(212,175,55,0.08)] to-transparent blur-[2px]" />
      <CardHeader className="pt-7 pb-2">
        <CardDescription className="text-[11px] uppercase tracking-[0.32em] text-perionyx-text-subtle font-bold">{description ?? title}</CardDescription>
        <CardTitle className="mt-2 text-xl font-bold tracking-tight text-perionyx-text-primary drop-shadow-[0_1px_8px_rgba(212,175,55,0.08)]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="flex items-end gap-2">
          <div className="text-4xl font-extrabold tabular-nums tracking-tight text-perionyx-gold drop-shadow-[0_2px_16px_rgba(212,175,55,0.12)]">{value}</div>
          {/* Subtle animated indicator for "living intelligence" */}
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-perionyx-gold/80 shadow-[0_0_8px_2px_rgba(212,175,55,0.18)]" />
        </div>
      </CardContent>
    </Card>
  );
}

