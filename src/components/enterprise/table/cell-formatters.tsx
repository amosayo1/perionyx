import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CellConfig } from "./types";

export function formatMoney(amount: string | number, currency: string, fractionDigits = 2): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  } catch {
    return `${n.toFixed(fractionDigits)} ${currency}`;
  }
}

export function formatNumber(n: number, fractionDigits = 2): string {
  if (!Number.isFinite(n)) return String(n);
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function abbreviateNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

function isNegative(val: unknown): boolean {
  if (typeof val === "number") return val < 0;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) && n < 0;
  }
  return false;
}

export function CurrencyCell({
  value,
  currency,
  config,
}: {
  value: string | number;
  currency: string;
  config?: CellConfig;
}) {
  const n = typeof value === "string" ? Number(value) : value;
  const neg = isNegative(n);
  const display = config?.abbreviate
    ? abbreviateNumber(Math.abs(n))
    : formatMoney(Math.abs(n), currency, config?.fractionDigits);

  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        config?.negativeRed !== false && neg ? "text-red-400" : "text-white",
      )}
    >
      {neg ? `(${display})` : display}
    </span>
  );
}

export function NumberCell({ value, config }: { value: number; config?: CellConfig }) {
  const neg = isNegative(value);
  const display = config?.abbreviate
    ? abbreviateNumber(Math.abs(value))
    : formatNumber(Math.abs(value), config?.fractionDigits);

  return (
    <span
      className={cn(
        "tabular-nums",
        config?.negativeRed !== false && neg ? "text-red-400" : "text-zinc-300",
      )}
    >
      {neg ? `(${display})` : display}
    </span>
  );
}

export function DateCell({ value, config }: { value: string | Date; config?: CellConfig }) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return <span className="text-zinc-600">{String(value)}</span>;

  if (config?.relative) {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return <span className="text-zinc-400">Just now</span>;
    if (mins < 60) return <span className="text-zinc-400">{mins}m ago</span>;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return <span className="text-zinc-400">{hours}h ago</span>;
    const days = Math.floor(hours / 24);
    if (days < 7) return <span className="text-zinc-400">{days}d ago</span>;
  }

  try {
    const formatted = new Intl.DateTimeFormat(undefined, {
      dateStyle: config?.dateStyle ?? "medium",
      timeStyle: config?.timeStyle ?? "short",
    }).format(d);
    return <span className="whitespace-nowrap text-zinc-400">{formatted}</span>;
  } catch {
    return <span className="text-zinc-400">{String(value)}</span>;
  }
}

export function StatusCell({ value, variant }: { value: string; variant?: string }) {
  const colorMap: Record<string, string> = {
    SUCCEEDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    EXPIRED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    WARNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const classes = colorMap[value] ?? colorMap[variant ?? ""] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <Badge variant="outline" className={cn("font-normal text-[11px] border", classes)}>
      {value}
    </Badge>
  );
}

export function TrendCell({ value, inverse }: { value: number; inverse?: boolean }) {
  const isUp = inverse ? value < 0 : value > 0;
  const isDown = inverse ? value > 0 : value < 0;

  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <Minus className="h-3 w-3" />
        <span>0%</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs tabular-nums font-medium",
        isUp ? "text-emerald-400" : "text-red-400",
      )}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{value > 0 ? "+" : ""}{value.toFixed(1)}%</span>
    </span>
  );
}

export function TagsCell({ tags, max = 3 }: { tags: string[]; max?: number }) {
  if (!tags.length) return <span className="text-zinc-700">—</span>;

  const visible = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="text-[10px] font-normal text-zinc-400 border-white/[0.06] bg-white/[0.02]"
        >
          {tag}
        </Badge>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-zinc-600">+{remaining}</span>
      )}
    </div>
  );
}

export function TruncatedCell({
  children,
  max,
  className,
}: {
  children: string;
  max?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("block truncate", className)}
      title={children}
      style={max ? { maxWidth: max } : undefined}
    >
      {children}
    </span>
  );
}
