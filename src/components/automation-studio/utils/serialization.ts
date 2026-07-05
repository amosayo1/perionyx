import type { StepDefinition } from "@/modules/workflow/types";
import type { DesignerStep } from "@/components/automation-studio/types";
import { applyAutoLayout } from "./layout";

export function designerStepToDefinition(step: DesignerStep): StepDefinition {
  return {
    id: step.id,
    type: step.type,
    label: step.label,
    config: step.config,
    dependsOn: step.dependsOn,
    timeoutMinutes: step.config.timeoutMinutes as number | undefined,
    retryCount: step.config.retryCount as number | undefined,
    retryDelayMs: step.config.retryDelayMs as number | undefined,
  };
}

export function definitionToDesignerStep(sd: StepDefinition, index: number): DesignerStep {
  return {
    id: sd.id,
    type: sd.type,
    label: sd.label,
    config: sd.config ?? {},
    dependsOn: sd.dependsOn ?? [],
    position: { x: 0, y: 0 },
  };
}

export function definitionToDesignerSteps(steps: StepDefinition[]): DesignerStep[] {
  return applyAutoLayout(steps.map((sd, i) => definitionToDesignerStep(sd, i)));
}

export function workflowStateToDefinitions(steps: DesignerStep[]): StepDefinition[] {
  return steps.map(designerStepToDefinition);
}

export function cloneDesignerStep(step: DesignerStep): DesignerStep {
  return {
    id: step.id,
    type: step.type,
    label: step.label,
    config: { ...step.config },
    dependsOn: [...step.dependsOn],
    position: { ...step.position },
  };
}

export function cloneWorkflowState(steps: DesignerStep[]): DesignerStep[] {
  return steps.map(cloneDesignerStep);
}
