import { registerHandler } from "@/modules/queue/queue.service";
import { handleConnectorSync } from "./connector-sync.job";
import { handleConnectorHealthCheck } from "./connector-health.job";
import { handleConnectorOAuthRefresh } from "./connector-oauth-refresh.job";

export function registerConnectorJobs(): void {
  registerHandler("connector-sync", handleConnectorSync);
  registerHandler("connector-health", handleConnectorHealthCheck);
  registerHandler("connector-oauth-refresh", handleConnectorOAuthRefresh);
}
