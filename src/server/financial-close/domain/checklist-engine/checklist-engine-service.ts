import type { CloseChecklist, ChecklistItem } from "../../types";

export class ChecklistEngineService {
  private checklists = new Map<string, CloseChecklist>();

  add(checklist: CloseChecklist): CloseChecklist {
    this.checklists.set(checklist.id, checklist);
    return checklist;
  }

  get(id: string): CloseChecklist | undefined {
    return this.checklists.get(id);
  }

  getAll(): CloseChecklist[] {
    return Array.from(this.checklists.values());
  }

  getByPeriod(periodId: string): CloseChecklist[] {
    return this.getAll().filter((c) => c.periodId === periodId);
  }

  getByCategory(category: string): CloseChecklist[] {
    return this.getAll().filter((c) => c.category === category);
  }

  count(): number {
    return this.checklists.size;
  }

  update(id: string, updates: Partial<CloseChecklist>): CloseChecklist {
    const existing = this.checklists.get(id);
    if (!existing) throw new Error(`Checklist ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.checklists.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.checklists.delete(id);
  }

  completeItem(checklistId: string, itemId: string, completedBy: string): CloseChecklist {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist ${checklistId} not found`);
    const items = checklist.items.map((item) =>
      item.id === itemId ? { ...item, isCompleted: true, completedBy, completedAt: new Date() } : item,
    );
    return this.update(checklistId, { items });
  }

  uncompleteItem(checklistId: string, itemId: string): CloseChecklist {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist ${checklistId} not found`);
    const items = checklist.items.map((item) =>
      item.id === itemId ? { ...item, isCompleted: false, completedBy: undefined, completedAt: undefined } : item,
    );
    return this.update(checklistId, { items });
  }

  addItem(checklistId: string, item: ChecklistItem): CloseChecklist {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist ${checklistId} not found`);
    return this.update(checklistId, { items: [...checklist.items, item] });
  }

  getCompletionRate(checklistId: string): number {
    const checklist = this.checklists.get(checklistId);
    if (!checklist || checklist.items.length === 0) return 0;
    return (checklist.items.filter((i) => i.isCompleted).length / checklist.items.length) * 100;
  }

  getOverallCompletionRate(periodId: string): { total: number; completed: number; rate: number } {
    const checklists = this.getByPeriod(periodId);
    let total = 0;
    let completed = 0;
    for (const cl of checklists) {
      total += cl.items.length;
      completed += cl.items.filter((i) => i.isCompleted).length;
    }
    return { total, completed, rate: total > 0 ? (completed / total) * 100 : 0 };
  }
}
