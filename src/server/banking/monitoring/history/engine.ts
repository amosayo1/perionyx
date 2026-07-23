import type { BankProviderKind, BankingRegion } from "../../domain/types";
import type {
  HistoryEntry,
  IncidentRecord,
  RecoveryRecord,
  ProviderOutageRecord,
  AlertSeverity,
  AlertCategory,
} from "../types";

export interface HistoryTrackerConfig {
  maxHistoryEntries: number;
  maxIncidents: number;
  maxOutages: number;
}

const DEFAULT_CONFIG: HistoryTrackerConfig = {
  maxHistoryEntries: 1000,
  maxIncidents: 100,
  maxOutages: 50,
};

export class HistoryTracker {
  private config: HistoryTrackerConfig;
  private history: HistoryEntry[] = [];
  private incidents: IncidentRecord[] = [];
  private recoveries: RecoveryRecord[] = [];
  private outages: ProviderOutageRecord[] = [];
  private counter = 0;

  constructor(config?: Partial<HistoryTrackerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  recordHistory(params: {
    type: HistoryEntry["type"];
    connectionId?: string;
    providerKind?: BankProviderKind;
    data: Record<string, unknown>;
    summary: string;
  }): void {
    this.counter++;
    const entry: HistoryEntry = {
      id: `hist-${Date.now()}-${this.counter}`,
      type: params.type,
      timestamp: new Date().toISOString(),
      connectionId: params.connectionId,
      providerKind: params.providerKind,
      data: params.data,
      summary: params.summary,
    };

    this.history.push(entry);
    if (this.history.length > this.config.maxHistoryEntries) {
      this.history = this.history.slice(-this.config.maxHistoryEntries);
    }
  }

  recordIncident(params: {
    title: string;
    description: string;
    severity: AlertSeverity;
    category: AlertCategory;
    connectionId?: string;
    providerKind?: BankProviderKind;
  }): IncidentRecord {
    this.counter++;
    const incident: IncidentRecord = {
      id: `inc-${Date.now()}-${this.counter}`,
      title: params.title,
      description: params.description,
      severity: params.severity,
      category: params.category,
      connectionId: params.connectionId,
      providerKind: params.providerKind,
      startedAt: new Date().toISOString(),
      resolvedAt: null,
      durationMinutes: null,
      autoResolved: false,
      resolution: null,
    };

    this.incidents.push(incident);
    if (this.incidents.length > this.config.maxIncidents) {
      this.incidents = this.incidents.slice(-this.config.maxIncidents);
    }

    this.recordHistory({
      type: "INCIDENT",
      connectionId: params.connectionId,
      providerKind: params.providerKind,
      data: { incidentId: incident.id, severity: params.severity, category: params.category },
      summary: `Incident: ${params.title}`,
    });

    return incident;
  }

  resolveIncident(
    incidentId: string,
    resolution: string,
    autoResolved = false,
  ): boolean {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident || incident.resolvedAt) return false;

    incident.resolvedAt = new Date().toISOString();
    incident.durationMinutes = Math.round(
      (new Date(incident.resolvedAt).getTime() -
        new Date(incident.startedAt).getTime()) /
        60000,
    );
    incident.autoResolved = autoResolved;
    incident.resolution = resolution;

    this.recordHistory({
      type: "RECOVERY",
      connectionId: incident.connectionId,
      providerKind: incident.providerKind,
      data: {
        incidentId,
        duration: incident.durationMinutes,
        autoResolved,
      },
      summary: `Resolved incident: ${incident.title} (${resolution})`,
    });

    return true;
  }

  recordRecovery(params: {
    incidentId: string;
    recoveryType: RecoveryRecord["recoveryType"];
    action: string;
    initiatedBy: string;
    successful: boolean;
    notes?: string;
  }): RecoveryRecord {
    this.counter++;
    const recovery: RecoveryRecord = {
      id: `rec-${Date.now()}-${this.counter}`,
      incidentId: params.incidentId,
      recoveryType: params.recoveryType,
      action: params.action,
      initiatedBy: params.initiatedBy,
      startedAt: new Date().toISOString(),
      completedAt: params.successful ? new Date().toISOString() : null,
      successful: params.successful,
      notes: params.notes ?? "",
    };

    this.recoveries.push(recovery);
    return recovery;
  }

  recordOutage(params: {
    providerKind: BankProviderKind;
    region: BankingRegion;
    affectedConnections: number;
    affectedAccounts: number;
    rootCause?: string;
  }): ProviderOutageRecord {
    this.counter++;
    const outage: ProviderOutageRecord = {
      id: `outage-${Date.now()}-${this.counter}`,
      providerKind: params.providerKind,
      region: params.region,
      startedAt: new Date().toISOString(),
      resolvedAt: null,
      durationMinutes: null,
      affectedConnections: params.affectedConnections,
      affectedAccounts: params.affectedAccounts,
      rootCause: params.rootCause ?? null,
      resolution: null,
    };

    this.outages.push(outage);
    if (this.outages.length > this.config.maxOutages) {
      this.outages.shift();
    }

    this.recordHistory({
      type: "OUTAGE",
      providerKind: params.providerKind,
      data: {
        outageId: outage.id,
        region: params.region,
        affectedConnections: params.affectedConnections,
      },
      summary: `Provider outage: ${params.providerKind} in ${params.region}`,
    });

    return outage;
  }

  resolveOutage(outageId: string, resolution: string): boolean {
    const outage = this.outages.find((o) => o.id === outageId);
    if (!outage || outage.resolvedAt) return false;

    outage.resolvedAt = new Date().toISOString();
    outage.durationMinutes = Math.round(
      (new Date(outage.resolvedAt).getTime() -
        new Date(outage.startedAt).getTime()) /
        60000,
    );
    outage.resolution = resolution;
    return true;
  }

  getHistory(params?: {
    type?: HistoryEntry["type"];
    connectionId?: string;
    providerKind?: BankProviderKind;
    limit?: number;
  }): HistoryEntry[] {
    let filtered = this.history;

    if (params?.type) filtered = filtered.filter((e) => e.type === params.type);
    if (params?.connectionId) filtered = filtered.filter((e) => e.connectionId === params.connectionId);
    if (params?.providerKind) filtered = filtered.filter((e) => e.providerKind === params.providerKind);

    filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return filtered.slice(0, params?.limit ?? filtered.length);
  }

  getIncidents(params?: {
    severity?: AlertSeverity;
    unresolvedOnly?: boolean;
    limit?: number;
  }): IncidentRecord[] {
    let filtered = this.incidents;

    if (params?.severity) filtered = filtered.filter((i) => i.severity === params.severity);
    if (params?.unresolvedOnly) filtered = filtered.filter((i) => !i.resolvedAt);

    filtered.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

    return filtered.slice(0, params?.limit ?? filtered.length);
  }

  getOutages(params?: {
    providerKind?: BankProviderKind;
    unresolvedOnly?: boolean;
    limit?: number;
  }): ProviderOutageRecord[] {
    let filtered = this.outages;

    if (params?.providerKind) filtered = filtered.filter((o) => o.providerKind === params.providerKind);
    if (params?.unresolvedOnly) filtered = filtered.filter((o) => !o.resolvedAt);

    filtered.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

    return filtered.slice(0, params?.limit ?? filtered.length);
  }

  getRecoveries(incidentId?: string): RecoveryRecord[] {
    if (incidentId) {
      return this.recoveries.filter((r) => r.incidentId === incidentId);
    }
    return this.recoveries;
  }

  clear(): void {
    this.history = [];
    this.incidents = [];
    this.recoveries = [];
    this.outages = [];
  }
}

export const historyTracker = new HistoryTracker();