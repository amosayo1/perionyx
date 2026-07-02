import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentStatusBadge } from "./incident-status-badge";
import { InspectorRow, InspectorSection } from "@/components/data-table/inspector-panel";
import { AlertTriangle, FileText } from "lucide-react";
import type { Incident } from "./types";

export function IncidentSummary({ incident }: { incident: Incident }) {
  return (
    <div>
      <InspectorSection title="Overview">
        <InspectorRow label="Incident ID" value={incident.id} />
        <InspectorRow
          label="Severity"
          value={<IncidentSeverityBadge severity={incident.severity} />}
        />
        <InspectorRow
          label="Status"
          value={<IncidentStatusBadge status={incident.status} />}
        />
        <InspectorRow label="Priority" value={incident.priority} />
        <InspectorRow
          label="Category"
          value={
            <span className="capitalize text-zinc-300">{incident.category}</span>
          }
        />
        <InspectorRow label="Owner" value={incident.owner} />
        <InspectorRow label="Team" value={incident.team} />
        <InspectorRow
          label="Created"
          value={new Date(incident.created).toLocaleString()}
        />
        <InspectorRow
          label="Last Updated"
          value={new Date(incident.updated).toLocaleString()}
        />
      </InspectorSection>

      <InspectorSection title="Details">
        <InspectorRow
          label="Business Impact"
          value={
            <div className="flex items-start gap-1.5">
              {incident.priority === "P1" && (
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
              )}
              <span className="text-zinc-300">{incident.businessImpact}</span>
            </div>
          }
        />
        <InspectorRow
          label="Description"
          value={
            <div className="flex items-start gap-1.5">
              <FileText className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
              <span className="text-zinc-300 leading-relaxed">{incident.description}</span>
            </div>
          }
        />
        {incident.rootCause && (
          <InspectorRow label="Root Cause" value={incident.rootCause} />
        )}
        <InspectorRow label="Escalation Level" value={`Level ${incident.escalationLevel}`} />
      </InspectorSection>
    </div>
  );
}
