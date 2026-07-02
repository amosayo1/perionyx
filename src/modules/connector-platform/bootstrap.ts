import { enableConnectorWebhookBridge } from "./webhook-bridge";

let initialized = false;

export function initializeConnectorPlatform(): void {
  if (initialized) return;
  initialized = true;

  enableConnectorWebhookBridge();
}
