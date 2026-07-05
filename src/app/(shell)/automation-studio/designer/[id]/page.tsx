"use client";

import { useParams } from "next/navigation";
import { WorkflowDesigner } from "@/components/automation-studio/workflow-designer";

export default function EditWorkflowPage() {
  const params = useParams<{ id: string }>();
  return <WorkflowDesigner definitionId={params.id} />;
}
