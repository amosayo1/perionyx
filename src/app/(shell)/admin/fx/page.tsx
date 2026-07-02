"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type FxRateRow = {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  fetchedAt: string | null;
  updatedAt: string;
};

type SyncStatus = {
  lastSyncAt: string | null;
  lastSyncSuccess: boolean | null;
  lastError: string | null;
  provider: string;
  currenciesUpdated: number | null;
  active: boolean;
  healthy: boolean;
  hoursSinceLastSync: number | null;
};

type SyncHistoryRow = {
  id: string;
  action: string;
  metadata: Record<string, string> | null;
  createdAt: string;
};

export default function FxAdminPage() {
  const [rates, setRates] = useState<FxRateRow[]>([]);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [history, setHistory] = useState<SyncHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [ratesRes, statusRes, historyRes] = await Promise.all([
        fetch("/api/v1/fx/rates"),
        fetch("/api/v1/fx/status"),
        fetch("/api/v1/audit/logs?action=fx.rate_sync,fx.rate_sync_failed&limit=20"),
      ]);
      if (ratesRes.ok) {
        const data = await ratesRes.json();
        setRates(data.rates ?? []);
      }
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.items ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); setHistoryLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  async function handleManualSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/v1/fx/sync", { method: "POST" });
      const data = await res.json();
      setSyncResult(data.success ? `Sync completed — ${data.currenciesUpdated} rates updated` : `Sync failed: ${data.error}`);
      await fetchData();
    } catch {
      setSyncResult("Request failed");
    }
    finally { setSyncing(false); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">FX Rate Sync</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Automated exchange rate synchronization from external providers.</p>
      </div>

      {/* Status card */}
      {loading ? (
        <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-6 text-center text-sm text-perionyx-text-faint">Loading…</div>
      ) : (
        <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-perionyx-text-primary">Sync Status</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${status?.active ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span className="text-perionyx-text-subtle">Provider:</span>
                  <span className="text-perionyx-text-primary">{status?.provider ?? "—"}</span>
                  {!status?.active && <span className="text-xs text-perionyx-text-muted">(mock — set FX_API_KEY for live)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${status?.lastSyncSuccess ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span className="text-perionyx-text-subtle">Last sync:</span>
                  <span className="text-perionyx-text-primary">{status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Never"}</span>
                </div>
                {(() => {
                  const s = status;
                  if (!s) return null;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${s.healthy ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-perionyx-text-subtle">Health:</span>
                        <span className="text-perionyx-text-primary">
                          {s.hoursSinceLastSync === null
                            ? "No sync recorded"
                            : s.healthy
                              ? `Healthy (${Math.round(s.hoursSinceLastSync)}h ago)`
                              : `Stale — ${Math.round(s.hoursSinceLastSync)}h since last sync`}
                        </span>
                      </div>
                    </>
                  );
                })()}
                {status?.currenciesUpdated !== null && (
                  <div>
                    <span className="text-perionyx-text-subtle">Currencies updated:</span>
                    <span className="ml-2 text-perionyx-text-primary">{status?.currenciesUpdated}</span>
                  </div>
                )}
                {status?.lastError && (
                  <div>
                    <span className="text-perionyx-text-subtle">Last error:</span>
                    <span className="ml-2 text-perionyx-danger text-xs">{status.lastError}</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={() => void handleManualSync()} disabled={syncing}
              className="h-9 rounded-lg bg-perionyx-gold px-4 text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50">
              {syncing ? "Syncing…" : "Sync now"}
            </Button>
          </div>
          {syncResult && (
            <p className={`mt-3 text-sm ${syncResult.startsWith("Sync completed") ? "text-green-500" : "text-perionyx-danger"}`}>
              {syncResult}
            </p>
          )}
        </div>
      )}

      {/* Current rates table */}
      <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel">
        <div className="border-b border-perionyx-border px-6 py-4">
          <h2 className="text-sm font-medium text-perionyx-text-primary">Current rates ({rates.length})</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">Loading…</div>
        ) : rates.length === 0 ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">No rates synced yet. Run a manual sync or wait for the scheduled worker.</div>
        ) : (
          <div className="divide-y divide-perionyx-border">
            {rates.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-2.5">
                <div>
                  <span className="text-sm font-medium text-perionyx-text-primary">{r.baseCurrency} → {r.quoteCurrency}</span>
                  <span className="ml-3 text-xs text-perionyx-text-muted">{r.source}</span>
                </div>
                <div className="text-sm text-perionyx-text-primary">{Number(r.rate).toFixed(6)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync history */}
      <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel">
        <div className="border-b border-perionyx-border px-6 py-4">
          <h2 className="text-sm font-medium text-perionyx-text-primary">Sync history</h2>
        </div>
        {historyLoading ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">Loading…</div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">No sync history yet.</div>
        ) : (
          <div className="divide-y divide-perionyx-border">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-6 py-2.5">
                <div>
                  <span className={`text-sm font-medium ${h.action === "fx.rate_sync" ? "text-green-500" : "text-perionyx-danger"}`}>
                    {h.action === "fx.rate_sync" ? "Success" : "Failed"}
                  </span>
                </div>
                <div className="text-xs text-perionyx-text-muted">{new Date(h.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
