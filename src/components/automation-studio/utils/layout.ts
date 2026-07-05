import type { DesignerStep } from "@/components/automation-studio/types";
import type { StepDefinition } from "@/modules/workflow/types";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 72;
export const VERTICAL_GAP = 140;
export const HORIZONTAL_GAP = 320;

export interface LayoutOptions {
  startX?: number;
  startY?: number;
  verticalGap?: number;
  horizontalGap?: number;
}

export function applyAutoLayout(steps: DesignerStep[], options?: LayoutOptions): DesignerStep[] {
  const startX = options?.startX ?? 280;
  const startY = options?.startY ?? 80;
  const gap = options?.verticalGap ?? VERTICAL_GAP;

  return steps.map((s, i) => ({
    ...s,
    position: { x: startX, y: startY + i * gap },
  }));
}

export interface BranchLayout {
  x: number;
  y: number;
}

export function layoutBranches(
  mainSteps: DesignerStep[],
  branches: Map<string, DesignerStep[]>,
): Map<string, BranchLayout[]> {
  const result = new Map<string, BranchLayout[]>();
  for (const [parentId, branchSteps] of branches) {
    const parentIndex = mainSteps.findIndex((s) => s.id === parentId);
    const parentY = parentIndex >= 0 ? mainSteps[parentIndex].position.y : 80;
    const layouts: BranchLayout[] = branchSteps.map((_, i) => ({
      x: 280 + NODE_WIDTH + HORIZONTAL_GAP,
      y: parentY + i * VERTICAL_GAP,
    }));
    result.set(parentId, layouts);
  }
  return result;
}

export function calculateCanvasSize(
  steps: DesignerStep[],
): { width: number; height: number } {
  if (steps.length === 0) return { width: 800, height: 400 };
  const maxX = Math.max(...steps.map((s) => s.position.x + NODE_WIDTH));
  const maxY = Math.max(...steps.map((s) => s.position.y + NODE_HEIGHT));
  return {
    width: Math.max(maxX + 80, 800),
    height: Math.max(maxY + 80, 400),
  };
}

export function getStepConnectorPoints(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x1: number; y1: number; x2: number; y2: number } {
  const x1 = from.x + NODE_WIDTH / 2;
  const y1 = from.y + NODE_HEIGHT;
  const x2 = to.x + NODE_WIDTH / 2;
  const y2 = to.y;
  return { x1, y1, x2, y2 };
}

export function buildConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const { x1, y1, x2, y2 } = getStepConnectorPoints(from, to);
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}
