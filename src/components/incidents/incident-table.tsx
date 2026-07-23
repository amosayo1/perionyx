"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EnterpriseTable } from "@/components/enterprise/table";
import { InspectorPanel, InspectorRow, InspectorSection } from "@/components/data-table/inspector-panel";
import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentStatusBadge } from "./incident-status-badge";
import { IncidentSlaCard } from "./incident-sla-card";
import { IncidentLinkedRecords } from "./incident-linked-records";
import type { Column, Density } from "@/components/enterprise/table/types";
import type { Incident, IncidentSeverity, IncidentStatus, IncidentCategory } from "./types";
import { incidents } from "./data";
import { ExternalLink, Timer, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SlaIndicator({ incident }: { incident: Incident }) {
  const now = Date.now();
  const responseDeadline = new Date(incident.slaResponseDeadline).getTime();
  const resolutionDeadline = new Date(incident.slaResolutionDeadline).getTime();
  const responded = incident.slaRespondedAt;
  const resolved = incident.slaResolvedAt;

  const responseBreached = !responded && now > responseDeadline;
  const resolutionBreached = !resolved && now > resolutionDeadline;

  const responseRemaining = responseBreached
    ? "Breached"
    : responded
      ? "Done"
      : `${Math.round((responseDeadline - now) / 60000)}m`;

  const resolutionRemaining = resolutionBreached
    ? "Breached"
    : resolved
      ? "Done"
      : `${Math.round((resolutionDeadline - now) / 3600000)}h`;

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className="flex items-center gap-1">
        <Timer className="h-3 w-3 text-zinc-600" />
        <span
          className={cn(
            responseBreached ? "text-red-400" : responded ? "text-[#d4af37]" : "text-zinc-400",
          )}
        >
          {responseRemaining}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-zinc-600" />
        <span
          className={cn(
            resolutionBreached ? "text-red-400" : resolved ? "text-[#d4af37]" : "text-zinc-400",
          )}
        >
          {resolutionRemaining}
        </span>
      </div>
      {(responseBreached || resolutionBreached) && (
        <AlertTriangle className="h-3 w-3 text-red-400" />
      )}
    </div>
  );
}

interface Filters {
  severity: IncidentSeverity[];
  status: IncidentStatus[];
  category: IncidentCategory[];
}

export function IncidentTable() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<Density>("comfortable");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorIncident, setInspectorIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState<Filters>({
    severity: [],
    status: [],
    category: [],
  });

  const filteredData = useMemo(() => {
    return incidents.filter((inc) => {
      if (filters.severity.length > 0 && !filters.severity.includes(inc.severity)) return false;
      if (filters.status.length > 0 && !filters.status.includes(inc.status)) return false;
      if (filters.category.length > 0 && !filters.category.includes(inc.category)) return false;
      return true;
    });
  }, [filters]);

  const columns: Column<Incident>[] = useMemo(
    () => [
      {
        id: "id",
        header: "Incident",
        sortKey: "id",
        accessor: (row) => (
          <span className="font-mono text-xs font-medium text-white">{row.id}</span>
        ),
      },
      {
        id: "severity",
        header: "Severity",
        sortKey: "severity",
        accessor: (row) => <IncidentSeverityBadge severity={row.severity} />,
      },
      {
        id: "status",
        header: "Status",
        sortKey: "status",
        accessor: (row) => <IncidentStatusBadge status={row.status} />,
      },
      {
        id: "category",
        header: "Category",
        sortKey: "category",
        accessor: (row) => (
          <span className="text-xs capitalize text-zinc-400">{row.category}</span>
        ),
        hideable: true,
      },
      {
        id: "title",
        header: "Title",
        sortKey: "title",
        accessor: (row) => (
          <span className="text-xs text-zinc-300 max-w-[240px] truncate block">{row.title}</span>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        sortKey: "owner",
        accessor: (row) => (
          <span className="text-xs text-zinc-400">{row.owner}</span>
        ),
        hideable: true,
      },
      {
        id: "linkedTransaction",
        header: "Linked TXN",
        accessor: (row) =>
          row.linkedTransactionId ? (
            <span className="font-mono text-xs text-zinc-500">{row.linkedTransactionId}</span>
          ) : (
            <span className="text-xs text-zinc-700">—</span>
          ),
        hideable: true,
      },
      {
        id: "linkedWorkflow",
        header: "Linked WF",
        accessor: (row) =>
          row.linkedWorkflowId ? (
            <span className="font-mono text-xs text-zinc-500">{row.linkedWorkflowId}</span>
          ) : (
            <span className="text-xs text-zinc-700">—</span>
          ),
        hideable: true,
      },
      {
        id: "created",
        header: "Created",
        sortKey: "created",
        accessor: (row) => (
          <span className="text-xs text-zinc-500">{formatTime(row.created)}</span>
        ),
        hideable: true,
      },
      {
        id: "sla",
        header: "SLA",
        accessor: (row) => <SlaIndicator incident={row} />,
        className: "min-w-[140px]",
      },
      {
        id: "updated",
        header: "Updated",
        sortKey: "updated",
        accessor: (row) => (
          <span className="text-xs text-zinc-500">{formatTime(row.updated)}</span>
        ),
        hideable: true,
      },
    ],
    [],
  );

  const handleRowClick = useCallback(
    (row: Incident) => {
      setInspectorIncident(row);
      setInspectorOpen(true);
    },
    [],
  );

  const handleViewDetail = useCallback(
    (incident: Incident) => {
      router.push(`/operations/incidents/${incident.id}`);
    },
    [router],
  );

  return (
    <div className="space-y-4">
      <EnterpriseTable
        data={filteredData}
        columns={columns}
        keyExtractor={(row) => row.id}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        density={density}
        onDensityChange={setDensity}
        hiddenColumns={hiddenColumns}
        onHiddenColumnsChange={setHiddenColumns}
        onRowClick={handleRowClick}
        exportable
        exportFilename="incidents"
        contextMenuItems={(row) => [
          {
            label: "View Detail",
            icon: <ExternalLink className="h-3.5 w-3.5" />,
            onClick: () => handleViewDetail(row),
          },
        ]}
        renderExpanded={(row) => (
          <div className="grid grid-cols-2 gap-6 py-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Description
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">{row.description}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-4 mb-2">
                Business Impact
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">{row.businessImpact}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                SLA Status
              </p>
              <IncidentSlaCard incident={row} />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-4 mb-2">
                Linked Records
              </p>
              <IncidentLinkedRecords incident={row} />
            </div>
          </div>
        )}
      />

      {/* Inspector Panel */}
      {inspectorIncident && (
        <InspectorPanel
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          title={inspectorIncident.id}
          description={inspectorIncident.title}
          sections={[
            {
              id: "summary",
              label: "Summary",
              content: (
                <>
                  <InspectorSection title="Overview">
                    <InspectorRow label="ID" value={inspectorIncident.id} />
                    <InspectorRow
                      label="Severity"
                      value={<IncidentSeverityBadge severity={inspectorIncident.severity} />}
                    />
                    <InspectorRow
                      label="Status"
                      value={<IncidentStatusBadge status={inspectorIncident.status} />}
                    />
                    <InspectorRow label="Priority" value={inspectorIncident.priority} />
                    <InspectorRow label="Owner" value={inspectorIncident.owner} />
                    <InspectorRow label="Team" value={inspectorIncident.team} />
                    <InspectorRow
                      label="Created"
                      value={new Date(inspectorIncident.created).toLocaleString()}
                    />
                  </InspectorSection>
                  <InspectorSection title="SLA">
                    <IncidentSlaCard incident={inspectorIncident} />
                  </InspectorSection>
                  <InspectorSection title="Impact">
                    <InspectorRow label="Business Impact" value={inspectorIncident.businessImpact} />
                    <InspectorRow label="Description" value={inspectorIncident.description} />
                  </InspectorSection>
                </>
              ),
            },
            {
              id: "linked",
              label: "Linked Records",
              content: <IncidentLinkedRecords incident={inspectorIncident} />,
            },
            {
              id: "details",
              label: "Details",
              content: (
                <>
                  {inspectorIncident.rootCause && (
                    <InspectorSection title="Root Cause">
                      <InspectorRow label="Cause" value={inspectorIncident.rootCause} />
                    </InspectorSection>
                  )}
                  {inspectorIncident.resolutionSummary && (
                    <InspectorSection title="Resolution">
                      <InspectorRow
                        label="Summary"
                        value={inspectorIncident.resolutionSummary}
                      />
                    </InspectorSection>
                  )}
                  {inspectorIncident.lessonsLearned && (
                    <InspectorSection title="Lessons">
                      <InspectorRow
                        label="Learned"
                        value={inspectorIncident.lessonsLearned}
                      />
                    </InspectorSection>
                  )}
                  <InspectorSection title="Meta">
                    <InspectorRow
                      label="Root Cause Classification"
                      value={inspectorIncident.rootCauseClassification ?? "—"}
                    />
                    <InspectorRow
                      label="Escalation Level"
                      value={`Level ${inspectorIncident.escalationLevel}`}
                    />
                  </InspectorSection>
                </>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
