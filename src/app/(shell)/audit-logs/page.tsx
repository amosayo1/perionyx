"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { SeverityBadge } from "@/components/investigation/SeverityBadge";
import { JsonPanel } from "@/components/investigation/JsonPanel";
import { DataTable, FilterBuilder, InspectorPanel, InspectorRow, InspectorSection } from "@/components/data-table";
import type { Column, FilterDef, FilterValue, Density } from "@/components/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollText, ExternalLink } from "lucide-react";

type AuditRow = {
  id: string;
  companyId: string | null;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  severity: string;
  metadata: unknown;
  requestId: string | null;
  payloadHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

const filterDefs: FilterDef[] = [
  { id: "search", label: "Search", type: "text", placeholder: "Action or resource type…" },
  { id: "severity", label: "Severity", type: "select", options: [
    { value: "ALL", label: "All severities" },
    { value: "INFO", label: "INFO" },
    { value: "WARNING", label: "WARNING" },
    { value: "CRITICAL", label: "CRITICAL" },
  ]},
  { id: "action", label: "Action contains", type: "text", placeholder: "transaction." },
  { id: "user", label: "Actor ID", type: "text", placeholder: "User id…" },
  { id: "dateFrom", label: "Start Date", type: "date" },
  { id: "dateTo", label: "End Date", type: "date" },
];

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>("comfortable");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  // Inspector state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  // Debounced search triggers server-side reload
  const searchFilter = filterValues.find((f) => f.id === "search");
  const rawSearch = searchFilter?.value ?? "";
  const debouncedSearch = useDebounce(rawSearch, 350);

  const reload = useCallback((signal?: AbortSignal) => {
    startTransition(() => {
      void (async () => {
        setLoading(true);
        setLoadError(null);
        const q = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
        try {
          const res = await fetch(`/api/v1/audit-logs?limit=200${q}`, {
            credentials: "include",
            signal,
          });
          if (signal?.aborted) return;
          if (res.ok) {
            const body = (await res.json()) as { items: AuditRow[] };
            setItems(body.items ?? []);
          } else {
            setItems([]);
            setLoadError("Unable to load audit logs.");
          }
        } catch {
          if (!signal?.aborted) setLoadError("Unable to load audit logs.");
        } finally {
          if (!signal?.aborted) setLoading(false);
        }
      })();
    });
  }, [debouncedSearch]);

  useEffect(() => {
    const ac = new AbortController();
    reload(ac.signal);
    return () => ac.abort();
  }, [reload]);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      for (const fv of filterValues) {
        if (!fv.value && fv.operator !== "between") continue;
        if (fv.id === "search") {
          // Already handled server-side, skip client filtering
          continue;
        }
        if (fv.id === "severity" && fv.value !== "ALL") {
          if (a.severity !== fv.value) return false;
        }
        if (fv.id === "action") {
          if (!a.action.toLowerCase().includes(fv.value.toLowerCase())) return false;
        }
        if (fv.id === "user") {
          if (!(a.actorUserId ?? "").toLowerCase().includes(fv.value.toLowerCase())) return false;
        }
        if (fv.id === "dateFrom") {
          const d = new Date(a.createdAt);
          const s = new Date(`${fv.value}T00:00:00.000Z`);
          if (d < s) return false;
        }
        if (fv.id === "dateTo") {
          const d = new Date(a.createdAt);
          const e = new Date(`${fv.value}T23:59:59.999Z`);
          if (d > e) return false;
        }
      }
      return true;
    });
  }, [items, filterValues]);

  const handleRowClick = useCallback((row: AuditRow) => {
    setSelected(row);
    setInspectorOpen(true);
  }, []);

  const columns: Column<AuditRow>[] = useMemo(() => [
    {
      id: "createdAt",
      header: "When",
      accessor: (a) => <span className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(a.createdAt)}</span>,
      className: "hidden sm:table-cell",
    },
    {
      id: "severity",
      header: "Severity",
      accessor: (a) => <SeverityBadge severity={a.severity} />,
    },
    {
      id: "action",
      header: "Action",
      accessor: (a) => <span className="max-w-[240px] truncate font-mono text-xs text-zinc-400">{a.action}</span>,
    },
    {
      id: "actorUserId",
      header: "Actor",
      accessor: (a) => <span className="max-w-[180px] truncate font-mono text-xs text-zinc-500">{a.actorUserId ?? "—"}</span>,
      className: "hidden md:table-cell",
    },
    {
      id: "resource",
      header: "Resource",
      accessor: (a) => (
        <div className="max-w-[200px] truncate">
          <span className="text-sm text-zinc-400">{a.resourceType}</span>
          {a.resourceId && <span className="block truncate text-xs text-zinc-600">{a.resourceId}</span>}
        </div>
      ),
    },
  ], []);

  const hasAnyFilter = filterValues.some((fv) => fv.value.trim());
  const emptyTitle = !hasAnyFilter ? "No audit logs yet." : "No audit events match your filters.";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Audit logs</h1>
        <p className="mt-1 text-sm text-zinc-500">Immutable-style event trail for the active company.</p>
      </div>

      {loadError ? (
        <Card className="border border-white/[0.06] bg-zinc-900/40">
          <CardContent className="pt-4 text-sm text-zinc-500">{loadError}</CardContent>
        </Card>
      ) : null}

      <Card className="border border-white/[0.06] bg-zinc-900/40">
        <CardContent className="p-4">
          <FilterBuilder
            defs={filterDefs}
            values={filterValues}
            onChange={setFilterValues}
          />
        </CardContent>
      </Card>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(a) => a.id}
        loading={loading}
        error={loadError ?? undefined}
        emptyTitle={emptyTitle}
        emptyDescription="Adjust filters or clear them to broaden results."
        onRowClick={handleRowClick}
        density={density}
        onDensityChange={setDensity}
        hiddenColumns={hiddenColumns}
        onHiddenColumnsChange={setHiddenColumns}
        onCopyId={(id) => navigator.clipboard.writeText(id)}
        exportFilename={`audit-logs-${new Date().toISOString().split("T")[0]}.csv`}
      />

      {/* Inspector Panel */}
      {selected && (
        <InspectorPanel
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          title="Audit Event"
          description={selected.id}
          sections={[
            {
              id: "summary",
              label: "Summary",
              icon: <ScrollText className="h-3.5 w-3.5" />,
              content: (
                <div className="space-y-1">
                  <InspectorSection title="Event Details">
                    <InspectorRow label="Severity" value={<SeverityBadge severity={selected.severity} />} />
                    <InspectorRow label="When" value={formatDateTime(selected.createdAt)} />
                    <InspectorRow label="Action" value={<span className="font-mono text-xs">{selected.action}</span>} />
                    <InspectorRow label="Actor" value={selected.actorUserId ?? "—"} />
                    <InspectorRow label="Resource" value={`${selected.resourceType}${selected.resourceId ? ` · ${selected.resourceId}` : ""}`} />
                    <InspectorRow label="Request ID" value={selected.requestId ?? "—"} />
                    <InspectorRow label="Payload Hash" value={selected.payloadHash ?? "—"} />
                    <InspectorRow label="IP Address" value={selected.ipAddress ?? "—"} />
                    <InspectorRow label="User Agent" value={selected.userAgent ?? "—"} />
                  </InspectorSection>
                  {selected.metadata ? (
                    <InspectorSection title="Metadata">
                      <JsonPanel title="Metadata" value={selected.metadata} />
                    </InspectorSection>
                  ) : null}
                  <div className="pt-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(selected.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Copy Event ID
                    </button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
