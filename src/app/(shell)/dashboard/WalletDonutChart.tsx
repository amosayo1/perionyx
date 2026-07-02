"use client";

type DataItem = { name: string; value: number; color: string };

export function WalletDonutChart({ data }: { data: DataItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = data.map((d) => {
    const length = (d.value / total) * circumference;
    const seg = { ...d, offset, length: Math.max(length, 1) };
    offset += length;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90, 90) rotate(-90)">
            {segments.map((s) => (
              <circle
                key={s.name}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="28"
                strokeDasharray={`${s.length} ${circumference}`}
                strokeDashoffset={-s.offset}
                opacity="0.85"
                className="transition-opacity hover:opacity-100"
              />
            ))}
            <circle r={40} fill="#09090b" />
          </g>
          <text x="90" y="88" textAnchor="middle" className="fill-white text-sm font-bold" fontSize="16">
            {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </text>
          <text x="90" y="104" textAnchor="middle" className="fill-white/40 text-[10px]" fontSize="10">
            Total
          </text>
        </svg>
      </div>
      <div className="space-y-2.5 w-full max-w-[200px]">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-white/60 flex-1">{d.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/90">
                {((d.value / total) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-white/40 tabular-nums">
                {d.value.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
