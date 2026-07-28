/**
 * AP Event Handlers — Barrel
 *
 * Registers all event handlers on the AP event bus.
 * Called once at application startup.
 */

import { registerGLPostingHandlers } from "./gl-posting-handler";
import { registerNotificationHandlers } from "./notification-handler";
import { registerAuditHandlers } from "./audit-handler";

let initialized = false;

/**
 * Register all AP event handlers. Safe to call multiple times.
 */
export function registerAllAPEventHandlers(): void {
  if (initialized) return;

  registerGLPostingHandlers();
  registerNotificationHandlers();
  registerAuditHandlers();

  initialized = true;
  console.log("[AP] Event handlers registered: GL posting, notifications, audit trail");
}
