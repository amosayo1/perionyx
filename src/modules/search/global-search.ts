import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export interface SearchResult {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  module: string;
  matchedField: string;
  confidence: number;
}

export async function globalSearch(
  ctx: TenantContext,
  query: string,
  limit: number = 20,
): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];
  const take = Math.ceil(limit / 6) + 2;

  const ilike = (field: string) => ({
    contains: q,
    mode: "insensitive" as const,
  });

  const [
    transactions,
    policies,
    riskAlerts,
    riskIncidents,
    users,
    wallets,
    ledgerEntries,
    treasuryAccounts,
    calendarEvents,
    auditLogs,
    webhooks,
    apiKeys,
    connectors,
    notifications,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { companyId: ctx.companyId, OR: [{ id: { contains: q, mode: "insensitive" } }, { reference: ilike("reference") }] },
      take, select: { id: true, reference: true, type: true, primaryAmount: true, currency: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.policy.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true, type: true, enabled: true },
    }),
    prisma.riskAlert.findMany({
      where: { companyId: ctx.companyId, OR: [{ title: ilike("title") }, { description: ilike("description") }] },
      take, select: { id: true, title: true, severity: true, category: true },
    }),
    prisma.riskIncident.findMany({
      where: { companyId: ctx.companyId, OR: [{ title: ilike("title") }, { description: ilike("description") }] },
      take, select: { id: true, title: true, severity: true, status: true },
    }),
    prisma.user.findMany({
      where: { memberships: { some: { companyId: ctx.companyId } }, OR: [{ name: ilike("name") }, { email: ilike("email") }] },
      take, select: { id: true, name: true, email: true },
    }),
    prisma.wallet.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true, currency: true, balance: true },
    }),
    prisma.ledgerEntry.findMany({
      where: { companyId: ctx.companyId, id: { contains: q, mode: "insensitive" } },
      take, select: { id: true, side: true, amount: true, currency: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.treasuryAccount.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true, currency: true, balance: true },
    }),
    prisma.calendarEvent.findMany({
      where: { companyId: ctx.companyId, title: ilike("title") },
      take, select: { id: true, title: true, type: true, startDate: true },
    }),
    prisma.auditLog.findMany({
      where: { companyId: ctx.companyId, OR: [{ action: ilike("action") }, { resourceType: ilike("resourceType") }] },
      take, select: { id: true, action: true, severity: true, resourceType: true },
    }),
    prisma.webhook.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true },
    }),
    prisma.apiKey.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true },
    }),
    prisma.connectorConfig.findMany({
      where: { companyId: ctx.companyId, name: ilike("name") },
      take, select: { id: true, name: true, type: true },
    }),
    prisma.notification.findMany({
      where: { companyId: ctx.companyId, title: ilike("title") },
      take, select: { id: true, title: true, eventType: true },
    }),
  ]);

  for (const t of transactions) {
    results.push({
      id: t.id, label: t.id, subtitle: `${t.type} — ${Number(t.primaryAmount).toLocaleString()} ${t.currency}${t.reference ? ` (${t.reference})` : ""}`,
      href: `/transactions/${t.id}`, module: "Transactions", matchedField: "id", confidence: t.id.toLowerCase().includes(q) ? 1 : 0.8,
    });
  }
  for (const p of policies) {
    results.push({
      id: p.id, label: p.name, subtitle: `Policy — ${p.type}${p.enabled ? "" : " (disabled)"}`,
      href: `/policies`, module: "Policies", matchedField: "name", confidence: 0.9,
    });
  }
  for (const a of riskAlerts) {
    results.push({
      id: a.id, label: a.title, subtitle: `Risk Alert — ${a.category} [${a.severity}]`,
      href: `/risk`, module: "Risk", matchedField: "title", confidence: 0.85,
    });
  }
  for (const i of riskIncidents) {
    results.push({
      id: i.id, label: i.title, subtitle: `Incident — ${i.severity} (${i.status})`,
      href: `/risk/incidents/${i.id}`, module: "Risk", matchedField: "title", confidence: 0.85,
    });
  }
  for (const u of users) {
    results.push({
      id: u.id, label: u.name ?? u.email ?? u.id, subtitle: u.email ?? "No email",
      href: `/admin/users`, module: "Users", matchedField: u.name?.toLowerCase().includes(q) ? "name" : "email", confidence: 0.9,
    });
  }
  for (const w of wallets) {
    results.push({
      id: w.id, label: w.name, subtitle: `${w.currency} — ${Number(w.balance).toLocaleString()}`,
      href: `/wallets/${w.id}`, module: "Wallets", matchedField: "name", confidence: 0.9,
    });
  }
  for (const le of ledgerEntries) {
    results.push({
      id: le.id, label: le.id, subtitle: `${le.side} ${Number(le.amount).toLocaleString()} ${le.currency}`,
      href: `/ledger`, module: "Ledger", matchedField: "id", confidence: 1,
    });
  }
  for (const ta of treasuryAccounts) {
    results.push({
      id: ta.id, label: ta.name, subtitle: `${ta.currency} — ${Number(ta.balance).toLocaleString()}`,
      href: `/accounts/${ta.id}`, module: "Treasury", matchedField: "name", confidence: 0.9,
    });
  }
  for (const ce of calendarEvents) {
    results.push({
      id: ce.id, label: ce.title, subtitle: `${ce.type} — ${ce.startDate.toISOString().slice(0, 10)}`,
      href: `/calendar`, module: "Calendar", matchedField: "title", confidence: 0.85,
    });
  }
  for (const al of auditLogs) {
    results.push({
      id: al.id, label: al.action, subtitle: `${al.resourceType} [${al.severity}]`,
      href: `/audit-logs`, module: "Audit", matchedField: "action", confidence: 0.8,
    });
  }
  for (const wh of webhooks) {
    results.push({
      id: wh.id, label: wh.name, subtitle: "Webhook",
      href: `/settings/webhooks`, module: "Webhooks", matchedField: "name", confidence: 0.9,
    });
  }
  for (const ak of apiKeys) {
    results.push({
      id: ak.id, label: ak.name, subtitle: "API Key",
      href: `/settings/api-keys`, module: "Developer", matchedField: "name", confidence: 0.9,
    });
  }
  for (const cc of connectors) {
    results.push({
      id: cc.id, label: cc.name, subtitle: `Connector — ${cc.type}`,
      href: `/connectors/${cc.id}`, module: "Connectors", matchedField: "name", confidence: 0.9,
    });
  }
  for (const n of notifications) {
    results.push({
      id: n.id, label: n.title, subtitle: `${n.eventType}`,
      href: `/notifications`, module: "Notifications", matchedField: "title", confidence: 0.85,
    });
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, limit);
}
