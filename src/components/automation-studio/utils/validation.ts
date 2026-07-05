import type { StepDefinition } from "@/modules/workflow/types";
import type { DesignerStep } from "@/components/automation-studio/types";
import { STEP_PALETTE } from "@/components/automation-studio/types";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
  stepId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const CRON_REGEX = /^(\*|[0-9,-/]+) (\*|[0-9,-/]+) (\*|[0-9,-/]+) (\*|[0-9,-/]+) (\*|[0-9,-/]+)( (\*|[0-9,-/]+))?$/;

export function validateWorkflow(state: {
  name: string;
  description: string;
  triggerType: string;
  cronExpression: string;
  steps: DesignerStep[];
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!state.name.trim()) {
    errors.push({ field: "name", message: "Workflow name is required", severity: "error" });
  }

  if (state.steps.length === 0) {
    errors.push({ field: "steps", message: "Add at least one step to the workflow", severity: "error" });
  }

  if (state.triggerType === "scheduled") {
    if (!state.cronExpression.trim()) {
      errors.push({ field: "cronExpression", message: "Cron expression is required for scheduled workflows", severity: "error" });
    } else if (!CRON_REGEX.test(state.cronExpression.trim())) {
      errors.push({ field: "cronExpression", message: "Invalid cron expression format", severity: "error" });
    }
  }

  if (state.triggerType === "webhook" && !state.description.trim()) {
    warnings.push({ field: "description", message: "Consider adding a description for webhook-triggered workflows", severity: "warning" });
  }

  const labelCounts = new Map<string, { count: number; ids: string[] }>();
  for (const step of state.steps) {
    const entry = labelCounts.get(step.label) ?? { count: 0, ids: [] };
    entry.count++;
    entry.ids.push(step.id);
    labelCounts.set(step.label, entry);
  }
  for (const [label, info] of labelCounts) {
    if (info.count > 1) {
      errors.push({
        field: "label",
        message: `Duplicate step label: "${label}"`,
        severity: "error",
        stepId: info.ids[0],
      });
    }
  }

  for (const step of state.steps) {
    const paletteItem = STEP_PALETTE.find((p) => p.type === step.type);
    if (!paletteItem) {
      warnings.push({
        field: "type",
        message: `Unknown step type: "${step.type}"`,
        severity: "warning",
        stepId: step.id,
      });
    }
  }

  for (const step of state.steps) {
    for (const depId of step.dependsOn) {
      const depStep = state.steps.find((s) => s.id === depId);
      if (!depStep) {
        warnings.push({
          field: "dependsOn",
          message: `Step "${step.label}" depends on missing step "${depId}"`,
          severity: "warning",
          stepId: step.id,
        });
      }
    }
  }

  if (state.steps.length > 0) {
    const lastStep = state.steps[state.steps.length - 1];
    if (lastStep.type === "conditional" || lastStep.type === "decision") {
      warnings.push({
        field: "steps",
        message: "Workflow ends with a branching step — ensure all branches terminate",
        severity: "warning",
        stepId: lastStep.id,
      });
    }
  }

  if (state.steps.length > 20) {
    warnings.push({
      field: "steps",
      message: "Workflow has more than 20 steps — consider splitting into sub-workflows",
      severity: "warning",
    });
  }

  const hasApproval = state.steps.some((s) => s.type === "approval");
  if ((state.steps.some((s) => s.type === "connector_execution" && (s.config?.action === "send" || s.config?.action === "execute"))) && !hasApproval) {
    warnings.push({
      field: "steps",
      message: "Financial execution steps should be preceded by an approval step",
      severity: "warning",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateStepDefinition(step: StepDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!step.id) errors.push({ field: "id", message: "Step ID is required", severity: "error" });
  if (!step.label) errors.push({ field: "label", message: "Step label is required", severity: "error", stepId: step.id });
  if (!step.type) errors.push({ field: "type", message: "Step type is required", severity: "error", stepId: step.id });
  return errors;
}

export function validateDefinitionSteps(steps: StepDefinition[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const step of steps) {
    errors.push(...validateStepDefinition(step));
  }

  const ids = new Set(steps.map((s) => s.id));
  if (ids.size !== steps.length) {
    errors.push({ field: "id", message: "Duplicate step IDs found", severity: "error" });
  }

  for (const step of steps) {
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        if (!ids.has(depId)) {
          warnings.push({
            field: "dependsOn",
            message: `Step "${step.label}" depends on missing step "${depId}"`,
            severity: "warning",
            stepId: step.id,
          });
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
