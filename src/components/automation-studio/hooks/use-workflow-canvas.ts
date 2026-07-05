"use client";

import { useState, useCallback, useMemo } from "react";
import type { StepDefinition } from "@/modules/workflow/types";
import type { DesignerStep } from "@/components/automation-studio/types";
import { STEP_PALETTE } from "@/components/automation-studio/types";
import { useUndoRedo } from "./use-undo-redo";
import { applyAutoLayout } from "../utils/layout";
import { validateWorkflow, type ValidationResult } from "../utils/validation";
import { designerStepToDefinition, definitionToDesignerSteps } from "../utils/serialization";

let stepCounter = 0;
function generateStepId(): string {
  stepCounter += 1;
  return `step-${stepCounter}-${Date.now().toString(36)}`;
}

export interface WorkflowCanvasState {
  name: string;
  description: string;
  category: string;
  triggerType: string;
  cronExpression: string;
  steps: DesignerStep[];
  selectedStepId: string | null;
}

function createInitialState(): WorkflowCanvasState {
  return {
    name: "",
    description: "",
    category: "general",
    triggerType: "manual",
    cronExpression: "",
    steps: [],
    selectedStepId: null,
  };
}

export function useWorkflowCanvas() {
  const initialState = useMemo(() => createInitialState(), []);

  const undoRedo = useUndoRedo(initialState);
  const state = undoRedo.present;

  const setState = useCallback((updater: (prev: WorkflowCanvasState) => WorkflowCanvasState) => {
    const newState = updater(state);
    undoRedo.pushState(newState);
  }, [state, undoRedo]);

  const replaceState = useCallback((updater: (prev: WorkflowCanvasState) => WorkflowCanvasState) => {
    const newState = updater(state);
    undoRedo.replace(newState);
  }, [state, undoRedo]);

  const loadFromDefinition = useCallback((data: {
    name?: string;
    description?: string;
    category?: string;
    triggerType?: string;
    cronExpression?: string;
    steps?: StepDefinition[];
  }) => {
    const designerSteps = data.steps
      ? definitionToDesignerSteps(data.steps)
      : [];
    if (data.steps) stepCounter = data.steps.length;
    undoRedo.reset({
      name: data.name ?? "",
      description: data.description ?? "",
      category: data.category ?? "general",
      triggerType: data.triggerType ?? "manual",
      cronExpression: data.cronExpression ?? "",
      steps: designerSteps,
      selectedStepId: null,
    });
  }, [undoRedo]);

  const selectedStep = state.steps.find((s) => s.id === state.selectedStepId) ?? null;

  const updateMetadata = useCallback((data: Partial<Pick<WorkflowCanvasState, "name" | "description" | "category" | "triggerType" | "cronExpression">>) => {
    setState((prev) => ({ ...prev, ...data }));
  }, [setState]);

  const addStep = useCallback((type: string) => {
    const paletteItem = STEP_PALETTE.find((p) => p.type === type);
    if (!paletteItem) return;
    const newStep: DesignerStep = {
      id: generateStepId(),
      type: paletteItem.type,
      label: paletteItem.label,
      config: {},
      dependsOn: [],
      position: { x: 0, y: 0 },
    };
    setState((prev) => ({
      ...prev,
      steps: applyAutoLayout([...prev.steps, newStep]),
      selectedStepId: newStep.id,
    }));
  }, [setState]);

  const addStepAt = useCallback((type: string, afterStepId: string) => {
    const paletteItem = STEP_PALETTE.find((p) => p.type === type);
    if (!paletteItem) return;
    const newStep: DesignerStep = {
      id: generateStepId(),
      type: paletteItem.type,
      label: paletteItem.label,
      config: {},
      dependsOn: [afterStepId],
      position: { x: 0, y: 0 },
    };
    setState((prev) => {
      const idx = prev.steps.findIndex((s) => s.id === afterStepId);
      const steps = [...prev.steps];
      steps.splice(idx + 1, 0, newStep);
      return { ...prev, steps: applyAutoLayout(steps), selectedStepId: newStep.id };
    });
  }, [setState]);

  const updateStep = useCallback((updated: DesignerStep) => {
    replaceState((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === updated.id ? updated : s)),
    }));
  }, [replaceState]);

  const selectStep = useCallback((stepId: string | null) => {
    replaceState((prev) => ({ ...prev, selectedStepId: stepId }));
  }, [replaceState]);

  const deleteStep = useCallback((stepId: string) => {
    setState((prev) => {
      const filtered = prev.steps.filter((s) => s.id !== stepId);
      const cleaned = filtered.map((s) => ({
        ...s,
        dependsOn: s.dependsOn.filter((d) => d !== stepId),
      }));
      return {
        ...prev,
        steps: applyAutoLayout(cleaned),
        selectedStepId: prev.selectedStepId === stepId ? null : prev.selectedStepId,
      };
    });
  }, [setState]);

  const moveStep = useCallback((stepId: string, direction: "up" | "down") => {
    setState((prev) => {
      const idx = prev.steps.findIndex((s) => s.id === stepId);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.steps.length) return prev;
      const steps = [...prev.steps];
      [steps[idx], steps[targetIdx]] = [steps[targetIdx], steps[idx]];
      return { ...prev, steps: applyAutoLayout(steps) };
    });
  }, [setState]);

  const reorderStep = useCallback((dragId: string, targetId: string) => {
    setState((prev) => {
      const idx = prev.steps.findIndex((s) => s.id === dragId);
      const targetIdx = prev.steps.findIndex((s) => s.id === targetId);
      if (idx === -1 || targetIdx === -1 || idx === targetIdx) return prev;
      const steps = [...prev.steps];
      const [moved] = steps.splice(idx, 1);
      steps.splice(targetIdx, 0, moved);
      return { ...prev, steps: applyAutoLayout(steps) };
    });
  }, [setState]);

  const setDependsOn = useCallback((stepId: string, dependsOn: string[]) => {
    replaceState((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === stepId ? { ...s, dependsOn } : s)),
    }));
  }, [replaceState]);

  const validation: ValidationResult = useMemo(
    () => validateWorkflow(state),
    [state],
  );

  const toDefinitions = useCallback((): StepDefinition[] => {
    return state.steps.map(designerStepToDefinition);
  }, [state.steps]);

  return {
    ...state,
    selectedStep,
    validation,
    loadFromDefinition,
    updateMetadata,
    addStep,
    addStepAt,
    updateStep,
    selectStep,
    deleteStep,
    moveStep,
    reorderStep,
    setDependsOn,
    toDefinitions,
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    undo: undoRedo.undo,
    redo: undoRedo.redo,
    resetCanvas: undoRedo.reset,
    isDirty: undoRedo.historySize > 0,
  };
}
