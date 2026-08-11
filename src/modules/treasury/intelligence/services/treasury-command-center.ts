/**
 * Program 1 — Treasury Intelligence Platform: Treasury Command Center Service
 *
 * The aggregate read surface for the treasury executive. Composes the measured
 * analysis modules (cash position, liquidity, forecast), the recorded alerts
 * and FX exposures, and the live treasury decision queue — everything through
 * the TreasuryDataSource boundary and the canonical Workflow Service. Never
 * reasons and never writes: every number is computed from recorded facts, and
 * `now` is injectable so the surface is time-stable in tests.
 */

import { EnterpriseWorkflowEngine } from "@/modules/enterprise-workflow/engine";
import type { WorkQueueItem } from "@/modules/enterprise-workflow/types";
import { getTreasuryDataSource, type TreasuryDataSource } from "../data-source";
import { TREASURY_HIGH_VALUE_AMOUNT } from "../constants";
import { analyzeCashPosition, type CashPositionAnalysis } from "../analysis/cash-position";
import { analyzeLiquidity, type LiquidityAnalysis } from "../analysis/liquidity";
import { analyzeForecast, type ForecastAnalysis } from "../analysis/forecast";
import { TreasuryWorkflowService } from "./treasury-workflow-service";
import type {
  TreasuryAlertRecord,
  TreasuryFundingRecord,
  TreasuryPaymentRecord,
  TreasuryTransferRecord,
  FxExposureRecord,
} from "../types";

export interface TreasuryFxSummary {
  currency: string;
  exposure: number;
  hedged: boolean;
  counterpartyRiskLevel: "low" | "medium" | "high" | "critical";
}

export interface TreasuryMovementTally {
  awaitingDecision: number;
  highValueAwaitingDecision: number;
  releasedToday: number;
}

export interface TreasuryCommandCenter {
  tenantId: string;
  measuredAt: string;
  cash: CashPositionAnalysis;
  liquidity: LiquidityAnalysis;
  forecast: ForecastAnalysis | null;
  fx: TreasuryFxSummary[];
  alerts: TreasuryAlertRecord[];
  decisions: WorkQueueItem[];
  movements: {
    payments: TreasuryMovementTally;
    transfers: TreasuryMovementTally;
    funding: TreasuryMovementTally;
  };
}

const PENDING_PAYMENT_STATUSES = ["pending-approval", "scheduled", "draft"];
const PENDING_MOVEMENT_STATUSES = ["pending-approval", "draft"];

export class TreasuryCommandCenterService {
  private readonly source: TreasuryDataSource;
  private readonly workflow: TreasuryWorkflowService;

  constructor(
    source: TreasuryDataSource = getTreasuryDataSource(),
    workflow: TreasuryWorkflowService = new TreasuryWorkflowService(
      EnterpriseWorkflowEngine.getInstance(),
    ),
  ) {
    this.source = source;
    this.workflow = workflow;
  }

  /** Full command center surface for a tenant — deterministic with `now`. */
  async overview(tenantId: string, now = new Date().toISOString()): Promise<TreasuryCommandCenter> {
    const [
      positions,
      liquidity,
      forecasts,
      payments,
      transfers,
      funding,
      fxRows,
      alerts,
    ] = await Promise.all([
      this.source.getCashPositions(tenantId),
      this.source.getLiquidityPositions(tenantId),
      this.source.getForecasts(tenantId),
      this.source.getPayments(tenantId),
      this.source.getTransfers(tenantId),
      this.source.getFundingRequests(tenantId),
      this.source.getFxExposure(tenantId),
      this.source.getAlerts(tenantId),
    ]);

    const latestForecast = forecasts.length > 0
      ? forecasts.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0]
      : null;

    return {
      tenantId,
      measuredAt: now,
      cash: analyzeCashPosition(positions, alerts, now),
      liquidity: analyzeLiquidity(liquidity, now),
      forecast: analyzeForecast(latestForecast),
      fx: summarizeFx(fxRows),
      alerts,
      decisions: this.workflow.getDecisionQueue(tenantId),
      movements: {
        payments: tallyPayments(payments, now),
        transfers: tallyMovements(transfers, now),
        funding: tallyMovements(funding, now),
      },
    };
  }
}

function tallyPayments(payments: TreasuryPaymentRecord[], now: string): TreasuryMovementTally {
  const awaiting = payments.filter((p) => PENDING_PAYMENT_STATUSES.includes(p.status));
  return {
    awaitingDecision: awaiting.length,
    highValueAwaitingDecision: awaiting.filter((p) => Number(p.amount) > TREASURY_HIGH_VALUE_AMOUNT).length,
    releasedToday: payments.filter((p) => p.status === "released" && sameDay(p.updatedAt, now)).length,
  };
}

type MovementRecord = TreasuryTransferRecord | TreasuryFundingRecord;

function movementExecutedAt(r: MovementRecord): string | null {
  return "executedAt" in r ? r.executedAt : null;
}

function tallyMovements(
  records: MovementRecord[],
  now: string,
): TreasuryMovementTally {
  const awaiting = records.filter((r) => PENDING_MOVEMENT_STATUSES.includes(r.status));
  return {
    awaitingDecision: awaiting.length,
    highValueAwaitingDecision: awaiting.filter((r) => Number(r.amount) > TREASURY_HIGH_VALUE_AMOUNT).length,
    releasedToday: records.filter((r) => r.status === "executed" && sameDay(movementExecutedAt(r) ?? r.requestedAt, now)).length,
  };
}

function summarizeFx(rows: FxExposureRecord[]): TreasuryFxSummary[] {
  return rows
    .map((row) => ({
      currency: row.currency,
      exposure: Number(row.exposure),
      hedged: row.hedged,
      counterpartyRiskLevel: row.counterpartyRiskLevel,
    }))
    .sort((a, b) => b.exposure - a.exposure);
}

function sameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}
