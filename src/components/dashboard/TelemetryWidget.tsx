
"use client";
import * as React from "react";

// Simple animated telemetry widget for operational density
export function TelemetryWidget({
  value,
  label,
  unit,
  trend,
  color = "#d4af37",
}: {
  value: number;
  label: string;
  unit?: string;
  trend?: "up" | "down" | null;
  color?: string;
}) {
  // Simulate animated value (for demo, not real-time)
  const [displayValue, setDisplayValue] = React.useState(value);
  React.useEffect(() => {
    if (displayValue === value) return;
    const diff = value - displayValue;
    const step = diff / 12;
    const id = setInterval(() => {
      setDisplayValue((v) => {
        if (Math.abs(v - value) < Math.abs(step)) return value;
        return v + step;
      });
    }, 32);
    return () => clearInterval(id);
  }, [value, displayValue]);

  return (
    <div className="flex flex-col items-start gap-1 rounded-[20px] border border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] px-6 py-4 shadow-[0_4px_24px_rgba(212,175,55,0.06)]">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color }}>{displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{unit && <span className="ml-1 text-base font-normal text-perionyx-text-muted">{unit}</span>}</span>
        {trend === "up" && <span className="ml-1 text-green-500 animate-bounce">▲</span>}
        {trend === "down" && <span className="ml-1 text-red-500 animate-bounce">▼</span>}
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-perionyx-text-subtle">{label}</div>
    </div>
  );
}
