"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { WorkflowEngine } from "@/modules/workflow/engine";
import type { StepDefinition } from "@/modules/workflow/types";

const engine = WorkflowEngine.getInstance();

async function getContext() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  return ctx;
}

export async function createWorkflowDefinition(data: {
  name: string;
  description?: string;
  category?: string;
  steps: StepDefinition[];
}) {
  const ctx = await getContext();
  const def = await engine.createDefinition(ctx, {
    name: data.name,
    description: data.description,
    category: data.category,
    steps: data.steps,
  });
  revalidatePath("/automation-studio");
  return { id: def.id };
}

export async function updateWorkflowDefinition(definitionId: string, data: Partial<{
  name: string;
  description: string;
  category: string;
  steps: StepDefinition[];
  status: string;
}>) {
  const ctx = await getContext();
  const def = await engine.updateDefinition(ctx, definitionId, data);
  revalidatePath("/automation-studio");
  return { id: def.id };
}

export async function deleteWorkflowDefinition(definitionId: string) {
  const ctx = await getContext();
  await engine.updateDefinition(ctx, definitionId, { status: "ARCHIVED" });
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function createWorkflowInstance(definitionId: string, input?: Record<string, unknown>) {
  const ctx = await getContext();
  const instance = await engine.createInstance(ctx, definitionId, input);
  revalidatePath("/automation-studio");
  return { id: instance.id };
}

export async function startWorkflowInstance(instanceId: string) {
  const ctx = await getContext();
  await engine.startInstance(ctx, instanceId);
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function cancelWorkflowInstance(instanceId: string, reason?: string) {
  const ctx = await getContext();
  await engine.cancelInstance(ctx, instanceId, reason);
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function pauseWorkflowInstance(instanceId: string) {
  const ctx = await getContext();
  await engine.pauseInstance(ctx, instanceId);
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function resumeWorkflowInstance(instanceId: string, input?: Record<string, unknown>) {
  const ctx = await getContext();
  await engine.resumeInstance(ctx, instanceId, input);
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function scheduleWorkflowInstance(
  definitionId: string,
  scheduledFor: string,
  input?: Record<string, unknown>,
) {
  const ctx = await getContext();
  await engine.scheduleInstance(ctx, definitionId, input, scheduledFor);
  revalidatePath("/automation-studio");
  return { success: true };
}

export async function getWorkflowInstance(instanceId: string) {
  const ctx = await getContext();
  const instance = await engine.getInstance(ctx, instanceId);
  return instance;
}

export async function getWorkflowDefinition(definitionId: string) {
  const ctx = await getContext();
  const def = await engine.getDefinition(ctx, definitionId);
  return def;
}

export async function listWorkflowDefinitions(includeInactive = false) {
  const ctx = await getContext();
  return engine.listDefinitions(ctx, includeInactive);
}

export async function listWorkflowInstances(opts?: { status?: string; definitionId?: string; limit?: number }) {
  const ctx = await getContext();
  return engine.listInstances(ctx, opts as any);
}

export async function getWorkflowMetrics() {
  const ctx = await getContext();
  return engine.getMetrics(ctx);
}

export async function getWorkflowInstanceEvents(instanceId: string, limit = 100) {
  const ctx = await getContext();
  return engine.getInstanceEvents(ctx, instanceId, limit);
}
