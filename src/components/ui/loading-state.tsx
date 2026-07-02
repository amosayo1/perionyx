import { cn } from "@/lib/utils";

export function LoadingState({
  message = "Loading data...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[140px] items-center justify-center gap-3 rounded-[24px] border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel p-6 text-perionyx-text-muted", className)}>
      <span className="inline-flex h-3.5 w-3.5 animate-pulse rounded-full bg-perionyx-gold" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
