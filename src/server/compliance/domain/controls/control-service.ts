import type { Control, ControlTest, ControlTestResult } from "../../types";

export class ControlService {
  private controls = new Map<string, Control>();

  add(control: Control): Control {
    this.controls.set(control.id, control);
    return control;
  }

  get(id: string): Control | undefined {
    return this.controls.get(id);
  }

  getAll(): Control[] {
    return Array.from(this.controls.values());
  }

  getByPolicy(policyId: string): Control[] {
    return this.getAll().filter(c => c.policyId === policyId);
  }

  getByType(type: Control["type"]): Control[] {
    return this.getAll().filter(c => c.type === type);
  }

  getByOwner(owner: string): Control[] {
    return this.getAll().filter(c => c.owner === owner);
  }

  getFailed(): Control[] {
    return this.getAll().filter(c => c.lastResult === "fail");
  }

  search(query: string): Control[] {
    const q = query.toLowerCase();
    return this.getAll().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<Control>): Control | undefined {
    const existing = this.controls.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.controls.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.controls.delete(id);
  }

  count(): number {
    return this.controls.size;
  }
}

export class ControlTestService {
  private tests = new Map<string, ControlTest>();

  add(test: ControlTest): ControlTest {
    this.tests.set(test.id, test);
    return test;
  }

  get(id: string): ControlTest | undefined {
    return this.tests.get(id);
  }

  getAll(): ControlTest[] {
    return Array.from(this.tests.values());
  }

  getByControl(controlId: string): ControlTest[] {
    return this.getAll().filter(t => t.controlId === controlId);
  }

  getByResult(result: ControlTestResult): ControlTest[] {
    return this.getAll().filter(t => t.result === result);
  }

  getByTester(tester: string): ControlTest[] {
    return this.getAll().filter(t => t.tester === tester);
  }

  getFailed(): ControlTest[] {
    return this.getAll().filter(t => t.result === "fail");
  }

  update(id: string, data: Partial<ControlTest>): ControlTest | undefined {
    const existing = this.tests.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.tests.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.tests.delete(id);
  }

  count(): number {
    return this.tests.size;
  }
}
