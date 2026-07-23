import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { decrypt, encrypt } from "@/server/security/encryption";
import type {
  NormalizedChartOfAccount,
  NormalizedVendor,
  NormalizedCustomer,
  NormalizedInvoice,
} from "@/modules/financial-mapping";

interface SyncCounts {
  processed: number;
  created: number;
  updated: number;
  failed: number;
}

interface TokenUpdate {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

interface ConnectionRecord {
  id: string;
  companyId: string;
  connectorId: string;
  realmId: string;
  clientId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  syncToken: string | null;
  connectedAt: Date;
  lastSyncAt: Date | null;
}

interface InvoiceFilterOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export class QuickBooksAccountingService {
  async createOrUpdateConnection(
    companyId: string,
    connectorId: string,
    realmId: string,
    tokens: {
      clientId: string;
      accessToken: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    },
  ): Promise<ConnectionRecord> {
    const existing = await prisma.accountingConnection.findFirst({
      where: { companyId, connectorId },
    });

    if (existing) {
      return prisma.accountingConnection.update({
        where: { id: existing.id },
        data: {
          realmId,
          clientId: tokens.clientId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? existing.refreshToken,
          tokenExpiresAt: tokens.tokenExpiresAt ?? existing.tokenExpiresAt,
        },
      });
    }

    return prisma.accountingConnection.create({
      data: {
        companyId,
        connectorId,
        realmId,
        clientId: tokens.clientId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        connectedAt: new Date(),
      },
    });
  }

  async getConnection(companyId: string, connectorId: string): Promise<ConnectionRecord | null> {
    return prisma.accountingConnection.findFirst({
      where: { companyId, connectorId },
    }) as Promise<ConnectionRecord | null>;
  }

  async deleteConnection(companyId: string, connectorId: string): Promise<void> {
    await prisma.accountingConnection.deleteMany({
      where: { companyId, connectorId },
    });
  }

  async updateTokens(connectionId: string, tokens: TokenUpdate): Promise<void> {
    await prisma.accountingConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
      },
    });
  }

  async syncChartOfAccounts(
    accountingConnectionId: string,
    companyId: string,
    accounts: NormalizedChartOfAccount[],
  ): Promise<SyncCounts> {
    let created = 0;
    let updated = 0;

    const externalIds = accounts.map((a) => a.externalId);

    if (externalIds.length > 0) {
      const existing = await prisma.chartOfAccount.findMany({
        where: { companyId, externalId: { in: externalIds } },
        select: { externalId: true },
      });
      const existingSet = new Set(existing.map((e) => e.externalId));
      for (const account of accounts) {
        if (existingSet.has(account.externalId)) updated++;
        else created++;
      }
    }

    await prisma.$transaction(
      accounts.map((account) =>
        prisma.chartOfAccount.upsert({
          where: { companyId_externalId: { companyId, externalId: account.externalId } },
          create: {
            companyId,
            accountingConnectionId,
            externalId: account.externalId,
            name: account.name,
            accountType: account.accountType,
            accountSubType: account.accountSubType,
            classification: account.classification,
            active: account.active,
            balance: new Prisma.Decimal(account.balance),
            currency: account.currency,
            description: account.description,
          },
          update: {
            name: account.name,
            accountType: account.accountType,
            accountSubType: account.accountSubType,
            classification: account.classification,
            active: account.active,
            balance: new Prisma.Decimal(account.balance),
            currency: account.currency,
            description: account.description,
          },
        }),
      ),
    );

    return { processed: accounts.length, created, updated, failed: 0 };
  }

  async syncVendors(
    accountingConnectionId: string,
    companyId: string,
    vendors: NormalizedVendor[],
  ): Promise<SyncCounts> {
    if (vendors.length === 0) return { processed: 0, created: 0, updated: 0, failed: 0 };

    const externalIds = vendors.map((v) => v.externalId);
    const existing = await prisma.accountingVendor.findMany({
      where: { companyId, externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((e) => e.externalId));
    let created = 0;
    let updated = 0;
    for (const v of vendors) {
      if (existingSet.has(v.externalId)) updated++;
      else created++;
    }

    await prisma.$transaction(
      vendors.map((vendor) =>
        prisma.accountingVendor.upsert({
          where: { companyId_externalId: { companyId, externalId: vendor.externalId } },
          create: {
            companyId,
            accountingConnectionId,
            externalId: vendor.externalId,
            displayName: vendor.displayName,
            companyName: vendor.companyName,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address as any,
            active: vendor.active,
            balance: new Prisma.Decimal(vendor.balance),
            currency: vendor.currency,
          },
          update: {
            displayName: vendor.displayName,
            companyName: vendor.companyName,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address as any,
            active: vendor.active,
            balance: new Prisma.Decimal(vendor.balance),
            currency: vendor.currency,
          },
        }),
      ),
    );

    return { processed: vendors.length, created, updated, failed: 0 };
  }

  async syncCustomers(
    accountingConnectionId: string,
    companyId: string,
    customers: NormalizedCustomer[],
  ): Promise<SyncCounts> {
    if (customers.length === 0) return { processed: 0, created: 0, updated: 0, failed: 0 };

    const externalIds = customers.map((c) => c.externalId);
    const existing = await prisma.accountingCustomer.findMany({
      where: { companyId, externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((e) => e.externalId));
    let created = 0;
    let updated = 0;
    for (const c of customers) {
      if (existingSet.has(c.externalId)) updated++;
      else created++;
    }

    await prisma.$transaction(
      customers.map((customer) =>
        prisma.accountingCustomer.upsert({
          where: { companyId_externalId: { companyId, externalId: customer.externalId } },
          create: {
            companyId,
            accountingConnectionId,
            externalId: customer.externalId,
            displayName: customer.displayName,
            companyName: customer.companyName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address as any,
            active: customer.active,
            balance: new Prisma.Decimal(customer.balance),
            currency: customer.currency,
          },
          update: {
            displayName: customer.displayName,
            companyName: customer.companyName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address as any,
            active: customer.active,
            balance: new Prisma.Decimal(customer.balance),
            currency: customer.currency,
          },
        }),
      ),
    );

    return { processed: customers.length, created, updated, failed: 0 };
  }

  async syncInvoices(
    accountingConnectionId: string,
    companyId: string,
    invoices: NormalizedInvoice[],
  ): Promise<SyncCounts> {
    if (invoices.length === 0) return { processed: 0, created: 0, updated: 0, failed: 0 };

    const externalIds = invoices.map((inv) => inv.externalId);
    const existing = await prisma.accountingInvoice.findMany({
      where: { companyId, externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((e) => e.externalId));
    let created = 0;
    let updated = 0;
    for (const inv of invoices) {
      if (existingSet.has(inv.externalId)) updated++;
      else created++;
    }

    await prisma.$transaction(
      invoices.map((invoice) =>
        prisma.accountingInvoice.upsert({
          where: { companyId_externalId: { companyId, externalId: invoice.externalId } },
          create: {
            companyId,
            accountingConnectionId,
            externalId: invoice.externalId,
            docNumber: invoice.docNumber,
            customerId: invoice.customerId,
            customerName: invoice.customerName,
            totalAmount: new Prisma.Decimal(invoice.totalAmount),
            balance: new Prisma.Decimal(invoice.balance),
            currency: invoice.currency,
            status: invoice.status,
            dueDate: invoice.dueDate,
            transactionDate: invoice.transactionDate,
            emailStatus: invoice.emailStatus,
            deliveryInfo: invoice.deliveryInfo as any,
            lineItems: invoice.lineItems as any,
            metadata: invoice.metadata as any,
          },
          update: {
            docNumber: invoice.docNumber,
            customerId: invoice.customerId,
            customerName: invoice.customerName,
            totalAmount: new Prisma.Decimal(invoice.totalAmount),
            balance: new Prisma.Decimal(invoice.balance),
            currency: invoice.currency,
            status: invoice.status,
            dueDate: invoice.dueDate,
            transactionDate: invoice.transactionDate,
            emailStatus: invoice.emailStatus,
            deliveryInfo: invoice.deliveryInfo as any,
            lineItems: invoice.lineItems as any,
            metadata: invoice.metadata as any,
          },
        }),
      ),
    );

    return { processed: invoices.length, created, updated, failed: 0 };
  }

  async getChartOfAccounts(companyId: string) {
    return prisma.chartOfAccount.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  }

  async getVendors(companyId: string) {
    return prisma.accountingVendor.findMany({
      where: { companyId },
      orderBy: { displayName: "asc" },
    });
  }

  async getCustomers(companyId: string) {
    return prisma.accountingCustomer.findMany({
      where: { companyId },
      orderBy: { displayName: "asc" },
    });
  }

  async getInvoices(companyId: string, opts?: InvoiceFilterOptions) {
    const where: Record<string, unknown> = { companyId };

    if (opts?.status) {
      where.status = opts.status;
    }

    return prisma.accountingInvoice.findMany({
      where,
      orderBy: { transactionDate: "desc" },
      take: opts?.limit ?? 100,
      skip: opts?.offset ?? 0,
    });
  }

  async createSyncLog(
    companyId: string,
    connectorId: string,
    syncType: string,
    status: string,
    counts: { processed: number; created: number; updated: number; failed: number },
  ): Promise<void> {
    await prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source: "quickbooks",
        syncType,
        status,
        recordsProcessed: counts.processed,
        recordsCreated: counts.created,
        recordsUpdated: counts.updated,
        recordsFailed: counts.failed,
        startedAt: new Date(),
        completedAt: status === "running" ? undefined : new Date(),
      },
    });
  }

  async refreshAccessToken(connectionId: string): Promise<string | null> {
    const connection = await prisma.accountingConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.refreshToken) return null;

    const clientId = process.env.QB_CLIENT_ID;
    const clientSecret = process.env.QB_CLIENT_SECRET;

    if (!clientId || !clientSecret) return null;

    let refreshToken: string | null = null;
    try { refreshToken = decrypt(connection.refreshToken); } catch { return null; }
    if (!refreshToken) return null;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (!data.access_token) return null;

    await prisma.accountingConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: data.refresh_token ? encrypt(data.refresh_token) : connection.refreshToken,
        tokenExpiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : connection.tokenExpiresAt,
      },
    });

    return data.access_token;
  }
}
