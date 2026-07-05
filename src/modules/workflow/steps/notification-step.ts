import { notificationService } from "@/modules/notifications/notifications.service";
import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class NotificationStepExecutor implements StepExecutor {
  readonly type = "notification" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const title: string = (config.title as string) ?? `Workflow: ${ctx.instanceId}`;
    const message: string = (config.message as string) ?? `Step "${step.label}" completed`;
    const userIds: string[] = (config.userIds as string[]) ?? [];
    const eventType: string = (config.eventType as string) ?? "APPROVAL_REQUIRED";
    const link: string | undefined = config.link as string | undefined;

    try {
      const promises: Promise<void>[] = [];

      if (userIds.length > 0) {
        for (const userId of userIds) {
          promises.push(
            notificationService.send({
              companyId: ctx.companyId,
              userId,
              eventType: eventType as any,
              title,
              message,
              link,
              metadata: { workflowInstanceId: ctx.instanceId, stepId: step.id },
            }),
          );
        }
      } else {
        promises.push(
          notificationService.broadcast({
            companyId: ctx.companyId,
            eventType: eventType as any,
            title,
            message,
            link,
            metadata: { workflowInstanceId: ctx.instanceId, stepId: step.id },
          }),
        );
      }

      await Promise.all(promises);

      return { success: true, output: { sentTo: userIds.length > 0 ? userIds : "broadcast", count: promises.length } };
    } catch (err: any) {
      return { success: false, error: `Notification failed: ${err?.message ?? err}` };
    }
  }
}
