/**
 * Program 1 — Treasury Intelligence Platform: Prisma Data Source
 *
 * The default `TreasuryDataSource` adapter. Maps the existing Prisma treasury
 * models into the platform's canonical domain records. This is a thin, honest
 * projection — records that have no persistence home yet (for example a
 * standalone treasury payment table) are derived from the closest existing
 * model or returned empty with the gap disclosed in the module docs.
 *
 * Deterministic: all collections are sorted by a stable key before returning.
 */

import { prisma } from "@/server/db/prisma";
import type {
  BankAccountRecord,
  CashForecastRecord,
  CashPositionRecord,
  FxExposureRecord,
  LiquidityPositionRecord,
  TreasuryAlertRecord,
  TreasuryFundingRecord,
  TreasuryPaymentRecord,
  TreasuryTransferRecord,
} from "./types";
import type { TreasuryDataSource } from "./data-source";
import { RISK_ORDER } from "./types";

const toDecimal = (value: { toString(): string }): string => value.toString();

export class PrismaTreasuryDataSource implements TreasuryDataSource {
  async getCashPositions(tenantId: string): Promise<CashPositionRecord[]> {
    const rows = await prisma.treasuryCashPosition.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): CashPositionRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.legalEntityId,
        region: row.region,
        currency: row.currency,
        classification: (row.classification as CashPositionRecord["classification"]) ?? "other",
        totalBalance: toDecimal(row.totalBalance),
        availableBalance: toDecimal(row.availableBalance),
        ledgerBalance: toDecimal(row.ledgerBalance),
        floatBalance: toDecimal(row.floatBalance),
        bankBalance: toDecimal(row.bankBalance),
        bankAccountId: row.bankAccountId,
        institutionName: row.institutionName,
        lastSyncedAt: row.lastSyncedAt.toISOString(),
        recordedAt: row.recordedAt.toISOString(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getLiquidityPositions(tenantId: string): Promise<LiquidityPositionRecord[]> {
    const rows = await prisma.treasuryLiquidityPosition.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): LiquidityPositionRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.legalEntityId,
        region: row.region,
        currency: row.currency,
        category: row.category,
        amount: toDecimal(row.amount),
        daysToLiquidate: row.daysToLiquidate,
        lastCalculatedAt: row.lastCalculatedAt.toISOString(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getForecasts(tenantId: string): Promise<CashForecastRecord[]> {
    const rows = await prisma.treasuryCashForecast.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): CashForecastRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.legalEntityId,
        currency: row.currency,
        horizon: (row.horizon as CashForecastRecord["horizon"]) ?? "month",
        confidence: (row.confidence as CashForecastRecord["confidence"]) ?? "medium",
        generatedAt: row.generatedAt.toISOString(),
        validFrom: row.validFrom.toISOString(),
        validTo: row.validTo.toISOString(),
        predictedInflows: Array.isArray(row.predictedInflows)
          ? (row.predictedInflows as unknown as CashForecastRecord["predictedInflows"])
          : [],
        predictedOutflows: Array.isArray(row.predictedOutflows)
          ? (row.predictedOutflows as unknown as CashForecastRecord["predictedOutflows"])
          : [],
        netPrediction: toDecimal(row.netPrediction),
        openingBalance: toDecimal(row.openingBalance),
        closingBalance: toDecimal(row.closingBalance),
        minimumProjectedBalance: toDecimal(row.minimumProjectedBalance),
        maximumProjectedBalance: toDecimal(row.maximumProjectedBalance),
        keyRisks: row.keyRisks ?? [],
        keyAssumptions: row.keyAssumptions ?? [],
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getBankAccounts(tenantId: string): Promise<BankAccountRecord[]> {
    const rows = await prisma.treasuryAccount.findMany({
      where: { companyId: tenantId },
      orderBy: { name: "asc" },
    });
    return rows.map((row): BankAccountRecord => ({
      tenantId: row.companyId,
      id: row.id,
      entityId: tenantId,
      name: row.name,
      currency: row.currency,
      accountNumber: row.accountNumber,
      bankName: row.name,
      bankCode: "",
      country: "",
      balance: toDecimal(row.balance),
      isActive: row.isActive,
      lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    }));
  }

  /**
   * Treasury payments awaiting release. No standalone payment table exists in
   * the schema yet, so the adapter derives "payments" from cash movements that
   * require approval — a movement awaiting a release decision IS the treasury
   * payment in this schema. The decision type and workflow are generic and
   * fully tested through the data-source boundary; swapping in a dedicated
   * payment table later requires only a new adapter method.
   */
  async getPayments(tenantId: string): Promise<TreasuryPaymentRecord[]> {
    const rows = await prisma.treasuryCashMovement.findMany({
      where: { companyId: tenantId, approvalRequired: true },
    });
    return rows
      .map((row): TreasuryPaymentRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.sourceLegalEntityId,
        beneficiaryName: row.reason,
        beneficiaryRiskLevel: "low",
        amount: toDecimal(row.amount),
        currency: row.currency,
        method: row.fundingType,
        status: row.status === "PENDING" ? "pending-approval" : "processing",
        scheduledDate: row.requestedAt.toISOString(),
        initiatorId: row.approvedById ?? "",
        approvedById: row.approvedById,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        reference: row.referenceId,
        bankConfirmationId: null,
        mandateVerified: false,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getTransfers(tenantId: string): Promise<TreasuryTransferRecord[]> {
    const rows = await prisma.treasuryCashMovement.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): TreasuryTransferRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.sourceLegalEntityId,
        sourceAccountId: row.sourceAccountId,
        targetAccountId: row.targetAccountId,
        currency: row.currency,
        amount: toDecimal(row.amount),
        fundingType: row.fundingType,
        status: this.movementStatus(row.status),
        reason: row.reason,
        approvalRequired: row.approvalRequired,
        approvedById: row.approvedById,
        requestedAt: row.requestedAt.toISOString(),
        executedAt: row.executedAt?.toISOString() ?? null,
        failureReason: row.failureReason,
        referenceId: row.referenceId,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getFundingRequests(tenantId: string): Promise<TreasuryFundingRecord[]> {
    const rows = await prisma.treasuryFundingRequest.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): TreasuryFundingRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.sourceLegalEntityId,
        sourceEntityId: row.sourceLegalEntityId,
        targetEntityId: row.targetLegalEntityId,
        currency: row.currency,
        amount: toDecimal(row.requestedAmount),
        purpose: row.reason,
        status: this.movementStatus(row.status),
        intercompanyAgreementRef: null,
        approvedById: row.approvedById,
        requestedAt: row.createdAt.toISOString(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getFxExposure(tenantId: string): Promise<FxExposureRecord[]> {
    const rows = await prisma.treasuryFXExposure.findMany({
      where: { companyId: tenantId },
    });
    return rows
      .map((row): FxExposureRecord => ({
        tenantId: row.companyId,
        id: row.id,
        entityId: row.legalEntityId,
        currency: `${row.sourceCurrency}/${row.targetCurrency}`,
        exposure: toDecimal(row.exposureAmount),
        rate: toDecimal(row.currentRate),
        counterpartyRiskLevel: row.breachLimit ? "high" : "low",
        hedged: row.hedgeStatus === "HEDGED",
        measuredAt: row.updatedAt.toISOString(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async getAlerts(tenantId: string): Promise<TreasuryAlertRecord[]> {
    const rows = await prisma.treasuryAlert.findMany({
      where: { companyId: tenantId },
      orderBy: { createdAt: "desc" },
    });
    return rows
      .map((row): TreasuryAlertRecord => ({
        tenantId: row.companyId,
        id: row.id,
        severity: (row.severity as TreasuryAlertRecord["severity"]) ?? "warning",
        category: (row.category as TreasuryAlertRecord["category"]) ?? "liquidity",
        title: row.title,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
        target: row.legalEntityId
          ? { type: "treasury.cash-position", id: row.legalEntityId }
          : null,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private movementStatus(status: string): TreasuryTransferRecord["status"] {
    const normalized = status.toUpperCase();
    const map: Record<string, TreasuryTransferRecord["status"]> = {
      PENDING: "pending-approval",
      DRAFT: "draft",
      APPROVED: "approved",
      REJECTED: "rejected",
      PROCESSING: "processing",
      COMPLETED: "executed",
      FAILED: "failed",
      CANCELLED: "cancelled",
    };
    return map[normalized] ?? "pending-approval";
  }
}

export { RISK_ORDER };
