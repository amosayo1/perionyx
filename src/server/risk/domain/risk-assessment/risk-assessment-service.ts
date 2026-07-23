import type { RiskAssessment } from "../../types";

export class RiskAssessmentService {
  private items = new Map<string, RiskAssessment>();

  add(item: RiskAssessment): RiskAssessment {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskAssessment | undefined {
    return this.items.get(id);
  }

  getAll(): RiskAssessment[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskAssessment>): RiskAssessment | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByRegister(registerId: string): RiskAssessment[] {
    return this.getAll().filter(a => a.registerId === registerId);
  }

  getLatestAssessment(registerId: string): RiskAssessment | undefined {
    return this.getByRegister(registerId).sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())[0];
  }

  computeInherentScore(likelihood: number, impact: number): number {
    return Math.round((likelihood * impact) * 100) / 100;
  }

  computeResidualScore(likelihood: number, impact: number): number {
    return Math.round((likelihood * impact) * 100) / 100;
  }

  getByDateRange(start: Date, end: Date): RiskAssessment[] {
    return this.getAll().filter(a => a.assessmentDate >= start && a.assessmentDate <= end);
  }

  count(): number {
    return this.items.size;
  }
}
