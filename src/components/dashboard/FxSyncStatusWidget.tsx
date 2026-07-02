"use client";

import { useEffect, useState } from "react";

type FxSyncStatus = {
  lastSyncAt: string | null;
  lastSyncSuccess: boolean | null;
  lastError: string | null;
  provider: string;
  currenciesUpdated: number | null;
  active: boolean;
  healthy: boolean;
  hoursSinceLastSync: number | null;
};

export function FxSyncStatusWidget() {
  const [status, setStatus] = useState<FxSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/fx/status", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStatus(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  const healthy = status?.healthy;
  const dotColor = loading ? "bg-gray-500" : healthy ? "bg-green-500" : status?.lastSyncAt === null ? "bg-yellow-500" : "bg-red-500";
  const label = loading ? "Loading…" : healthy ? "Healthy" : status?.lastSyncAt === null ? "No sync" : "Stale";

  return (
    <div className="flex flex-col gap-2 rounded-[20px] border border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] px-6 py-4 shadow-[0_4px_24px_rgba(212,175,55,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-perionyx-text-subtle">FX Sync Status</span>
        </div>
        <span className="text-xs text-perionyx-text-muted">{label}</span>
      </div>
      {!loading && status && (
        <div className="mt-1 space-y-0.5 text-xs text-perionyx-text-muted">
          {status.lastSyncAt ? (
            <p>Last sync: {new Date(status.lastSyncAt).toLocaleString()}</p>
          ) : (
            <p>Never synced</p>
          )}
          <p>Provider: {status.provider}{status.active ? "" : " (mock)"}</p>
          {status.currenciesUpdated !== null && <p>{status.currenciesUpdated} rates</p>}
          {!healthy && status.hoursSinceLastSync !== null && (
            <p className="text-perionyx-danger">{Math.round(status.hoursSinceLastSync)}h since last sync</p>
          )}
        </div>
      )}
    </div>
  );
}
