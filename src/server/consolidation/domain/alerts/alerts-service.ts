import type { ConsolidationAlert, AlertCategory, AlertSeverity, ConsolidationRun, IntercompanyRecord, ConsolidationAdjustment, LegalEntity } from "../../types";

export class AlertsService {
  private alerts = new Map<string, ConsolidationAlert>();

  add(alert: ConsolidationAlert): ConsolidationAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  get(id: string): ConsolidationAlert | undefined {
    return this.alerts.get(id);
  }

  getAll(): ConsolidationAlert[] {
    return Array.from(this.alerts.values());
  }

  getByType(type: AlertCategory): ConsolidationAlert[] {
    return this.getAll().filter((a) => a.type === type);
  }

  getBySeverity(severity: AlertSeverity): ConsolidationAlert[] {
    return this.getAll().filter((a) => a.severity === severity);
  }

  getUnread(): ConsolidationAlert[] {
    return this.getAll().filter((a) => !a.isRead);
  }

  getUnresolved(): ConsolidationAlert[] {
    return this.getAll().filter((a) => !a.isResolved);
  }

  getByConsolidationRun(runId: string): ConsolidationAlert[] {
    return this.getAll().filter((a) => a.consolidationRunId === runId);
  }

  getByEntity(entityId: string): ConsolidationAlert[] {
    return this.getAll().filter((a) => a.entityId === entityId);
  }

  count(): number {
    return this.alerts.size;
  }

  update(id: string, updates: Partial<ConsolidationAlert>): ConsolidationAlert {
    const existing = this.alerts.get(id);
    if (!existing) throw new Error(`Alert ${id} not found`);
    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.alerts.delete(id);
  }

  acknowledge(id: string): void {
    this.update(id, { isRead: true, acknowledgedAt: new Date() });
  }

  resolve(id: string): void {
    this.update(id, { isResolved: true, resolvedAt: new Date() });
  }

  generateConsolidationAlerts(
    runs: ConsolidationRun[], icRecords: IntercompanyRecord[],
    adjustments: ConsolidationAdjustment[], entities: LegalEntity[],
  ): ConsolidationAlert[] {
    const alerts: ConsolidationAlert[] = [];
    const now = new Date();

    for (const run of runs) {
      if (run.status === "draft" || run.status === "dataCollection") {
        const daysSinceStart = Math.round((now.getTime() - run.startDate.getTime()) / 86400000);
        if (daysSinceStart > 5) {
          alerts.push({
            id: `alert-run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: "consolidation",
            severity: daysSinceStart > 10 ? "critical" : "warning",
            title: `Run stalled: ${run.label}`,
            message: `Run ${run.label} has been in ${run.status} status for ${daysSinceStart} days. Progress: ${run.completedSteps}/${run.totalSteps}.`,
            consolidationRunId: run.id,
            isRead: false,
            isResolved: false,
            companyId: run.companyId,
            createdAt: new Date(),
          });
        }
      }

      if (run.status === "review" && run.reviewNotes) {
        alerts.push({
          id: `alert-review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "consolidation",
          severity: "warning",
          title: `Review required: ${run.label}`,
          message: `Run ${run.label} is in review with notes: ${run.reviewNotes}`,
          consolidationRunId: run.id,
          isRead: false,
          isResolved: false,
          companyId: run.companyId,
          createdAt: new Date(),
        });
      }
    }

    const unmatched = icRecords.filter((r) => r.status === "unmatched");
    for (const r of unmatched.slice(0, 10)) {
      alerts.push({
        id: `alert-ic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "elimination",
        severity: Math.abs(r.difference) > 100000 ? "critical" : Math.abs(r.difference) > 10000 ? "warning" : "info",
        title: `Unmatched IC: ${r.intercompanyType}`,
        message: `${r.fromEntityId} -> ${r.toEntityId}: ${r.fromAmount} ${r.currency} (diff: ${r.difference})`,
        consolidationRunId: r.consolidationRunId,
        entityId: r.fromEntityId,
        isRead: false,
        isResolved: false,
        companyId: r.companyId,
        createdAt: new Date(),
      });
    }

    const pendingAdj = adjustments.filter((a) => a.status === "draft" || a.status === "review");
    for (const a of pendingAdj) {
      const daysSinceCreated = Math.round((now.getTime() - a.createdAt.getTime()) / 86400000);
      if (daysSinceCreated > 3) {
        alerts.push({
          id: `alert-adj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "consolidation",
          severity: daysSinceCreated > 7 ? "critical" : "warning",
          title: `Pending adjustment: ${a.description}`,
          message: `Adjustment ${a.description} (${a.adjustmentType}) has been ${a.status} for ${daysSinceCreated} days. Amount: ${a.amount} ${a.currency}.`,
          consolidationRunId: a.consolidationRunId,
          entityId: a.entityId,
          isRead: false,
          isResolved: false,
          companyId: a.companyId,
          createdAt: new Date(),
        });
      }
    }

    for (const run of runs) {
      const entitiesMissing = run.entitiesIncluded.filter((ei) => !run.entitiesCompleted.includes(ei));
      const missingNames = entities.filter((e) => entitiesMissing.includes(e.id));
      if (missingNames.length > 0) {
        for (const e of entities.filter((en) => entitiesMissing.includes(en.id)).slice(0, 10)) {
          alerts.push({
            id: `alert-entity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: "entity",
            severity: "warning",
            title: `Entity not submitted: ${e.legalName}`,
            message: `Entity ${e.legalName} (${e.entityCode}) has not completed data submission for run ${run.label}.`,
            consolidationRunId: run.id,
            entityId: e.id,
            isRead: false,
            isResolved: false,
            companyId: run.companyId,
            createdAt: new Date(),
          });
        }
      }
    }

    for (const run of runs) {
      const daysSinceStart = Math.round((now.getTime() - run.startDate.getTime()) / 86400000);
      const maxExpected = run.runType === "monthly" ? 10 : run.runType === "quarterly" ? 20 : 30;
      if (daysSinceStart > maxExpected && run.status !== "approved" && run.status !== "locked") {
        alerts.push({
          id: `alert-timeline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "deadline",
          severity: daysSinceStart > maxExpected * 1.5 ? "emergency" : "critical",
          title: `Consolidation timeline risk: ${run.label}`,
          message: `Run ${run.label} has been in progress for ${daysSinceStart} days (max expected: ${maxExpected}). Status: ${run.status}.`,
          consolidationRunId: run.id,
          isRead: false,
          isResolved: false,
          companyId: run.companyId,
          createdAt: new Date(),
        });
      }
    }

    return alerts;
  }
}
