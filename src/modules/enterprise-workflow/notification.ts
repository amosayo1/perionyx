/**
 * Phase 23 — Enterprise Workflow Engine: Notifications
 *
 * Abstract notification delivery. The engine emits typed, structured
 * notifications and dispatches them to registered channels. Channels
 * (email, Slack, in-app, pager…) are providers registered at runtime —
 * the engine is never bound to a delivery mechanism. A failing channel
 * is isolated and never breaks the workflow.
 */

import type { WorkflowNotification, WorkflowNotificationKind, NotificationChannel } from "./types";

export interface NotifyInput {
  kind: WorkflowNotificationKind;
  workflowId: string;
  instanceId: string | null;
  stepId: string | null;
  recipient: { kind: "user" | "role" | "queue"; id: string };
  title: string;
  body: string;
  severity?: "info" | "warning" | "critical";
  at: string;
  metadata?: Record<string, unknown>;
}

export class NotificationDispatcher {
  private readonly channels = new Map<string, NotificationChannel>();
  private seq = 0;
  private readonly sent: WorkflowNotification[] = [];

  register(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
  }

  registerById(id: string, deliver: (n: WorkflowNotification) => Promise<void> | void): void {
    this.register({ id, deliver });
  }

  listChannels(): string[] {
    return [...this.channels.keys()].sort();
  }

  notify(input: NotifyInput): WorkflowNotification {
    this.seq += 1;
    const notification: WorkflowNotification = {
      id: `ntf-${this.seq}`,
      kind: input.kind,
      workflowId: input.workflowId,
      instanceId: input.instanceId,
      stepId: input.stepId,
      recipient: input.recipient,
      title: input.title,
      body: input.body,
      severity: input.severity ?? "info",
      at: input.at,
      metadata: input.metadata,
    };
    for (const channel of this.channels.values()) {
      try {
        void Promise.resolve(channel.deliver(notification)).catch(() => undefined);
      } catch {
        // Channel failure is isolated — a notification problem never
        // blocks a workflow transition.
      }
    }
    this.sent.push(notification);
    return notification;
  }

  getSent(): readonly WorkflowNotification[] {
    return this.sent;
  }
}
