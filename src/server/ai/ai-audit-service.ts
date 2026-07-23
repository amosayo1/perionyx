import type { AIAuditEntry, AssistantMode } from "./types";

export class AIAuditService {
  private entries: AIAuditEntry[] = [];
  private readonly maxEntries = 100_000;

  record(entry: AIAuditEntry): void {
    this.entries.push(entry);
    this.trim();
  }

  getByCompany(companyId: string, limit = 100): AIAuditEntry[] {
    return this.entries
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getByUser(userId: string, companyId: string, limit = 50): AIAuditEntry[] {
    return this.entries
      .filter((e) => e.userId === userId && e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getByConversation(conversationId: string): AIAuditEntry[] {
    return this.entries.filter((e) => e.conversationId === conversationId);
  }

  getStats(): {
    totalInteractions: number;
    totalRejections: number;
    totalErrors: number;
    avgLatencyMs: number;
  } {
    const generates = this.entries.filter((e) => e.action === "GENERATE");
    const rejections = this.entries.filter((e) => e.action === "REJECT");
    const errors = this.entries.filter((e) => e.action === "ERROR");
    const avgLatency = generates.length > 0
      ? Math.round(generates.reduce((s, e) => s + e.latencyMs, 0) / generates.length)
      : 0;

    return {
      totalInteractions: this.entries.length,
      totalRejections: rejections.length,
      totalErrors: errors.length,
      avgLatencyMs: avgLatency,
    };
  }

  private trim(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
}

export const aiAuditService = new AIAuditService();
