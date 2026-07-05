import type { StepExecutor, StepType } from "./types";

class StepRegistry {
  private executors = new Map<StepType, StepExecutor>();

  register(executor: StepExecutor): void {
    if (this.executors.has(executor.type)) return;
    this.executors.set(executor.type, executor);
  }

  get(type: StepType): StepExecutor | undefined {
    return this.executors.get(type);
  }

  getAll(): StepExecutor[] {
    return Array.from(this.executors.values());
  }

  has(type: StepType): boolean {
    return this.executors.has(type);
  }
}

export const stepRegistry = new StepRegistry();
