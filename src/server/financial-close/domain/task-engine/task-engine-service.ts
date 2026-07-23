import type { CloseTask, CloseTaskStatus, CloseTaskCategory, CloseTaskPriority } from "../../types";

export class TaskEngineService {
  private tasks = new Map<string, CloseTask>();

  add(task: CloseTask): CloseTask {
    this.tasks.set(task.id, task);
    return task;
  }

  get(id: string): CloseTask | undefined {
    return this.tasks.get(id);
  }

  getAll(): CloseTask[] {
    return Array.from(this.tasks.values());
  }

  getByPeriod(periodId: string): CloseTask[] {
    return this.getAll().filter((t) => t.periodId === periodId);
  }

  getByStatus(status: CloseTaskStatus): CloseTask[] {
    return this.getAll().filter((t) => t.status === status);
  }

  getByCategory(category: CloseTaskCategory): CloseTask[] {
    return this.getAll().filter((t) => t.category === category);
  }

  getByPriority(priority: CloseTaskPriority): CloseTask[] {
    return this.getAll().filter((t) => t.priority === priority);
  }

  getByAssignee(assignee: string): CloseTask[] {
    return this.getAll().filter((t) => t.assignedTo === assignee);
  }

  getOverdue(): CloseTask[] {
    const now = new Date();
    return this.getAll().filter((t) => t.dueDate < now && t.status !== "completed" && t.status !== "skipped");
  }

  getBlocked(): CloseTask[] {
    return this.getAll().filter((t) => t.status === "blocked" || (t.dependsOn.length > 0 && t.dependsOn.some((d) => { const dt = this.tasks.get(d); return dt && dt.status !== "completed"; })));
  }

  search(query: string): CloseTask[] {
    const q = query.toLowerCase();
    return this.getAll().filter((t) => t.title.toLowerCase().includes(q) || t.taskCode.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q));
  }

  count(): number {
    return this.tasks.size;
  }

  update(id: string, updates: Partial<CloseTask>): CloseTask {
    const existing = this.tasks.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.tasks.delete(id);
  }

  complete(id: string, completedDate?: Date): CloseTask {
    return this.update(id, { status: "completed", completedDate: completedDate ?? new Date(), actualHours: this.tasks.get(id)?.estimatedHours });
  }

  block(id: string, reason?: string): CloseTask {
    return this.update(id, { status: "blocked", notes: reason });
  }

  assign(id: string, assignee: string): CloseTask {
    return this.update(id, { assignedTo: assignee });
  }

  getTasksByDependency(taskId: string): CloseTask[] {
    const task = this.tasks.get(taskId);
    if (!task) return [];
    return task.dependsOn.map((d) => this.tasks.get(d)).filter((t): t is CloseTask => t !== undefined);
  }

  getCompletionRate(periodId: string): number {
    const periodTasks = this.getByPeriod(periodId);
    if (periodTasks.length === 0) return 0;
    const completed = periodTasks.filter((t) => t.status === "completed").length;
    return (completed / periodTasks.length) * 100;
  }
}
