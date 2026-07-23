import { installerFacade } from "@/server/installer";
import { DeploymentDashboard } from "./deployment-dashboard";

export default async function DeploymentPage() {
  const [health, status] = await Promise.all([
    installerFacade.checkHealth(),
    installerFacade.getStatus(),
  ]);

  const metrics = await installerFacade.getDeploymentMetrics();
  const envResult = await installerFacade.verifyEnvironment().catch(() => null);

  return (
    <DeploymentDashboard
      health={health}
      status={status}
      metrics={metrics}
      envResult={envResult}
    />
  );
}
