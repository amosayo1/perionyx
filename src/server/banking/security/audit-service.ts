import type { ConnectionAudit, BankProviderKind } from "../domain/types";
import { AuditSeverity } from "../domain/types";

export interface AuditEntry {
  id: string;
  connectionId: string;
  companyId: string;
  actorUserId: string;
  action: BankingAuditAction;
  details: Record<string, unknown>;
  severity: AuditSeverity;
  recordedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export type BankingAuditAction =
  | "CONNECTION_CREATED"
  | "CONNECTION_UPDATED"
  | "CONNECTION_DELETED"
  | "CONNECTION_AUTHENTICATED"
  | "CONNECTION_REVOKED"
  | "CONNECTION_LINK_GENERATED"
  | "CREDENTIAL_STORED"
  | "CREDENTIAL_ROTATED"
  | "CREDENTIAL_DELETED"
  | "SYNC_STARTED"
  | "SYNC_COMPLETED"
  | "SYNC_FAILED"
  | "SYNC_CANCELLED"
  | "ACCOUNT_DISCOVERED"
  | "ACCOUNT_LINKED"
  | "ACCOUNT_UNLINKED"
  | "BALANCE_SYNCED"
  | "TRANSACTION_IMPORTED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SETTLED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REVERSED"
  | "WEBHOOK_RECEIVED"
  | "WEBHOOK_SUBSCRIBED"
  | "WEBHOOK_UNSUBSCRIBED"
  | "HEALTH_CHECK_RAN"
  | "PROVIDER_CONFIG_CHANGED"
  | "RATE_LIMIT_EXCEEDED"
  | "COMPLIANCE_VIOLATION"
  | "CONNECTION_ERROR";

export class BankingAuditService {
  private entries: AuditEntry[] = [];
  private readonly maxEntries = 50_000;

  record(entry: Omit<AuditEntry, "id" | "recordedAt">): AuditEntry {
    const auditEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString(),
    };

    this.entries.push(auditEntry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    return auditEntry;
  }

  getConnectionAudit(
    connectionId: string,
    limit = 100,
    since?: string,
  ): AuditEntry[] {
    let result = this.entries.filter((e) => e.connectionId === connectionId);
    if (since) {
      const sinceDate = new Date(since);
      result = result.filter((e) => new Date(e.recordedAt) >= sinceDate);
    }
    return result.slice(-limit);
  }

  getCompanyAudit(
    companyId: string,
    limit = 200,
    filter?: { actions?: BankingAuditAction[]; minSeverity?: AuditSeverity },
  ): AuditEntry[] {
    let result = this.entries.filter((e) => e.companyId === companyId);

    if (filter?.actions) {
      result = result.filter((e) => filter.actions!.includes(e.action));
    }
    if (filter?.minSeverity) {
      const severityOrder: AuditSeverity[] = [AuditSeverity.INFO, AuditSeverity.WARNING, AuditSeverity.CRITICAL];
      const minIdx = severityOrder.indexOf(filter.minSeverity);
      result = result.filter((e) => severityOrder.indexOf(e.severity) >= minIdx);
    }

    return result.slice(-limit);
  }

  getByAction(action: BankingAuditAction, limit = 50): AuditEntry[] {
    return this.entries.filter((e) => e.action === action).slice(-limit);
  }

  search(query: string, limit = 100): AuditEntry[] {
    const lower = query.toLowerCase();
    return this.entries
      .filter(
        (e) =>
          e.action.toLowerCase().includes(lower) ||
          e.connectionId.toLowerCase().includes(lower) ||
          e.actorUserId.toLowerCase().includes(lower) ||
          JSON.stringify(e.details).toLowerCase().includes(lower),
      )
      .slice(-limit);
  }

  getSeveritySummary(companyId: string): Record<AuditSeverity, number> {
    const companyEntries = this.entries.filter((e) => e.companyId === companyId);
    return {
      info: companyEntries.filter((e) => e.severity === AuditSeverity.INFO).length,
      warning: companyEntries.filter((e) => e.severity === AuditSeverity.WARNING).length,
      critical: companyEntries.filter((e) => e.severity === AuditSeverity.CRITICAL).length,
    };
  }

  clear(connectionId?: string): void {
    if (connectionId) {
      this.entries = this.entries.filter((e) => e.connectionId !== connectionId);
    } else {
      this.entries = [];
    }
  }

  get totalEntries(): number {
    return this.entries.length;
  }
}

export const bankingAuditService = new BankingAuditService();