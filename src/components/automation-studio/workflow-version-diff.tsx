"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, Plus, Minus, Pencil, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkflowVersionHistory, getWorkflowVersionDiff } from "./actions";

interface VersionEntry {
  version: number;
  snapshot: Record<string, unknown>;
  createdAt: Date;
}

interface VersionDiff {
  added: Array<{ path: string; value: unknown }>;
  removed: Array<{ path: string; value: unknown }>;
  changed: Array<{ path: string; from: unknown; to: unknown }>;
}

interface Props {
  definitionId: string;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val);
}

function isJsonLike(val: unknown): boolean {
  return val !== null && val !== undefined && typeof val === "object";
}

export function WorkflowVersionDiff({ definitionId }: Props) {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffLoading, setDiffLoading] = useState(false);
  const [fromVersion, setFromVersion] = useState<number | "">("");
  const [toVersion, setToVersion] = useState<number | "">("");

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflowVersionHistory(definitionId);
      setVersions(data ?? []);
    } catch {
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [definitionId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const computeDiff = useCallback(async () => {
    if (fromVersion === "" || toVersion === "") return;
    setDiffLoading(true);
    try {
      const data = await getWorkflowVersionDiff(definitionId, fromVersion, toVersion);
      setDiff(data);
    } catch {
      setDiff(null);
    } finally {
      setDiffLoading(false);
    }
  }, [definitionId, fromVersion, toVersion]);

  const versionOptions = versions.map((v) => ({
    label: `v${v.version} — ${new Date(v.createdAt).toLocaleDateString()}`,
    value: v.version,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Version Diff</CardTitle>
            <CardDescription>Compare two versions of this workflow definition</CardDescription>
          </div>
          <ArrowLeftRight className="h-4 w-4 text-zinc-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : versions.length < 2 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/60 text-zinc-600">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <p className="text-sm text-zinc-500">Need at least 2 versions to compare</p>
            <p className="text-xs text-zinc-600 mt-1">Save the workflow definition multiple times to build version history</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">From Version</label>
                <select
                  value={fromVersion}
                  onChange={(e) => setFromVersion(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/40"
                >
                  <option value="">Select...</option>
                  {versionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === toVersion}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">To Version</label>
                <select
                  value={toVersion}
                  onChange={(e) => setToVersion(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/40"
                >
                  <option value="">Select...</option>
                  {versionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === fromVersion}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={computeDiff}
              disabled={fromVersion === "" || toVersion === "" || diffLoading}
            >
              {diffLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowLeftRight className="h-3.5 w-3.5" />
              )}
              Compare
            </Button>

            {diff && (
              <div className="space-y-4">
                {diff.added.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Added ({diff.added.length})</span>
                    </div>
                    <div className="space-y-1">
                      {diff.added.map((item) => (
                        <div key={item.path} className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
                          <p className="text-xs font-medium text-emerald-300">{item.path}</p>
                          <pre className="mt-1 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                            {formatValue(item.value)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.removed.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Minus className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-medium text-red-400">Removed ({diff.removed.length})</span>
                    </div>
                    <div className="space-y-1">
                      {diff.removed.map((item) => (
                        <div key={item.path} className="rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2">
                          <p className="text-xs font-medium text-red-300">{item.path}</p>
                          <pre className="mt-1 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                            {formatValue(item.value)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.changed.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Pencil className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400">Changed ({diff.changed.length})</span>
                    </div>
                    <div className="space-y-1">
                      {diff.changed.map((item) => (
                        <div key={item.path} className="rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2">
                          <p className="text-xs font-medium text-amber-300">{item.path}</p>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-red-400">From</span>
                              <pre className="mt-0.5 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                {isJsonLike(item.from) ? JSON.stringify(item.from, null, 2) : formatValue(item.from)}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-400">To</span>
                              <pre className="mt-0.5 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                {isJsonLike(item.to) ? JSON.stringify(item.to, null, 2) : formatValue(item.to)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0 && (
                  <p className="py-4 text-center text-sm text-zinc-500">No differences found between these versions.</p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
