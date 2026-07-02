import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit/audit.service";
import { AuditAction } from "@/domain/constants/audit-actions";
import { ValidationError } from "@/lib/errors/app-error";

const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, CHF: 0.88, AUD: 1.53, MXN: 17.2, BRL: 4.98, NGN: 1540, AED: 3.67, ZAR: 18.5 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, CHF: 0.96, AUD: 1.66, NGN: 1674, AED: 4.0, ZAR: 20.1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, NGN: 1956, AED: 4.67, ZAR: 23.5 },
  NGN: { USD: 1 / 1540, EUR: 1 / 1674, GBP: 1 / 1956, AED: 1 / (1540 / 3.67), ZAR: 18.5 / 1540 },
  AED: { USD: 1 / 3.67, EUR: 1 / 4.0, GBP: 1 / 4.67, NGN: 1540 / 3.67, ZAR: 18.5 / 3.67 },
  ZAR: { USD: 1 / 18.5, EUR: 1 / 20.1, GBP: 1 / 23.5, NGN: 1540 / 18.5, AED: 3.67 / 18.5 },
};

export class CurrencyService {
  static async getRate(
    ctx: TenantContext,
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<{ rate: number; source: string } | null> {
    if (baseCurrency === quoteCurrency) {
      return { rate: 1, source: "identity" };
    }

    const bc = baseCurrency.toUpperCase();
    const qc = quoteCurrency.toUpperCase();

    const row = await prisma.exchangeRate.findUnique({
      where: {
        companyId_baseCurrency_quoteCurrency: {
          companyId: ctx.companyId,
          baseCurrency: bc,
          quoteCurrency: qc,
        },
      },
    });

    if (row && (!row.validTo || row.validTo > new Date())) {
      return { rate: Number(row.rate), source: row.source };
    }

    const fallbackRate = FALLBACK_RATES[bc]?.[qc];
    if (fallbackRate) {
      return { rate: fallbackRate, source: "fallback" };
    }

    const inverseRate = await prisma.exchangeRate.findUnique({
      where: {
        companyId_baseCurrency_quoteCurrency: {
          companyId: ctx.companyId,
          baseCurrency: qc,
          quoteCurrency: bc,
        },
      },
    });
    if (inverseRate && (!inverseRate.validTo || inverseRate.validTo > new Date())) {
      return { rate: Number(1 / Number(inverseRate.rate)), source: `inverse:${inverseRate.source}` };
    }

    const inverseFallback = FALLBACK_RATES[qc]?.[bc];
    if (inverseFallback) {
      return { rate: 1 / inverseFallback, source: "inverse:fallback" };
    }

    return null;
  }

  static async convert(
    ctx: TenantContext,
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ convertedAmount: number; rate: number; source: string }> {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, rate: 1, source: "identity" };
    }

    const rateInfo = await this.getRate(ctx, fromCurrency, toCurrency);
    if (!rateInfo) {
      throw new ValidationError(
        `No exchange rate available for ${fromCurrency} → ${toCurrency}`,
      );
    }

    return {
      convertedAmount: Number((amount * rateInfo.rate).toFixed(2)),
      rate: rateInfo.rate,
      source: rateInfo.source,
    };
  }

  static async setRate(
    ctx: TenantContext,
    baseCurrency: string,
    quoteCurrency: string,
    rate: number,
    source?: string,
  ) {
    if (baseCurrency === quoteCurrency) {
      throw new ValidationError("Cannot set a rate for the same currency pair.");
    }

    const bc = baseCurrency.toUpperCase();
    const qc = quoteCurrency.toUpperCase();

    await prisma.exchangeRate.upsert({
      where: {
        companyId_baseCurrency_quoteCurrency: {
          companyId: ctx.companyId,
          baseCurrency: bc,
          quoteCurrency: qc,
        },
      },
      create: {
        companyId: ctx.companyId,
        baseCurrency: bc,
        quoteCurrency: qc,
        rate,
        source: source ?? "manual",
      },
      update: {
        rate,
        source: source ?? "manual",
        validTo: null,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: AuditAction.RATE_UPDATED,
      resourceType: "ExchangeRate",
      resourceId: `${bc}/${qc}`,
      metadata: { baseCurrency: bc, quoteCurrency: qc, rate: rate.toString() },
    });
  }

  static async listRates(ctx: TenantContext) {
    const rows = await prisma.exchangeRate.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ baseCurrency: "asc" }, { quoteCurrency: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      baseCurrency: r.baseCurrency,
      quoteCurrency: r.quoteCurrency,
      rate: Number(r.rate),
      source: r.source,
      validFrom: r.validFrom.toISOString(),
      validTo: r.validTo?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  static async listAvailableCurrencies(): Promise<string[]> {
    const all = new Set<string>();
    for (const [base, quotes] of Object.entries(FALLBACK_RATES)) {
      all.add(base);
      for (const quote of Object.keys(quotes)) {
        all.add(quote);
      }
    }
    return Array.from(all).sort();
  }
}
