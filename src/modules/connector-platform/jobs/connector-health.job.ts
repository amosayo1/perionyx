import { connectorOrchestrator } from "../orchestrator";

export async function handleConnectorHealthCheck(job: { id: string; data: any }): Promise<void> {
  const { connectorId, companyId } = job.data;
  if (!connectorId || !companyId) return;

  await connectorOrchestrator.executeHealthCheck(connectorId, companyId);
}
