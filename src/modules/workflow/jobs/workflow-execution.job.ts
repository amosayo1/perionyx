import { enqueue } from "@/modules/queue/queue.service";
import { WorkflowEngine } from "../engine";
import type { TenantContext } from "@/server/context/tenant-context";

const _engine = new WorkflowEngine();

export async function handleWorkflowExecution(job: { id: string; data: { instanceId: string; companyId: string; userId: string } }) {
  const { instanceId, companyId, userId } = job.data;
  const ctx: TenantContext = { companyId, userId, role: "ADMIN" } as any;
  await _engine.startInstance(ctx, instanceId);
}

export async function handleWorkflowStep(job: { id: string; data: { instanceId: string; stepId: string; companyId: string; userId: string } }) {
  const { instanceId, companyId, userId } = job.data;
  const ctx: TenantContext = { companyId, userId, role: "ADMIN" } as any;
  const engine = new WorkflowEngine();
  const instance = await engine.getInstance(ctx, instanceId);
  if (!instance) throw new Error("Instance not found");

  const steps = instance.definition as any;
  const stepDef = (steps?.steps as any[])?.find((s: any) => s.id === job.data.stepId);
  if (!stepDef) throw new Error("Step not found");

  await engine["executeStep"](ctx, instanceId, stepDef, instance.steps, instance.variables as Record<string, unknown>, instance.metadata as Record<string, unknown>);
}

export async function enqueueWorkflowExecution(instanceId: string, companyId: string, userId: string, delayMinutes?: number) {
  await enqueue("workflow-execute", { instanceId, companyId, userId }, {
    ...(delayMinutes ? { startAfter: Math.round(Date.now() / 1000) + delayMinutes * 60 } : {}),
    retryLimit: 3,
    retryDelay: 60,
    retryBackoff: true,
  });
}
