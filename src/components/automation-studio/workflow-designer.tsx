"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Play, Workflow,
  Plus, AlertCircle, Sparkles, Settings,
  GripVertical,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { WorkflowToolbar } from "@/components/enterprise/workflow/workflow-toolbar";
import { WorkflowCanvas } from "@/components/enterprise/workflow/workflow-canvas";
import { StepPalette } from "./step-palette";
import { PropertyPanel } from "./property-panel";
import { createWorkflowDefinition, updateWorkflowDefinition } from "./actions";
import { STEP_PALETTE, CATEGORY_OPTIONS, TRIGGER_OPTIONS } from "./types";
import type { DesignerStep, StepPaletteItem } from "./types";
import type { StepDefinition } from "@/modules/workflow/types";
import { useWorkflowCanvas } from "./hooks/use-workflow-canvas";
import { NODE_WIDTH, NODE_HEIGHT } from "./utils/layout";
import { AiAssistant } from "./ai-assistant";

interface Props {
  definitionId?: string;
}

export function WorkflowDesigner({ definitionId }: Props) {
  const router = useRouter();

  const canvas = useWorkflowCanvas();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!definitionId);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);

  // ── Load existing workflow ────────────────────────────────────────────

  useEffect(() => {
    if (!definitionId) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/v1/workflow-definitions/${definitionId}`);
        if (!res.ok) throw new Error("Failed to load workflow");
        const data = await res.json();
        canvas.loadFromDefinition({
          name: data.name ?? "",
          description: data.description ?? "",
          category: data.category ?? "general",
          triggerType: data.triggerType ?? "manual",
          cronExpression: data.cronExpression ?? "",
          steps: Array.isArray(data.steps) ? data.steps as StepDefinition[] : undefined,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [definitionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts (delete/backspace only — undo/redo/save handled by WorkflowToolbar) ────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas.selectedStepId) {
          canvas.deleteStep(canvas.selectedStepId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas.selectedStepId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validation ────────────────────────────────────────────────────────

  const hasErrors = canvas.validation.errors.length > 0;

  const validateAndShow = useCallback(() => {
    setShowValidation(true);
    return canvas.validation;
  }, [canvas.validation]);

  // ── Save ──────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const result = validateAndShow();
    if (!result.isValid) return false;

    setIsSaving(true);
    try {
      const stepDefs = canvas.toDefinitions();
      if (definitionId) {
        await updateWorkflowDefinition(definitionId, {
          name: canvas.name.trim(),
          description: canvas.description.trim() || undefined,
          category: canvas.category,
          steps: stepDefs,
        });
      } else {
        const res = await createWorkflowDefinition({
          name: canvas.name.trim(),
          description: canvas.description.trim() || undefined,
          category: canvas.category,
          steps: stepDefs,
        });
        router.push(`/automation-studio/designer/${res.id}`);
      }
      return true;
    } catch (e: any) {
      setError(e.message ?? "Failed to save workflow");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [canvas.name, canvas.description, canvas.category, canvas.toDefinitions, definitionId, router, validateAndShow]);

  // ── Run ───────────────────────────────────────────────────────────────

  const handleRun = useCallback(async () => {
    if (!definitionId) {
      const result = validateAndShow();
      if (!result.isValid) return;
      try {
        const stepDefs = canvas.toDefinitions();
        const res = await createWorkflowDefinition({
          name: canvas.name.trim(),
          description: canvas.description.trim() || undefined,
          category: canvas.category,
          steps: stepDefs,
        });
        router.push(`/automation-studio/workflows/${res.id}`);
      } catch (e: any) {
        setError(e.message);
      }
    } else {
      router.push(`/automation-studio/workflows/${definitionId}`);
    }
  }, [definitionId, canvas.name, canvas.description, canvas.category, canvas.toDefinitions, router, validateAndShow]);

  // ── Palette add step ──────────────────────────────────────────────────

  const handleAddStep = useCallback((item: StepPaletteItem) => {
    canvas.addStep(item.type);
  }, [canvas]);

  // ── Drag-and-drop reorder ─────────────────────────────────────────────

  const handleStepDragStart = useCallback((e: React.DragEvent, stepId: string) => {
    e.dataTransfer.setData("text/plain", `reorder:${stepId}`);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleStepDragOver = useCallback((e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStepId(stepId);
  }, []);

  const handleStepDragLeave = useCallback(() => {
    setDragOverStepId(null);
  }, []);

  const handleStepDrop = useCallback((e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    setDragOverStepId(null);
    const data = e.dataTransfer.getData("text/plain");
    if (data.startsWith("reorder:")) {
      const dragStepId = data.slice(8);
      canvas.reorderStep(dragStepId, targetStepId);
    } else {
      const type = data;
      canvas.addStepAt(type, targetStepId);
    }
  }, [canvas]);

  // ── Render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#d4af37]" />
          <span className="text-sm">Loading workflow...</span>
        </div>
      </div>
    );
  }

  if (error && !definitionId) {
    return (
      <div className="mx-auto max-w-md mt-20">
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p role="alert" className="text-sm text-red-300">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/automation-studio")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      {/* ── Toolbar ── */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/automation-studio")} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-[#d4af37]" />
            <span className="text-sm font-medium text-white">{definitionId ? "Edit Workflow" : "New Workflow"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WorkflowToolbar
            onUndo={canvas.undo}
            onRedo={canvas.redo}
            onSave={handleSave}
            canUndo={canvas.canUndo}
            canRedo={canvas.canRedo}
            saving={isSaving}
            onToggleMinimap={() => setShowMinimap(!showMinimap)}
            showMinimap={showMinimap}
          />

          {canvas.isDirty && <span className="text-xs text-amber-400">Unsaved</span>}

          <Button
            variant="ghost" size="sm" className="gap-1.5 text-xs text-emerald-400"
            onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleRun}>
            <Play className="h-3.5 w-3.5" />
            {definitionId ? "Run" : "Save & Run"}
          </Button>
        </div>
      </header>

      {/* ── Validation Banner ── */}
      {showValidation && (hasErrors || canvas.validation.warnings.length > 0) && (
        <div className={`flex items-center gap-2 border-b px-4 py-2 ${
          hasErrors
            ? "border-red-500/20 bg-red-950/30"
            : "border-amber-500/20 bg-amber-950/20"
        }`}>
          <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${
            hasErrors ? "text-red-400" : "text-amber-400"
          }`} />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {canvas.validation.errors.map((err, i) => (
              <span key={`e-${i}`} className="text-xs text-red-300">{err.message}</span>
            ))}
            {canvas.validation.warnings.map((warn, i) => (
              <span key={`w-${i}`} className="text-xs text-amber-300">{warn.message}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Step Palette */}
        <div className="w-56 shrink-0 border-r border-white/[0.06] bg-zinc-950/50 overflow-hidden">
          <StepPalette onAddStep={handleAddStep} />
        </div>

        {/* Canvas */}
        <WorkflowCanvas
          className="flex-1"
          selectedStepId={canvas.selectedStepId ?? undefined}
          onStepSelect={(id) => canvas.selectStep(id)}
          showMinimap={showMinimap}
        >
          <div
            className="min-h-full p-8"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData("text/plain");
              if (!data.startsWith("reorder:")) {
                canvas.addStep(data);
              }
            }}
          >
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Workflow Settings */}
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Workflow Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Workflow Name</Label>
                    <Input
                      value={canvas.name}
                      onChange={(e) => canvas.updateMetadata({ name: e.target.value })}
                      placeholder="e.g., Invoice Approval"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={canvas.category} onChange={(e) => canvas.updateMetadata({ category: e.target.value })}>
                      {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={canvas.description}
                    onChange={(e) => canvas.updateMetadata({ description: e.target.value })}
                    placeholder="Describe what this workflow does..."
                    className="h-16"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Trigger Type</Label>
                    <Select value={canvas.triggerType} onChange={(e) => canvas.updateMetadata({ triggerType: e.target.value })}>
                      {TRIGGER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>
                  {canvas.triggerType === "scheduled" && (
                    <div className="space-y-1.5">
                      <Label>Cron Expression</Label>
                      <Input
                        value={canvas.cronExpression}
                        onChange={(e) => canvas.updateMetadata({ cronExpression: e.target.value })}
                        placeholder="e.g., 0 9 * * 1-5"
                        className="h-9"
                      />
                      <p className="text-[10px] text-zinc-600">Every weekday at 9 AM</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Steps Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Steps ({canvas.steps.length})
                </h3>
              </div>

              {/* Steps Canvas */}
              <div className="relative">
                {canvas.steps.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700/50 bg-zinc-900/20 p-16 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      canvas.addStep(e.dataTransfer.getData("text/plain"));
                    }}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-white">Add your first step</h3>
                    <p className="mb-4 max-w-sm text-sm text-zinc-500">
                      Drag steps from the palette on the left, or click below to begin building your workflow.
                    </p>
                    <div className="flex gap-2">
                      {STEP_PALETTE.slice(0, 4).map((item) => (
                        <button
                          key={item.type}
                          onClick={() => canvas.addStep(item.type)}
                          className="rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-white/[0.15] hover:text-white"
                        >
                          + {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Connection lines */}
                    <svg className="absolute left-[116px] top-0 h-full w-2 pointer-events-none" style={{ transform: "translateX(-50%)" }}>
                      {canvas.steps.map((s, i) => {
                        if (i === canvas.steps.length - 1) return null;
                        const fromY = NODE_HEIGHT + 2;
                        const toY = 144 - 4;
                        return (
                          <line
                            key={`conn-${s.id}`}
                            x1="1" y1={fromY} x2="1" y2={toY}
                            stroke="rgba(212,175,55,0.2)"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                        );
                      })}
                    </svg>

                    {/* Step nodes */}
                    {canvas.steps.map((s, i) => {
                      const paletteItem = STEP_PALETTE.find((p) => p.type === s.type);
                      const isSelected = s.id === canvas.selectedStepId;
                      const isFirst = i === 0;
                      const isLast = i === canvas.steps.length - 1;
                      const isDragOver = dragOverStepId === s.id;

                      return (
                        <div
                          key={s.id}
                          className={`relative flex items-start gap-4 group transition-opacity ${
                            isDragOver ? "opacity-80" : ""
                          }`}
                          draggable
                          onDragStart={(e) => handleStepDragStart(e, s.id)}
                          onDragOver={(e) => handleStepDragOver(e, s.id)}
                          onDragLeave={handleStepDragLeave}
                          onDrop={(e) => handleStepDrop(e, s.id)}
                          onClick={() => canvas.selectStep(s.id)}
                        >
                          {/* Step indicator / connector dot */}
                          <div className="flex flex-col items-center pt-5">
                            {isSelected ? (
                              <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#d4af37]/15 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: paletteItem?.color ?? "#64748b" }}
                                />
                              </motion.div>
                            ) : (
                              <div
                                className={`flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-full border-2 transition-all ${
                                  isDragOver
                                    ? "border-[#d4af37]/60 bg-[#d4af37]/10"
                                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                                }`}
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: paletteItem?.color ?? "#64748b" }}
                                />
                              </div>
                            )}
                            {!isLast && (<div className="h-3 w-0.5 bg-gradient-to-b from-[#d4af37]/30 to-transparent" />)}
                          </div>

                          {/* Step card */}
                          <div
                            className={`flex-1 rounded-xl border p-4 transition-all ${
                              isSelected
                                ? "border-[#d4af37]/50 bg-[#d4af37]/5 shadow-lg shadow-black/30"
                                : isDragOver
                                  ? "border-[#d4af37]/30 bg-[#d4af37]/5"
                                  : "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/[0.12]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Drag handle */}
                              <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors">
                                <GripVertical className="h-3.5 w-3.5" />
                              </div>

                              {/* Step icon */}
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${paletteItem?.color ?? "#64748b"}15` }}
                              >
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: paletteItem?.color ?? "#64748b" }}
                                />
                              </div>

                              {/* Step info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white">{s.label}</p>
                                  <span className="text-[10px] text-zinc-600">({paletteItem?.label ?? s.type})</span>
                                </div>
                                {s.dependsOn.length > 0 && (
                                  <p className="text-[10px] text-zinc-600 mt-0.5">
                                    After: {canvas.steps.filter((ss) => s.dependsOn.includes(ss.id)).map((ss) => ss.label).join(", ") || "—"}
                                  </p>
                                )}
                              </div>

                              {/* Move / delete actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isFirst && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); canvas.moveStep(s.id, "up"); }}
                                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-white"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {!isLast && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); canvas.moveStep(s.id, "down"); }}
                                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-white"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add step button */}
                    <div className="relative flex items-start gap-4 pt-2">
                      <div className="flex flex-col items-center pt-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-zinc-700 bg-zinc-900/30">
                          <Plus className="h-4 w-4 text-zinc-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            if (STEP_PALETTE.length > 0) canvas.addStep(STEP_PALETTE[0].type);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700/50 bg-zinc-900/10 px-4 py-6 text-xs text-zinc-600 transition-colors hover:border-zinc-600 hover:text-zinc-400"
                        >
                          <Plus className="h-4 w-4" />
                          Add Step
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </WorkflowCanvas>

        {/* Properties Panel */}
        <div className="w-72 shrink-0 border-l border-white/[0.06] bg-zinc-950/50 overflow-hidden">
          {canvas.selectedStep ? (
            <PropertyPanel
              step={canvas.selectedStep}
              onChange={(updated) => {
                canvas.updateStep(updated);
              }}
              onDelete={(stepId) => canvas.deleteStep(stepId)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <Settings className="mx-auto mb-3 h-6 w-6 text-zinc-600" />
                <p className="text-xs text-zinc-500">Select a step to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <AiAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onAddStep={(item) => canvas.addStep(item.type)}
        onSetName={(name) => canvas.updateMetadata({ name })}
        onSetTrigger={(trigger) => canvas.updateMetadata({ triggerType: trigger })}
        onSetCategory={(category) => canvas.updateMetadata({ category })}
        currentStepCount={canvas.steps.length}
      />
    </div>
  );
}
