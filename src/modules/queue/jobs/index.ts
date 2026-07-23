import { registerHandler, scheduleCron } from "../queue.service";
import { handleFxSync } from "./fx-sync.job";
import { handleWebhookRetry } from "./webhook-retry.job";
import { handleWebhookSend } from "./webhook-send.job";
import { handleReportGenerate } from "./report-generate.job";
import { handleBriefingGenerate, handleBriefingDailyCron } from "./briefing-generate.job";
import { handleIntelligenceSnapshot, handleSnapshotCron } from "./intelligence-snapshot.job";
import { handleAlertEngineEvaluate, handleAlertEngineCron } from "./alert-engine.job";
import { handleAnomalyDetection, handleAnomalyDetectionCron } from "./anomaly-detection.job";
import { handleConnectorSync } from "@/modules/connector-platform/jobs/connector-sync.job";
import { handleConnectorHealthCheck } from "@/modules/connector-platform/jobs/connector-health.job";
import { handleNotificationConnectorDelivery } from "@/modules/connector-platform/jobs/notification-connector-delivery.job";
import { handleAiProviderHealthCheck } from "@/modules/ai-provider/jobs/provider-health.job";
import { initializeConnectorPlatform } from "@/modules/connector-platform/bootstrap";
import { initializeAiProviders } from "@/modules/ai-provider/bootstrap";
import { handleWorkflowExecution, handleWorkflowScheduler, handleWorkflowTimeoutCheck, registerWorkflowCronJobs } from "@/modules/workflow";
import { handleNotificationDelivery } from "./notification-delivery.job";

export function registerAllJobs(): void {
  initializeConnectorPlatform();
  void initializeAiProviders();
  registerHandler("fx-sync", handleFxSync);
  registerHandler("webhook-send", handleWebhookSend);
  registerHandler("webhook-retry", async () => {
    await handleWebhookRetry();
  });
  registerHandler("report-generate", handleReportGenerate);
  registerHandler("notification-delivery", handleNotificationDelivery);
  registerHandler("briefing-generate", handleBriefingGenerate);
  registerHandler("briefing-daily-cron", handleBriefingDailyCron);
  registerHandler("intelligence-snapshot", handleIntelligenceSnapshot);
  registerHandler("snapshot-cron", handleSnapshotCron);
  registerHandler("alert-engine-evaluate", handleAlertEngineEvaluate);
  registerHandler("alert-engine-cron", handleAlertEngineCron);
  registerHandler("anomaly-detection", handleAnomalyDetection);
  registerHandler("anomaly-detection-cron", handleAnomalyDetectionCron);
  registerHandler("connector-sync", handleConnectorSync);
  registerHandler("connector-health", handleConnectorHealthCheck);
  registerHandler("notification-connector-deliver", handleNotificationConnectorDelivery);
  registerHandler("ai-provider-health", handleAiProviderHealthCheck);

  registerHandler("workflow-execute", async (job) => {
    await handleWorkflowExecution(job);
  });
  registerHandler("workflow-scheduler", async () => {
    await handleWorkflowScheduler();
  });
  registerHandler("workflow-timeout-check", async () => {
    await handleWorkflowTimeoutCheck();
  });
  scheduleCron("workflow-scheduler", "*/5 * * * *");
  scheduleCron("workflow-timeout-check", "0 */6 * * *");
}
