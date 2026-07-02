import { connectorOrchestrator } from "../orchestrator";
import { connectorPlatformRegistry } from "../registry";

export async function handleConnectorSync(job: { id: string; data: any }): Promise<void> {
  const { connectorId, companyId, direction, fullSync, syncType } = job.data;
  if (!connectorId || !companyId) return;

  if (syncType === "balances" || syncType === "transactions") {
    const connector = connectorPlatformRegistry.getInstance(connectorId);
    if (!connector) return;

    const method = syncType === "balances" ? "syncBalances" : "syncTransactions";
    await connectorOrchestrator.executeSync(
      connectorId, companyId, { direction, fullSync, syncType },
      async () => (connector as any)[method](),
    );
    return;
  }

  await connectorOrchestrator.executeSync(connectorId, companyId, { direction, fullSync, syncType });
}
