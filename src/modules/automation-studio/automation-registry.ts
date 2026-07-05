import type {
  AutomationSchedule,
  ApprovalMatrixRule,
  BusinessRule,
  RegistryState,
  UpdateApprovalMatrixRuleInput,
  UpdateBusinessRuleInput,
  UpdateScheduleInput,
} from "./types";

export class AutomationRegistry {
  private schedules = new Map<string, AutomationSchedule>();
  private approvalRules = new Map<string, ApprovalMatrixRule>();
  private businessRules = new Map<string, BusinessRule>();

  // ── Schedules ─────────────────────────────────────────────────────────

  listSchedules(companyId: string, templateId?: string): AutomationSchedule[] {
    const all = Array.from(this.schedules.values());
    return all.filter(
      (s) => s.companyId === companyId && (!templateId || s.templateId === templateId),
    );
  }

  getSchedule(id: string): AutomationSchedule | undefined {
    return this.schedules.get(id);
  }

  registerSchedule(schedule: AutomationSchedule): void {
    this.schedules.set(schedule.id, schedule);
  }

  updateSchedule(id: string, data: UpdateScheduleInput): AutomationSchedule | null {
    const existing = this.schedules.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.schedules.set(id, updated);
    return updated;
  }

  unregisterSchedule(id: string): boolean {
    return this.schedules.delete(id);
  }

  // ── Approval Matrix Rules ─────────────────────────────────────────────

  listApprovalRules(companyId: string): ApprovalMatrixRule[] {
    return Array.from(this.approvalRules.values()).filter((r) => r.companyId === companyId);
  }

  getApprovalRule(id: string): ApprovalMatrixRule | undefined {
    return this.approvalRules.get(id);
  }

  registerApprovalRule(rule: ApprovalMatrixRule): void {
    this.approvalRules.set(rule.id, rule);
  }

  updateApprovalRule(id: string, data: UpdateApprovalMatrixRuleInput): ApprovalMatrixRule | null {
    const existing = this.approvalRules.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.approvalRules.set(id, updated);
    return updated;
  }

  unregisterApprovalRule(id: string): boolean {
    return this.approvalRules.delete(id);
  }

  // ── Business Rules ────────────────────────────────────────────────────

  listBusinessRules(companyId: string, category?: string): BusinessRule[] {
    let rules = Array.from(this.businessRules.values()).filter((r) => r.companyId === companyId);
    if (category) {
      rules = rules.filter((r) => r.category === category);
    }
    return rules;
  }

  getBusinessRule(id: string): BusinessRule | undefined {
    return this.businessRules.get(id);
  }

  registerBusinessRule(rule: BusinessRule): void {
    this.businessRules.set(rule.id, rule);
  }

  updateBusinessRule(id: string, data: UpdateBusinessRuleInput): BusinessRule | null {
    const existing = this.businessRules.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.businessRules.set(id, updated);
    return updated;
  }

  unregisterBusinessRule(id: string): boolean {
    return this.businessRules.delete(id);
  }

  // ── Registry Health ───────────────────────────────────────────────────

  getState(templateCount: number, publishedBlueprints: number, draftBlueprints: number): RegistryState {
    return {
      templateCount,
      activeRuleCount: this.approvalRules.size,
      activeScheduleCount: Array.from(this.schedules.values()).filter((s) => s.enabled).length,
      publishedBlueprintCount: publishedBlueprints,
      draftBlueprintCount: draftBlueprints,
      engineConnected: true,
    };
  }

  clear(): void {
    this.schedules.clear();
    this.approvalRules.clear();
    this.businessRules.clear();
  }
}
