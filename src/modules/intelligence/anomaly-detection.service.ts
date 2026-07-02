import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { riskService } from "@/modules/risk/risk.service";

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";
const SYSTEM_CTX = { userId: SYSTEM_USER_ID, role: "OWNER" as const };

interface AnomalyResult {
  metric: string;
  label: string | null;
  currentValue: number;
  mean: number;
  stdDev: number;
  deviation: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  direction: "spike" | "drop";
}

/// Computes mean and population standard deviation.
function computeStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

/// Metrics that make sense to detect anomalies on (numeric, trending).
const MONITORED_METRICS = [
  "cash_position",
  "risk_score",
  "pending_approvals",
  "failed_transactions",
  "policy_violations",
  "critical_alerts",
  "overdue_approvals",
  "reconciliation_exceptions",
  "reconciliation_match_rate",
  "transaction_volume",
  "high_severity_audit",
];

const MIN_SAMPLES = 6;
const STDDEV_THRESHOLD = 2;

export async function detectAnomalies(companyId: string): Promise<AnomalyResult[]> {
  const anomalies: AnomalyResult[] = [];

  for (const metric of MONITORED_METRICS) {
    try {
      const records = await prisma.intelligenceSnapshot.findMany({
        where: { companyId, metric },
        orderBy: { takenAt: "desc" },
        take: 50,
        select: { value: true, label: true, takenAt: true },
      });

      if (records.length < MIN_SAMPLES) {
        logger.debug({ companyId, metric, count: records.length }, "[AnomalyDetection] Insufficient samples");
        continue;
      }

      const values = records.map((r) => Number(r.value));
      const currentValue = values[0];
      const historicalValues = values.slice(1);

      const { mean, stdDev } = computeStats(historicalValues);

      if (stdDev === 0) {
        logger.debug({ companyId, metric }, "[AnomalyDetection] Zero variance — skipping");
        continue;
      }

      const deviation = Math.abs((currentValue - mean) / stdDev);

      if (deviation >= STDDEV_THRESHOLD) {
        const direction = currentValue > mean ? "spike" : "drop";
        const severity: "LOW" | "MEDIUM" | "HIGH" =
          deviation >= 4 ? "HIGH" : deviation >= 3 ? "MEDIUM" : "LOW";

        anomalies.push({
          metric,
          label: records[0].label,
          currentValue,
          mean,
          stdDev,
          deviation: Math.round(deviation * 100) / 100,
          severity,
          direction,
        });
      }
    } catch (err) {
      logger.error({ err, companyId, metric }, "[AnomalyDetection] Metric evaluation failed");
    }
  }

  return anomalies;
}

export async function detectAndAlert(companyId: string): Promise<AnomalyResult[]> {
  const anomalies = await detectAnomalies(companyId);

  for (const anomaly of anomalies) {
    try {
      const directionLabel = anomaly.direction === "spike" ? "spike" : "drop";
      const title = `${anomaly.label ?? anomaly.metric} ${directionLabel} detected`;
      const description =
        `${anomaly.label ?? anomaly.metric} is at ${formatValue(anomaly.currentValue, anomaly.metric)}` +
        ` (${Math.round(anomaly.deviation * 100) / 100}σ from historical mean of ${formatValue(anomaly.mean, anomaly.metric)}).` +
        ` This is a ${anomaly.direction === "spike" ? "increase" : "decrease"} that exceeds normal variation.`;

      const severityMap: Record<string, "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = {
        LOW: "LOW",
        MEDIUM: "MEDIUM",
        HIGH: "HIGH",
      };

      await riskService.createAlert(
        { ...SYSTEM_CTX, companyId },
        {
          category: "BALANCE_ANOMALY",
          severity: severityMap[anomaly.severity],
          title,
          description,
          source: `anomaly-detection:${anomaly.metric}`,
          metadata: {
            metric: anomaly.metric,
            currentValue: anomaly.currentValue,
            mean: anomaly.mean,
            stdDev: anomaly.stdDev,
            deviation: anomaly.deviation,
            direction: anomaly.direction,
          },
        },
      );

      logger.info({ companyId, metric: anomaly.metric, severity: anomaly.severity, deviation: anomaly.deviation },
        "[AnomalyDetection] Alert created");
    } catch (err) {
      logger.error({ err, companyId, metric: anomaly.metric }, "[AnomalyDetection] Failed to create alert");
    }
  }

  return anomalies;
}

export async function detectAllCompanies(): Promise<void> {
  logger.info("[AnomalyDetection] Running for all companies");

  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const anomalies = await detectAndAlert(company.id);
      if (anomalies.length > 0) {
        logger.info({ companyId: company.id, anomalyCount: anomalies.length }, "[AnomalyDetection] Anomalies found");
      }
    } catch (err) {
      logger.error({ err, companyId: company.id }, "[AnomalyDetection] Failed");
    }
  }

  logger.info("[AnomalyDetection] Complete for all companies");
}

function formatValue(value: number, metric: string): string {
  if (metric === "cash_position") {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }
  if (metric.includes("rate") || metric.includes("sla") || metric.includes("efficiency")) {
    return `${value.toFixed(1)}%`;
  }
  return String(Math.round(value));
}
