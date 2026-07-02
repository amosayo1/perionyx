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

    for (const account of accounts) {
      const existing = await prisma.chartOfAccount.findUnique({
        where: { companyId_externalId: { companyId, externalId: account.externalId } },
        select: { id: true },
      });
      if (existing) updated++;
      else created++;
    }

    return { processed: accounts.length, created, updated, failed: 0 };
  }

  async syncVendors(
    accountingConnectionId: string,
    companyId: string,
    vendors: NormalizedVendor[],
  ): Promise<SyncCounts> {
    let created = 0;
    let updated = 0;

    for (const vendor of vendors) {
      const existing = await prisma.accountingVendor.findUnique({
        where: { companyId_externalId: { companyId, externalId: vendor.externalId } },
      });

      if (existing) {
        await prisma.accountingVendor.update({
          where: { id: existing.id },
          data: {
            displayName: vendor.displayName,
            companyName: vendor.companyName,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address as any,
            active: vendor.active,
            balance: new Prisma.Decimal(vendor.balance),
            currency: vendor.currency,
          },
        });
        updated++;
      } else {
        await prisma.accountingVendor.create({
          data: {
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
        });
        created++;
      }
    }

    return { processed: vendors.length, created, updated, failed: 0 };
  }

  async syncCustomers(
    accountingConnectionId: string,
    companyId: string,
    customers: NormalizedCustomer[],
  ): Promise<SyncCounts> {
    let created = 0;
    let updated = 0;

    for (const customer of customers) {
      const existing = await prisma.accountingCustomer.findUnique({
        where: { companyId_externalId: { companyId, externalId: customer.externalId } },
      });

      if (existing) {
        await prisma.accountingCustomer.update({
          where: { id: existing.id },
          data: {
            displayName: customer.displayName,
            companyName: customer.companyName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address as any,
            active: customer.active,
            balance: new Prisma.Decimal(customer.balance),
            currency: customer.currency,
          },
        });
        updated++;
      } else {
        await prisma.accountingCustomer.create({
          data: {
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
        });
        created++;
      }
    }

    return { processed: customers.length, created, updated, failed: 0 };
  }

  async syncInvoices(
    accountingConnectionId: string,
    companyId: string,
    invoices: NormalizedInvoice[],
  ): Promise<SyncCounts> {
    let created = 0;
    let updated = 0;

    for (const invoice of invoices) {
      const existing = await prisma.accountingInvoice.findUnique({
        where: { companyId_externalId: { companyId, externalId: invoice.externalId } },
      });

      if (existing) {
        await prisma.accountingInvoice.update({
          where: { id: existing.id },
          data: {
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
        });
        updated++;
      } else {
        await prisma.accountingInvoice.create({
          data: {
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
        });
        created++;
      }
    }

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

    const refreshToken = decrypt(connection.refreshToken);
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
