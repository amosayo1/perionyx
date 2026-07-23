import type { AuditEventType, AuditRecord } from "./types"

export class AuditService {
  private records: AuditRecord[] = []

  private generateId(): string {
    return `audit_${this.records.length + 1}_${Date.now()}`
  }

  record(event: Omit<AuditRecord, "id" | "timestamp">): AuditRecord {
    const record: AuditRecord = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    }
    this.records.push(record)
    return record
  }

  getAuditRecord(id: string): AuditRecord | undefined {
    return this.records.find((r) => r.id === id)
  }

  getAuditLogs(): AuditRecord[] {
    return [...this.records]
  }

  getAuditLogsByUser(userId: string): AuditRecord[] {
    return this.records.filter((r) => r.userId === userId)
  }

  getAuditLogsByCompany(companyId: string): AuditRecord[] {
    return this.records.filter((r) => r.companyId === companyId)
  }

  getAuditLogsByEventType(eventType: AuditEventType): AuditRecord[] {
    return this.records.filter((r) => r.eventType === eventType)
  }

  getAuditLogsBySeverity(severity: string): AuditRecord[] {
    return this.records.filter((r) => r.severity === severity)
  }

  getAuditLogsByDateRange(start: Date, end: Date): AuditRecord[] {
    return this.records.filter((r) => r.timestamp >= start && r.timestamp <= end)
  }

  getRecentLogs(limit: number): AuditRecord[] {
    return this.records.slice(-limit)
  }

  getAuditSummary(): {
    total: number
    byEventType: Record<string, number>
    bySeverity: Record<string, number>
    criticalCount: number
  } {
    const byEventType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    let criticalCount = 0
    for (const r of this.records) {
      byEventType[r.eventType] = (byEventType[r.eventType] ?? 0) + 1
      bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1
      if (r.severity === "critical") criticalCount++
    }
    return { total: this.records.length, byEventType, bySeverity, criticalCount }
  }

  exportCsv(companyId?: string): string {
    const logs = companyId ? this.getAuditLogsByCompany(companyId) : this.records
    const header = "id,eventType,userId,userEmail,targetId,targetType,details,ipAddress,severity,timestamp"
    const rows = logs.map((r) =>
      [
        r.id,
        r.eventType,
        r.userId ?? "",
        r.userEmail ?? "",
        r.targetId ?? "",
        r.targetType ?? "",
        `"${r.details.replace(/"/g, '""')}"`,
        r.ipAddress ?? "",
        r.severity,
        r.timestamp.toISOString(),
      ].join(","),
    )
    return [header, ...rows].join("\n")
  }

  count(): number {
    return this.records.length
  }
}

export const auditService = new AuditService()
