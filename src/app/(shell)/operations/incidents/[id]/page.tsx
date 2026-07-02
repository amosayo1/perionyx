import { incidents } from "@/components/incidents/data";
import { IncidentDetailPage } from "@/components/incidents/incident-detail";
import { notFound } from "next/navigation";

export default function IncidentDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  const incident = incidents.find(
    (inc) => inc.id.toLowerCase() === params.id.toLowerCase(),
  );

  if (!incident) {
    notFound();
  }

  return <IncidentDetailPage incident={incident} />;
}
