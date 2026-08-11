/**
 * Phase 23 — Enterprise Workflow Engine: Ownership
 *
 * Tracks who owns a workflow end-to-end, supports transfers, and
 * provides segregation-of-duties guardrails. Ownership history is
 * retained for audit.
 */

export interface OwnershipEntry {
  ownerId: string;
  from: string;
  to: string | null;
  by: string;
  reason?: string;
}

export interface OwnershipState {
  ownerId: string | null;
  history: OwnershipEntry[];
}

export class OwnershipEngine {
  private readonly states = new Map<string, OwnershipState>();

  setOwner(instanceId: string, ownerId: string, by: string, at: string, reason?: string): void {
    const existing = this.states.get(instanceId);
    if (existing && existing.ownerId === ownerId) return;
    if (existing && existing.history.length > 0) {
      const last = existing.history[existing.history.length - 1];
      if (last.to === null) last.to = at;
    }
    const history = existing?.history ?? [];
    history.push({ ownerId, from: at, to: null, by, reason });
    this.states.set(instanceId, { ownerId, history });
  }

  transfer(instanceId: string, from: string, to: string, by: string, at: string, reason?: string): void {
    const existing = this.states.get(instanceId);
    if (existing?.ownerId !== from) {
      throw new Error(`Cannot transfer ${instanceId}: current owner is not ${from}`);
    }
    this.setOwner(instanceId, to, by, at, reason);
  }

  getOwner(instanceId: string): string | null {
    return this.states.get(instanceId)?.ownerId ?? null;
  }

  isOwner(instanceId: string, userId: string): boolean {
    return this.getOwner(instanceId) === userId;
  }

  getHistory(instanceId: string): OwnershipEntry[] {
    return this.states.get(instanceId)?.history ?? [];
  }

  /** SoD guard: the initiator must not also own an approval-required workflow. */
  assertNoConflict(instanceId: string, initiatorId: string, requiresDecision: boolean): void {
    if (requiresDecision && this.getOwner(instanceId) === initiatorId) {
      throw new Error(
        "Segregation of duties: initiator cannot own a decision-required workflow",
      );
    }
  }
}
