import { IncidentHeader } from "@/components/incidents/incident-header";
import { IncidentTable } from "@/components/incidents/incident-table";

export default function IncidentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <IncidentHeader />
      <IncidentTable />
    </div>
  );
}
