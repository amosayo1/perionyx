import type { CloseRecommendation, CloseTask, ExceptionRecord, ClosePeriod, VarianceAnalysisRecord } from "../../types";

export class RecommendationsService {
  private recommendations = new Map<string, CloseRecommendation>();

  add(rec: CloseRecommendation): CloseRecommendation {
    this.recommendations.set(rec.id, rec);
    return rec;
  }

  get(id: string): CloseRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAll(): CloseRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  getByType(type: string): CloseRecommendation[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByPriority(priority: string): CloseRecommendation[] {
    return this.getAll().filter((r) => r.priority === priority);
  }

  getActive(): CloseRecommendation[] {
    return this.getAll().filter((r) => r.status === "active");
  }

  count(): number {
    return this.recommendations.size;
  }

  update(id: string, updates: Partial<CloseRecommendation>): CloseRecommendation {
    const existing = this.recommendations.get(id);
    if (!existing) throw new Error(`Recommendation ${id} not found`);
    const updated = { ...existing, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.recommendations.delete(id);
  }

  dismiss(id: string): void {
    this.update(id, { status: "dismissed" });
  }

  implement(id: string): void {
    this.update(id, { status: "implemented" });
  }

  generateTaskRecommendation(task: CloseTask): CloseRecommendation {
    return {
      id: `rec-task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "task", title: `Task overdue: ${task.title}`,
      description: `Task ${task.taskCode} is due ${task.dueDate.toLocaleDateString()} and still ${task.status}. Priority: ${task.priority}.`,
      priority: task.priority === "critical" ? "critical" : task.priority === "high" ? "high" : "medium",
      status: "active", impact: `Affects close timeline by ${task.estimatedHours} hours`, effort: "medium",
      periodId: task.periodId, entityId: task.id, companyId: task.companyId, createdAt: new Date(),
    };
  }

  generateExceptionRecommendation(exception: ExceptionRecord): CloseRecommendation {
    return {
      id: `rec-exc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "risk", title: `Exception: ${exception.title}`,
      description: exception.description,
      priority: exception.severity === "blocker" ? "critical" : exception.severity === "critical" ? "high" : "medium",
      status: "active", impact: "Close process risk", effort: "medium",
      periodId: exception.periodId, entityId: exception.id, companyId: exception.companyId, createdAt: new Date(),
    };
  }

  generateVarianceRecommendation(variance: VarianceAnalysisRecord): CloseRecommendation {
    return {
      id: `rec-var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "variance", title: `Significant variance: ${variance.accountName}`,
      description: `${variance.accountName} (${variance.accountCode}) has ${variance.variancePercent.toFixed(1)}% variance. Current: ${variance.currentPeriodAmount}, Prior: ${variance.priorPeriodAmount}.`,
      priority: variance.isSignificant ? "high" : "medium",
      status: "active", impact: `Variance of ${Math.abs(variance.variance).toLocaleString()}`, effort: "medium",
      periodId: variance.periodId, entityId: variance.id, companyId: variance.companyId, createdAt: new Date(),
    };
  }

  generateAllRecommendations(
    tasks: CloseTask[], exceptions: ExceptionRecord[], variances: VarianceAnalysisRecord[],
    _periods: ClosePeriod[],
  ): CloseRecommendation[] {
    const recs: CloseRecommendation[] = [];
    const overdueTasks = tasks.filter((t) => new Date() > t.dueDate && t.status !== "completed" && t.status !== "skipped");
    for (const t of overdueTasks.slice(0, 20)) recs.push(this.generateTaskRecommendation(t));
    for (const e of exceptions.filter((ex) => ex.status === "open" || ex.status === "inProgress")) recs.push(this.generateExceptionRecommendation(e));
    for (const v of variances.filter((va) => va.isSignificant).slice(0, 20)) recs.push(this.generateVarianceRecommendation(v));
    return recs;
  }
}
