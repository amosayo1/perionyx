import type { SyncState, SyncStateTransition, SyncJobInstance } from "../types";

const VALID_TRANSITIONS: Record<SyncState, SyncState[]> = {
  QUEUED: ["PREPARING", "CANCELLED"],
  PREPARING: ["AUTHENTICATING", "CANCELLED"],
  AUTHENTICATING: ["DOWNLOADING", "RETRYING", "FAILED", "CANCELLED"],
  DOWNLOADING: ["PROCESSING", "RETRYING", "FAILED", "CANCELLED"],
  PROCESSING: ["RECONCILING", "RETRYING", "FAILED", "CANCELLED"],
  RECONCILING: ["COMPLETED", "PARTIAL_SUCCESS", "RETRYING", "FAILED", "CANCELLED"],
  COMPLETED: [],
  PARTIAL_SUCCESS: [],
  RETRYING: ["PREPARING", "FAILED", "CANCELLED"],
  FAILED: [],
  CANCELLED: [],
};

export class SyncStateMachine {
  private instances = new Map<string, SyncJobInstance>();

  getState(jobId: string): SyncState | null {
    return this.instances.get(jobId)?.state ?? null;
  }

  getInstance(jobId: string): SyncJobInstance | null {
    return this.instances.get(jobId) ?? null;
  }

  getAllInstances(): SyncJobInstance[] {
    return Array.from(this.instances.values());
  }

  getByState(state: SyncState): SyncJobInstance[] {
    return this.getAllInstances().filter((i) => i.state === state);
  }

  registerInstance(instance: SyncJobInstance): void {
    this.instances.set(instance.id, {
      ...instance,
      stateHistory: [],
    });
  }

  transition(
    jobId: string,
    to: SyncState,
    reason: string,
    triggeredBy: string,
  ): SyncJobInstance {
    const instance = this.instances.get(jobId);
    if (!instance) {
      throw new Error(`Sync job ${jobId} not found`);
    }

    const allowed = VALID_TRANSITIONS[instance.state];
    if (!allowed.includes(to)) {
      throw new Error(
        `Invalid state transition: ${instance.state} → ${to}. Allowed: ${allowed.join(", ")}`,
      );
    }

    const transition: SyncStateTransition = {
      from: instance.state,
      to,
      timestamp: new Date().toISOString(),
      reason,
      triggeredBy,
    };

    const now = new Date().toISOString();

    instance.state = to;
    instance.stateHistory = [...instance.stateHistory, transition];

    if (to === "COMPLETED" || to === "PARTIAL_SUCCESS") {
      instance.completedAt = now;
    }

    if (to === "FAILED" || to === "CANCELLED") {
      instance.completedAt = now;
    }

    if (to === "COMPLETED" || to === "PARTIAL_SUCCESS" || to === "FAILED" || to === "CANCELLED") {
      if (instance.startedAt && instance.completedAt) {
        instance.durationMs =
          new Date(instance.completedAt).getTime() - new Date(instance.startedAt).getTime();
      }
    }

    if (to === "RETRYING") {
      instance.retryCount += 1;
    }

    switch (to) {
      case "PREPARING":
      case "AUTHENTICATING":
      case "DOWNLOADING":
      case "PROCESSING":
      case "RECONCILING": {
        if (!instance.startedAt) {
          instance.startedAt = now;
        }
        break;
      }
    }

    this.instances.set(jobId, { ...instance });
    return instance;
  }

  canTransition(from: SyncState, to: SyncState): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  getNextStates(state: SyncState): SyncState[] {
    return VALID_TRANSITIONS[state] ?? [];
  }

  isTerminal(state: SyncState): boolean {
    return VALID_TRANSITIONS[state].length === 0;
  }

  getRunningCount(): number {
    return this.getAllInstances().filter(
      (i) =>
        i.state !== "COMPLETED" &&
        i.state !== "PARTIAL_SUCCESS" &&
        i.state !== "FAILED" &&
        i.state !== "CANCELLED",
    ).length;
  }
}

export const syncStateMachine = new SyncStateMachine();