import { Prisma } from "@prisma/client";
import type {
  NormalizedExternalAccount,
  NormalizedBalance,
  NormalizedTransaction,
  NormalizedChartOfAccount,
  NormalizedVendor,
  NormalizedCustomer,
  NormalizedInvoice,
  NormalizedJournalEntry,
  NormalizedPayment,
  FinancialProvider,
} from "./types";

export class FinancialNormalizer {
  static normalizeExternalAccount(
    source: FinancialProvider,
    data: Record<string, unknown>,
  ): NormalizedExternalAccount {
    const base = { source, externalId: String(data.id ?? "") };
    switch (source) {
      case "plaid":
        return this.fromPlaidAccount(base, data);
      case "quickbooks":
        return this.fromQuickBooksAccount(base, data);
      default:
        return { ...base, name: String(data.name ?? "Unknown"), currency: String(data.currency ?? "USD") };
    }
  }

  static normalizeBalance(
    source: FinancialProvider,
    accountId: string,
    data: Record<string, unknown>,
  ): NormalizedBalance {
    const base = { source: source as FinancialProvider, externalAccountId: accountId };
    switch (source) {
      case "plaid":
        return this.fromPlaidBalance(base, data);
      default:
        return {
          ...base,
          current: new Prisma.Decimal(Number(data.current ?? 0)),
          available: data.available != null ? new Prisma.Decimal(Number(data.available)) : undefined,
          currency: String(data.iso_currency_code ?? "USD"),
          recordedAt: new Date(),
        };
    }
  }

  static normalizeTransaction(
    source: FinancialProvider,
    accountId: string,
    data: Record<string, unknown>,
  ): NormalizedTransaction {
    const base = { source: source as FinancialProvider, externalAccountId: accountId };
    switch (source) {
      case "plaid":
        return this.fromPlaidTransaction(base, data);
      default:
        return {
          ...base,
          externalId: String(data.id ?? ""),
          amount: new Prisma.Decimal(Number(data.amount ?? 0)),
          currency: String(data.iso_currency_code ?? "USD"),
          description: String(data.description ?? ""),
          pending: Boolean(data.pending ?? false),
          transactionDate: data.date ? new Date(String(data.date)) : undefined,
        };
    }
  }

  static normalizeChartOfAccount(
    data: Record<string, unknown>,
    provider?: FinancialProvider,
  ): NormalizedChartOfAccount {
    const d = data as any;
    switch (provider) {
      case "dynamics365":
        return {
          externalId: String(d.AccountNumber ?? d.id ?? ""),
          name: String(d.Name ?? d.name ?? ""),
          accountType: String(d.AccountClassification ?? d.AccountType ?? ""),
          accountSubType: String(d.AccountSubType ?? ""),
          classification: String(d.AccountCategory ?? d.classification ?? ""),
          active: d.IsBlocked != null ? !Boolean(d.IsBlocked) : true,
          balance: new Prisma.Decimal(Number(d.Balance ?? d.CurrentBalance ?? 0)),
          currency: String(d.CurrencyCode ?? d.currency ?? "USD"),
          description: String(d.Description ?? d.description ?? ""),
        };
      case "netsuite":
        return {
          externalId: String(d.id ?? d.externalId ?? ""),
          name: String(d.name ?? d.displayName ?? d.acctName ?? ""),
          accountType: String(d.accountType ?? d.acctType ?? ""),
          accountSubType: String(d.accountSubType ?? ""),
          classification: String(d.classification ?? ""),
          active: !d.isInactive,
          balance: new Prisma.Decimal(Number(d.currentBalance ?? d.balance ?? 0)),
          currency: String(d.currency ?? "USD"),
          description: String(d.description ?? ""),
        };
      case "sap":
        return {
          externalId: String(d.ChartOfAccountsCode ?? d.id ?? ""),
          name: String(d.ChartOfAccountsName ?? d.name ?? ""),
          accountType: String(d.AccountType ?? d.accountType ?? ""),
          accountSubType: String(d.AccountGroup ?? ""),
          classification: String(d.Classification ?? ""),
          active: d.IsBlockedForPosting != null ? !Boolean(d.IsBlockedForPosting) : true,
          balance: new Prisma.Decimal(Number(d.CurrentBalance ?? d.balance ?? 0)),
          currency: String(d.Currency ?? d.currency ?? "USD"),
          description: String(d.Description ?? d.description ?? ""),
        };
      default:
        return {
          externalId: String(d.Id ?? d.id ?? ""),
          name: String(d.Name ?? d.name ?? ""),
          accountType: String(d.AccountType ?? d.account_type ?? ""),
          accountSubType: String(d.AccountSubType ?? d.account_sub_type ?? ""),
          classification: String(d.Classification ?? d.classification ?? ""),
          active: d.Active != null ? Boolean(d.Active) : d.active != null ? Boolean(d.active) : true,
          balance: new Prisma.Decimal(Number(d.CurrentBalance ?? d.balance ?? 0)),
          currency: String(d.CurrencyRef?.value ?? d.currency ?? "USD"),
          description: String(d.Description ?? d.description ?? ""),
        };
    }
  }

  static normalizeVendor(data: Record<string, unknown>): NormalizedVendor {
    const d = data as any;
    return {
      externalId: String(d.Id ?? d.id ?? ""),
      displayName: String(d.DisplayName ?? d.display_name ?? d.name ?? ""),
      companyName: String(d.CompanyName ?? d.company_name ?? ""),
      email: String(d.PrimaryEmailAddr?.Address ?? d.email ?? ""),
      phone: String(d.PrimaryPhone?.FreeFormNumber ?? d.phone ?? ""),
      address: (d.BillAddr ?? d.address ?? {}) as Record<string, unknown>,
      active: d.Active != null ? Boolean(d.Active) : d.active != null ? Boolean(d.active) : true,
      balance: new Prisma.Decimal(Number(d.Balance ?? d.balance ?? 0)),
      currency: String(d.CurrencyRef?.value ?? d.currency ?? "USD"),
    };
  }

  static normalizeCustomer(data: Record<string, unknown>): NormalizedCustomer {
    const d = data as any;
    return {
      externalId: String(d.Id ?? d.id ?? ""),
      displayName: String(d.DisplayName ?? d.display_name ?? d.name ?? ""),
      companyName: String(d.CompanyName ?? d.company_name ?? ""),
      email: String(d.PrimaryEmailAddr?.Address ?? d.email ?? ""),
      phone: String(d.PrimaryPhone?.FreeFormNumber ?? d.phone ?? ""),
      address: (d.BillAddr ?? d.address ?? {}) as Record<string, unknown>,
      active: d.Active != null ? Boolean(d.Active) : d.active != null ? Boolean(d.active) : true,
      balance: new Prisma.Decimal(Number(d.Balance ?? d.balance ?? 0)),
      currency: String(d.CurrencyRef?.value ?? d.currency ?? "USD"),
    };
  }

  static normalizeInvoice(data: Record<string, unknown>): NormalizedInvoice {
    const d = data as any;
    return {
      externalId: String(d.Id ?? d.id ?? ""),
      docNumber: String(d.DocNumber ?? d.doc_number ?? ""),
      customerId: String(d.CustomerRef?.value ?? d.customer_id ?? ""),
      customerName: String(d.CustomerRef?.name ?? d.customer_name ?? ""),
      totalAmount: new Prisma.Decimal(Number(d.TotalAmt ?? d.total_amount ?? 0)),
      balance: new Prisma.Decimal(Number(d.Balance ?? d.balance ?? 0)),
      currency: String(d.CurrencyRef?.value ?? d.currency ?? "USD"),
      status: String(d.status ?? ""),
      dueDate: d.DueDate ? new Date(String(d.DueDate)) : d.due_date ? new Date(String(d.due_date)) : undefined,
      transactionDate: d.TxnDate ? new Date(String(d.TxnDate)) : d.transaction_date ? new Date(String(d.transaction_date)) : undefined,
      emailStatus: String(d.EmailStatus ?? ""),
      deliveryInfo: (d.DeliveryInfo ?? {}) as Record<string, unknown>,
      lineItems: (d.Line ?? d.line_items ?? []) as Record<string, unknown>[],
      metadata: (d.Metadata ?? {}) as Record<string, unknown>,
    };
  }

  static normalizeJournalEntry(data: Record<string, unknown>): NormalizedJournalEntry {
    const d = data as any;
    const lines = (d.Line ?? []) as any[];
    return {
      externalId: String(d.Id ?? d.id ?? ""),
      docNumber: String(d.DocNumber ?? ""),
      transactionDate: d.TxnDate ? new Date(String(d.TxnDate)) : new Date(),
      currency: String(d.CurrencyRef?.value ?? "USD"),
      lineItems: lines.map((line: any) => ({
        accountId: String(line.JournalEntryLineDetail?.AccountRef?.value ?? ""),
        accountName: String(line.JournalEntryLineDetail?.AccountRef?.name ?? ""),
        amount: new Prisma.Decimal(Number(line.Amount ?? 0)),
        side: String(line.JournalEntryLineDetail?.PostingType ?? "CREDIT") === "Debit" ? "DEBIT" : "CREDIT",
        description: String(line.Description ?? ""),
      })),
      description: String(d.description ?? ""),
    };
  }

  static normalizePayment(data: Record<string, unknown>): NormalizedPayment {
    const d = data as any;
    return {
      externalId: String(d.Id ?? d.id ?? ""),
      customerId: String(d.CustomerRef?.value ?? ""),
      customerName: String(d.CustomerRef?.name ?? ""),
      totalAmount: new Prisma.Decimal(Number(d.TotalAmt ?? d.total_amount ?? 0)),
      currency: String(d.CurrencyRef?.value ?? "USD"),
      transactionDate: d.TxnDate ? new Date(String(d.TxnDate)) : new Date(),
      paymentMethod: String(d.PaymentMethodRef?.name ?? ""),
      reference: String(d.PrivateNote ?? ""),
    };
  }

  private static fromPlaidAccount(
    base: { source: FinancialProvider; externalId: string },
    data: Record<string, unknown>,
  ): NormalizedExternalAccount {
    return {
      ...base,
      name: String(data.name ?? ""),
      officialName: String(data.official_name ?? ""),
      type: String(data.type ?? ""),
      subtype: String(data.subtype ?? ""),
      mask: String(data.mask ?? ""),
      currency: String((data as any).balances?.iso_currency_code ?? "USD"),
      institutionName: String(data.institution_name ?? ""),
      institutionId: String(data.institution_id ?? ""),
    };
  }

  private static fromPlaidBalance(
    base: { source: FinancialProvider; externalAccountId: string },
    data: Record<string, unknown>,
  ): NormalizedBalance {
    return {
      ...base,
      current: new Prisma.Decimal(Number((data as any).current ?? 0)),
      available: (data as any).available != null ? new Prisma.Decimal(Number((data as any).available)) : undefined,
      limit: (data as any).limit != null ? new Prisma.Decimal(Number((data as any).limit)) : undefined,
      currency: String(data.iso_currency_code ?? "USD"),
      recordedAt: new Date(),
    };
  }

  private static fromPlaidTransaction(
    base: { source: FinancialProvider; externalAccountId: string },
    data: Record<string, unknown>,
  ): NormalizedTransaction {
    return {
      ...base,
      externalId: String(data.transaction_id ?? data.transactionId ?? ""),
      amount: new Prisma.Decimal(Math.abs(Number(data.amount ?? 0))),
      currency: String(data.iso_currency_code ?? "USD"),
      description: String(data.name ?? ""),
      merchantName: String(data.merchant_name ?? ""),
      category: Array.isArray(data.category) ? (data.category as string[]).join(" > ") : String(data.category ?? ""),
      categoryId: String(data.category_id ?? ""),
      pending: Boolean(data.pending ?? false),
      transactionDate: data.date ? new Date(String(data.date)) : undefined,
      postDate: data.datetime ? new Date(String(data.datetime)) : undefined,
      paymentChannel: String(data.payment_channel ?? ""),
      transactionType: String(data.transaction_type ?? ""),
      isoCurrencyCode: String(data.iso_currency_code ?? "USD"),
      pendingExternalId: String(data.pending_transaction_id ?? ""),
    };
  }

  private static fromQuickBooksAccount(
    base: { source: FinancialProvider; externalId: string },
    data: Record<string, unknown>,
  ): NormalizedExternalAccount {
    return {
      ...base,
      name: String(data.Name ?? ""),
      type: String(data.AccountType ?? ""),
      subtype: String(data.AccountSubType ?? ""),
      currency: String((data as any).CurrencyRef?.value ?? "USD"),
      mask: String(data.AcctNum ?? ""),
    };
  }

  static normalizeErpVendor(data: Record<string, unknown>, provider: FinancialProvider): NormalizedVendor {
    const d = data as any;
    switch (provider) {
      case "dynamics365":
        return {
          externalId: String(d.VendorAccountNumber ?? d.id ?? ""),
          displayName: String(d.VendorName ?? d.name ?? d.displayName ?? ""),
          companyName: String(d.VendorName ?? ""),
          email: String(d.PrimaryContactEmail ?? d.email ?? ""),
          phone: String(d.PrimaryContactPhone ?? d.phone ?? ""),
          address: (d.Address ?? {}) as Record<string, unknown>,
          active: !d.IsBlocked,
          balance: new Prisma.Decimal(Number(d.Balance ?? 0)),
          currency: String(d.CurrencyCode ?? "USD"),
        };
      case "netsuite":
        return {
          externalId: String(d.id ?? d.externalId ?? ""),
          displayName: String(d.displayName ?? d.companyName ?? d.name ?? ""),
          companyName: String(d.companyName ?? ""),
          email: String(d.email ?? ""),
          phone: String(d.phone ?? ""),
          address: (d.address ?? {}) as Record<string, unknown>,
          active: !d.isInactive,
          balance: new Prisma.Decimal(Number(d.balance ?? 0)),
          currency: String(d.currency ?? "USD"),
        };
      default:
        return {
          externalId: String(d.id ?? ""),
          displayName: String(d.name ?? d.displayName ?? ""),
          companyName: String(d.companyName ?? ""),
          email: String(d.email ?? ""),
          phone: String(d.phone ?? ""),
          address: (d.address ?? {}) as Record<string, unknown>,
          active: true,
          balance: new Prisma.Decimal(0),
          currency: "USD",
        };
    }
  }

  static normalizeErpCustomer(data: Record<string, unknown>, provider: FinancialProvider): NormalizedCustomer {
    const d = data as any;
    switch (provider) {
      case "dynamics365":
        return {
          externalId: String(d.CustomerAccount ?? d.id ?? ""),
          displayName: String(d.CustomerName ?? d.name ?? d.displayName ?? ""),
          companyName: String(d.CustomerName ?? ""),
          email: String(d.PrimaryContactEmail ?? d.email ?? ""),
          phone: String(d.PrimaryContactPhone ?? d.phone ?? ""),
          address: (d.Address ?? {}) as Record<string, unknown>,
          active: !d.IsBlocked,
          balance: new Prisma.Decimal(Number(d.Balance ?? 0)),
          currency: String(d.CurrencyCode ?? "USD"),
        };
      case "netsuite":
        return {
          externalId: String(d.id ?? d.externalId ?? ""),
          displayName: String(d.displayName ?? d.companyName ?? d.name ?? ""),
          companyName: String(d.companyName ?? ""),
          email: String(d.email ?? ""),
          phone: String(d.phone ?? ""),
          address: (d.address ?? {}) as Record<string, unknown>,
          active: !d.isInactive,
          balance: new Prisma.Decimal(Number(d.balance ?? 0)),
          currency: String(d.currency ?? "USD"),
        };
      default:
        return {
          externalId: String(d.id ?? ""),
          displayName: String(d.name ?? d.displayName ?? ""),
          companyName: String(d.companyName ?? ""),
          email: String(d.email ?? ""),
          phone: String(d.phone ?? ""),
          address: (d.address ?? {}) as Record<string, unknown>,
          active: true,
          balance: new Prisma.Decimal(0),
          currency: "USD",
        };
    }
  }
}
