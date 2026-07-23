import { DrillDownPanel } from "@/components/executive-command-center/drill-down-panel";

export const metadata = {
  title: "KPI Drill-Down | Vaulta",
};

export default function ExecutiveDrillDownPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; entityId?: string }>;
}) {
  return <DrillDownPanelWrapper searchParams={searchParams} />;
}

import { use } from "react";

function DrillDownPanelWrapper({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; entityId?: string }>;
}) {
  const params = use(searchParams);
  return <DrillDownPanel domain={params.domain} entityId={params.entityId} />;
}
