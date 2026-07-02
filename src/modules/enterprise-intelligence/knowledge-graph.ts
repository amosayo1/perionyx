import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export type EntityType =
  | "user" | "company" | "account" | "wallet" | "transaction" | "approval"
  | "approval_workflow" | "policy" | "risk_alert" | "risk_incident"
  | "risk_assessment" | "connector" | "recommendation" | "insight"
  | "executive_summary" | "sync_log" | "reconciliation_run" | "audit_log"
  | "notification" | "calendar_event";

export type RelationshipType =
  | "initiates" | "approves" | "rejects" | "routes_to" | "belongs_to"
  | "links_to" | "references" | "triggers" | "resolves" | "generates"
  | "affects" | "evaluates" | "monitors" | "causes" | "relates_to";

export interface EntityNode {
  id: string;
  type: EntityType;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface EntityRelationship {
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  relationship: RelationshipType;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeGraphQuery {
  entityIds?: string[];
  entityTypes?: EntityType[];
  relationshipTypes?: RelationshipType[];
  maxDepth?: number;
}

export interface KnowledgeGraphResult {
  nodes: EntityNode[];
  edges: EntityRelationship[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    queryTime: string;
  };
}

const entityLabels: Record<EntityType, string> = {
  user: "User", company: "Company", account: "Account", wallet: "Wallet",
  transaction: "Transaction", approval: "Approval", approval_workflow: "Approval Workflow",
  policy: "Policy", risk_alert: "Risk Alert", risk_incident: "Risk Incident",
  risk_assessment: "Risk Assessment", connector: "Connector", recommendation: "Recommendation",
  insight: "Insight", executive_summary: "Executive Summary", sync_log: "Sync Log",
  reconciliation_run: "Reconciliation Run", audit_log: "Audit Log",
  notification: "Notification", calendar_event: "Calendar Event",
};

export class KnowledgeGraph {
  private nodes = new Map<string, EntityNode>();
  private edges = new Map<string, EntityRelationship>();

  addNode(entity: EntityNode): void {
    this.nodes.set(entity.id, entity);
  }

  addEdge(relationship: EntityRelationship): void {
    const key = `${relationship.sourceId}:${relationship.relationship}:${relationship.targetId}`;
    this.edges.set(key, relationship);
  }

  addEdges(relationships: EntityRelationship[]): void {
    for (const r of relationships) this.addEdge(r);
  }

  getNode(id: string): EntityNode | undefined {
    return this.nodes.get(id);
  }

  getEdgesForNode(id: string): EntityRelationship[] {
    return Array.from(this.edges.values()).filter((e) => e.sourceId === id || e.targetId === id);
  }

  query(query: KnowledgeGraphQuery): KnowledgeGraphResult {
    let matchedNodes = Array.from(this.nodes.values());
    let matchedEdges = Array.from(this.edges.values());

    if (query.entityTypes?.length) {
      matchedNodes = matchedNodes.filter((n) => query.entityTypes!.includes(n.type));
    }
    if (query.entityIds?.length) {
      matchedNodes = matchedNodes.filter((n) => query.entityIds!.includes(n.id));
    }
    if (query.relationshipTypes?.length) {
      matchedEdges = matchedEdges.filter((e) => query.relationshipTypes!.includes(e.relationship));
    }

    const nodeIds = new Set(matchedNodes.map((n) => n.id));
    matchedEdges = matchedEdges.filter((e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));

    return { nodes: matchedNodes, edges: matchedEdges, metadata: { nodeCount: matchedNodes.length, edgeCount: matchedEdges.length, queryTime: new Date().toISOString() } };
  }

  getLabel(type: EntityType): string {
    return entityLabels[type] ?? type;
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  getStats(): { nodeCount: number; edgeCount: number; nodeTypes: Partial<Record<EntityType, number>>; edgeTypes: Partial<Record<RelationshipType, number>> } {
    const nodeTypes: Partial<Record<EntityType, number>> = {};
    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] ?? 0) + 1;
    }
    const edgeTypes: Partial<Record<RelationshipType, number>> = {};
    for (const edge of this.edges.values()) {
      edgeTypes[edge.relationship] = (edgeTypes[edge.relationship] ?? 0) + 1;
    }
    return { nodeCount: this.nodes.size, edgeCount: this.edges.size, nodeTypes, edgeTypes };
  }

  async buildFromAllSources(ctx: TenantContext): Promise<void> {
    this.clear();

    const [wallets, treasuryAccounts, riskAlerts, riskIncidents, connectors, transactions] = await Promise.all([
      prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { id: true, name: true, currency: true, balance: true } }),
      prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId, isActive: true }, select: { id: true, name: true, currency: true, balance: true } }),
      prisma.riskAlert.findMany({ where: { companyId: ctx.companyId, status: "OPEN" }, select: { id: true, title: true, severity: true, category: true } }),
      prisma.riskIncident.findMany({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } }, select: { id: true, title: true, severity: true, category: true } }),
      prisma.connectorConfig.findMany({ where: { companyId: ctx.companyId }, select: { id: true, type: true, active: true } }),
      prisma.transaction.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, type: true, status: true, primaryAmount: true } }),
    ]);

    for (const w of wallets) {
      this.addNode({ id: w.id, type: "wallet", label: w.name, metadata: { currency: w.currency, balance: Number(w.balance) } });
    }
    for (const a of treasuryAccounts) {
      this.addNode({ id: a.id, type: "account", label: a.name, metadata: { currency: a.currency, balance: Number(a.balance) } });
    }
    for (const a of riskAlerts) {
      this.addNode({ id: a.id, type: "risk_alert", label: a.title, metadata: { severity: a.severity, category: a.category } });
    }
    for (const i of riskIncidents) {
      this.addNode({ id: i.id, type: "risk_incident", label: i.title, metadata: { severity: i.severity, category: i.category } });
    }
    for (const c of connectors) {
      this.addNode({ id: c.id, type: "connector", label: `${c.type} (${c.active ? "active" : "inactive"})`, metadata: { type: c.type, active: c.active } });
    }
    for (const t of transactions) {
      this.addNode({ id: t.id, type: "transaction", label: `${t.type} ${Number(t.primaryAmount).toFixed(2)}`, metadata: { status: t.status, type: t.type } });
    }
  }
}
