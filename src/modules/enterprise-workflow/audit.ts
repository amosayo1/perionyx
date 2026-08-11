/**
 * Phase 23 — Enterprise Workflow Engine: Audit
 *
 * Append-only audit trail (bounded). Every state transition, delegation,
 * escalation, SLA change, decision attachment and notification is
 * recorded with actor, timestamps, previous/new state, reason, evidence
 * and decision identifiers. There is no update or delete path.
 */

import { BoundedRingBuffer } from "@/lib/bounded-ring-buffer";
import type { AuditEntry, AuditEntryType, SlaStatus, WorkflowState } from "./types";

export interface AuditRecordInput {
  type: AuditEntryType;
  tenantId: string;
  workflowId: string;
  instanceId?: string | null;
  stepId?: string | null;
  actor: string;
  at: string;
  previousState?: WorkflowState | SlaStatus | string | null;
  newState?: WorkflowState | SlaStatus | string | null;
  reason?: string;
  evidenceIds?: string[];
  decisionId?: string | null;
  metadata?: Record<string, unknown>;
}

export class AuditTrail {
  private readonly entries = new BoundedRingBuffer<AuditEntry>(10_000);
  private seq = 0;

  record(input: AuditRecordInput): AuditEntry {
    this.seq += 1;
    const entry: AuditEntry = {
      id: `aud-${this.seq}`,
      seq: this.seq,
      type: input.type,
      tenantId: input.tenantId,
      workflowId: input.workflowId,
      instanceId: input.instanceId ?? null,
      stepId: input.stepId ?? null,
      actor: input.actor,
      at: input.at,
      previousState: input.previousState ?? null,
      newState: input.newState ?? null,
      reason: input.reason ?? "",
      evidenceIds: input.evidenceIds ?? [],
      decisionId: input.decisionId ?? null,
      metadata: input.metadata,
    };
    this.entries.push(entry);
    return entry;
  }

  getInstanceTrail(instanceId: string): AuditEntry[] {
    return this.entries.filter((e) => e.instanceId === instanceId);
  }

  getWorkflowTrail(workflowId: string): AuditEntry[] {
    return this.entries.filter((e) => e.workflowId === workflowId);
  }

  getTenantTrail(tenantId: string): AuditEntry[] {
    return this.entries.filter((e) => e.tenantId === tenantId);
  }

  getRecent(n: number): AuditEntry[] {
    return this.entries.getLatest(n);
  }

  get size(): number {
    return this.entries.size;
  }
}
