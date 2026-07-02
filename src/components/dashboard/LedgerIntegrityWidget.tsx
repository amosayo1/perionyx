"use client";

import { useEffect, useState } from "react";

type ReconciliationHealth = {
  lastRunAt: string | null;
  lastRunStatus: string | null;
  openExceptions: number;
  recentExceptions: number;
  totalRuns: number;
  failedRuns: number;
  health: "GOOD" | "WARNING" | "CRITICAL";
};

type RiskAlert = {
  id: string;
  title: string;
  severity: string;
  createdAt: string;
};

export function LedgerIntegrityWidget() {
  const [health, setHealth] = useState<ReconciliationHealth | null>(null);
  const [driftAlerts, setDriftAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    const fetchHealth = fetch("/api/v1/reconciliation/health", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null));
    const fetchAlerts = fetch("/api/v1/risk/alerts?category=BALANCE_ANOMALY&limit=3", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null));

    Promise.all([fetchHealth, fetchAlerts])
      .then(([h, a]) => {
        if (h) setHealth(h);
        if (a?.items) setDriftAlerts(a.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  const colorMap: Record<string, string> = {
    GOOD: "bg-green-500",
    WARNING: "bg-yellow-500",
    CRITICAL: "bg-red-500",
  };
  const dotColor = loading ? "bg-gray-500" : colorMap[health?.health ?? "CRITICAL"];
  const label = loading ? "Loading\u2026" : health?.health ?? "Unknown";

  return (
    <div className="flex flex-col gap-2 rounded-[20px] border border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] px-6 py-4 shadow-[0_4px_24px_rgba(212,175,55,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-perionyx-text-subtle">
            Ledger Integrity
          </span>
        </div>
        <span className="text-xs text-perionyx-text-muted">{label}</span>
      </div>
      {!loading && health && (
        <div className="mt-1 space-y-0.5 text-xs text-perionyx-text-muted">
          {health.lastRunAt ? (
            <p>Last reconciliation: {new Date(health.lastRunAt).toLocaleString()}</p>
          ) : (
            <p>No reconciliation run yet</p>
          )}
          <p>
            {health.openExceptions} open exception{health.openExceptions !== 1 ? "s" : ""}
            {health.lastRunStatus && `  \u00b7  ${health.lastRunStatus}`}
          </p>
          {driftAlerts.length > 0 && (
            <div>
              <p className="mt-1 font-semibold text-perionyx-danger">
                {driftAlerts.length} drift alert{driftAlerts.length !== 1 ? "s" : ""}
              </p>
              {driftAlerts.map((a) => (
                <p key={a.id} className="truncate text-perionyx-text-muted">
                  {a.title}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
