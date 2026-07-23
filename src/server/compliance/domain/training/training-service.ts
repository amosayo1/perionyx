import type { Training } from "../../types";

export class TrainingService {
  private trainings = new Map<string, Training>();

  add(training: Training): Training {
    this.trainings.set(training.id, training);
    return training;
  }

  get(id: string): Training | undefined {
    return this.trainings.get(id);
  }

  getAll(): Training[] {
    return Array.from(this.trainings.values());
  }

  getByFramework(frameworkId: string): Training[] {
    return this.getAll().filter(t => t.frameworkId === frameworkId);
  }

  getByStatus(status: Training["status"]): Training[] {
    return this.getAll().filter(t => t.status === status);
  }

  getByRequiredFor(requiredFor: string): Training[] {
    return this.getAll().filter(t => t.requiredFor === requiredFor);
  }

  getRequired(): Training[] {
    return this.getAll().filter(t => t.status === "required");
  }

  getOverdue(): Training[] {
    return this.getAll().filter(t => t.status === "overdue" || (t.status === "required" && new Date(t.dueDate) < new Date()));
  }

  getCompleted(): Training[] {
    return this.getAll().filter(t => t.status === "completed");
  }

  update(id: string, data: Partial<Training>): Training | undefined {
    const existing = this.trainings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.trainings.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.trainings.delete(id);
  }

  count(): number {
    return this.trainings.size;
  }
}
