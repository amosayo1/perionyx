import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit/audit.service";
import { AuditAction } from "@/domain/constants/audit-actions";
import { ValidationError } from "@/lib/errors/app-error";
import { createFxProvider } from "./fx.provider";
import { logger } from "@/lib/logger";
import { getCached, CacheTier, tenantKey, CacheDomains } from "@/server/cache";
import type { FxSyncResult, FxSyncStatus } from "./fx.types";

const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR",
];

const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, CHF: 0.88, AUD: 1.53, MXN: 17.2, BRL: 4.98, NGN: 1540, AED: 3.67, ZAR: 18.5 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, CHF: 0.96, AUD: 1.66, NGN: 1674, AED: 4.0, ZAR: 20.1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, NGN: 1956, AED: 4.67, ZAR: 23.5 },
  NGN: { USD: 1 / 1540, EUR: 1 / 1674, GBP: 1 / 1956, AED: 3.67 / 1540, ZAR: 18.5 / 1540 },
  AED: { USD: 1 / 3.67, EUR: 1 / 4.0, GBP: 1 / 4.67, NGN: 1540 / 3.67, ZAR: 18.5 / 3.67 },
  ZAR: { USD: 1 / 18.5, EUR: 1 / 20.1, GBP: 1 / 23.5, NGN: 1540 / 18.5, AED: 3.67 / 18.5 },
};

export class FxService {
  static async syncRates(companyId: string, actorUserId: string): Promise<FxSyncResult> {
    const startedAt = new Date();
    const provider = createFxProvider();
    const source = process.env.FX_API_KEY ? "exchange-rate-host" : "mock";

    try {
      let totalRates = 0;

      for (const base of SUPPORTED_CURRENCIES) {
        const rates = await provider.getRates(base);

        if (rates.length === 0) continue;

        const validRates = rates.filter((r) => {
          if (!r.rate || r.rate <= 0 || !isFinite(r.rate)) {
            logger.warn({ baseCurrency: r.baseCurrency, quoteCurrency: r.quoteCurrency, rate: r.rate }, "[FX] Validation failed");
            return false;
          }
          return true;
        });

        if (validRates.length === 0) continue;

        const now = new Date();
        const batch = validRates.map((r) => ({
          companyId,
          baseCurrency: r.baseCurrency,
          quoteCurrency: r.quoteCurrency,
          rate: new Prisma.Decimal(r.rate),
          source,
          validFrom: now,
          validTo: null as Date | null,
          fetchedAt: now,
        }));

        for (const record of batch) {
          await prisma.exchangeRate.upsert({
            where: {
              companyId_baseCurrency_quoteCurrency: {
                companyId: record.companyId,
                baseCurrency: record.baseCurrency,
                quoteCurrency: record.quoteCurrency,
              },
            },
            create: record,
            update: {
              rate: record.rate,
              source: record.source,
              validFrom: record.validFrom,
              validTo: record.validTo,
              fetchedAt: record.fetchedAt,
            },
          });
          totalRates++;
        }
      }

      await recordAudit(prisma, {
        companyId,
        actorUserId,
        action: AuditAction.FX_RATE_SYNC,
        resourceType: "ExchangeRate",
        resourceId: "fx-sync",
        metadata: {
          source,
          currencyCount: totalRates.toString(),
          timestamp: startedAt.toISOString(),
        },
      });

      return {
        success: true,
        currenciesUpdated: totalRates,
        source,
        timestamp: startedAt.toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      try {
        await recordAudit(prisma, {
          companyId,
          actorUserId,
          action: AuditAction.FX_RATE_SYNC_FAILED,
          resourceType: "ExchangeRate",
          resourceId: "fx-sync",
          metadata: {
            error: errorMessage,
            provider: source,
            timestamp: startedAt.toISOString(),
          },
        });
      } catch (auditError) {
        logger.error({ err: auditError }, "[FX] Failed to record FX_RATE_SYNC_FAILED audit");
      }

      return {
        success: false,
        currenciesUpdated: 0,
        source,
        error: errorMessage,
        timestamp: startedAt.toISOString(),
      };
    }
  }

  static async getLatestRates(companyId: string) {
    const cacheKey = tenantKey(companyId, CacheDomains.METADATA, "fx", "rates");
    return getCached(cacheKey, () => this._getLatestRates(companyId), CacheTier.LONG);
  }

  static async _getLatestRates(companyId: string) {
    const rows = await prisma.exchangeRate.findMany({
      where: { companyId, validTo: null },
      orderBy: [{ baseCurrency: "asc" }, { quoteCurrency: "asc" }],
    });

    return rows.map((r) => ({
      id: r.id,
      baseCurrency: r.baseCurrency,
      quoteCurrency: r.quoteCurrency,
      rate: Number(r.rate),
      source: r.source,
      fetchedAt: r.fetchedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  static async getRate(
    companyId: string,
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
          companyId,
          baseCurrency: bc,
          quoteCurrency: qc,
        },
      },
    });

    if (row && (!row.validTo || row.validTo > new Date())) {
      return { rate: Number(row.rate), source: row.source };
    }

    const inverseRow = await prisma.exchangeRate.findUnique({
      where: {
        companyId_baseCurrency_quoteCurrency: {
          companyId,
          baseCurrency: qc,
          quoteCurrency: bc,
        },
      },
    });
    if (inverseRow && (!inverseRow.validTo || inverseRow.validTo > new Date())) {
      return { rate: Number(1 / Number(inverseRow.rate)), source: `inverse:${inverseRow.source}` };
    }

    const fallbackRate = FALLBACK_RATES[bc]?.[qc];
    if (fallbackRate) {
      return { rate: fallbackRate, source: "fallback" };
    }

    const inverseFallback = FALLBACK_RATES[qc]?.[bc];
    if (inverseFallback) {
      return { rate: 1 / inverseFallback, source: "inverse:fallback" };
    }

    return null;
  }

  static async convert(
    companyId: string,
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ convertedAmount: number; rate: number; source: string }> {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, rate: 1, source: "identity" };
    }

    const rateInfo = await this.getRate(companyId, fromCurrency, toCurrency);
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

  static async getSyncStatus(companyId: string): Promise<FxSyncStatus> {
    const lastAudit = await prisma.auditLog.findFirst({
      where: {
        companyId,
        action: { in: [AuditAction.FX_RATE_SYNC, AuditAction.FX_RATE_SYNC_FAILED] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lastAudit) {
      return {
        lastSyncAt: null,
        lastSyncSuccess: null,
        lastError: null,
        provider: process.env.FX_API_KEY ? "exchange-rate-host" : "mock",
        currenciesUpdated: null,
        active: Boolean(process.env.FX_API_KEY),
      };
    }

    const metadata = lastAudit.metadata as Record<string, string> | null;
    return {
      lastSyncAt: lastAudit.createdAt.toISOString(),
      lastSyncSuccess: lastAudit.action === AuditAction.FX_RATE_SYNC,
      lastError: metadata?.error ?? null,
      provider: metadata?.provider ?? (process.env.FX_API_KEY ? "exchange-rate-host" : "mock"),
      currenciesUpdated: metadata?.currencyCount ? parseInt(metadata.currencyCount, 10) : null,
      active: Boolean(process.env.FX_API_KEY),
    };
  }

  static async checkHealth(companyId: string): Promise<{ healthy: boolean; hoursSinceLastSync: number | null }> {
    const lastSync = await prisma.auditLog.findFirst({
      where: { companyId, action: AuditAction.FX_RATE_SYNC },
      orderBy: { createdAt: "desc" },
    });

    if (!lastSync) {
      return { healthy: false, hoursSinceLastSync: null };
    }

    const hoursSinceLastSync = (Date.now() - lastSync.createdAt.getTime()) / 3_600_000;
    return { healthy: hoursSinceLastSync < 24, hoursSinceLastSync };
  }

  static async listAvailableCurrencies(): Promise<string[]> {
    return [...SUPPORTED_CURRENCIES].sort();
  }
}
