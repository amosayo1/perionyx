import { prisma } from "@/server/db/prisma";
import type { Prediction, PredictionEvidence, PredictionRecommendation, PredictionCategory, ConfidenceLevel } from "./types";
import { confidenceScoreCalculator } from "./confidence-score-calculator";
import { predictionRegistry } from "./prediction-registry";
import { predictionAuditService } from "./prediction-audit-service";
import { recommendationPrioritizer } from "./recommendation-prioritizer";

export class PredictionEvidenceCollector {
  async collectAll(companyId: string): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    const results = await Promise.allSettled([
      this.predictCashShortage(companyId),
      this.predictLateApprovals(companyId),
      this.predictWorkflowBottlenecks(companyId),
      this.predictSLABreaches(companyId),
      this.predictMonthEndCompletionRisk(companyId),
      this.predictReconciliationDelays(companyId),
      this.predictOutstandingApprovals(companyId),
      this.predictHighRiskWorkflows(companyId),
      this.predictOverdueComplianceTasks(companyId),
      this.predictForecastVariance(companyId),
      this.predictDuplicatePaymentRisk(companyId),
      this.predictInactiveUsers(companyId),
    ]);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        predictions.push(result.value);
        predictionRegistry.register(result.value);
        predictionAuditService.recordGeneration(result.value);
      }
    }

    return predictions;
  }

  private baseId(companyId: string, suffix: string): string {
    return `pred-${companyId}-${suffix}-${Date.now()}`;
  }

  private auditRef(companyId: string, suffix: string): string {
    return `prediction-${companyId}-${suffix}-${Date.now()}`;
  }

  private async predictCashShortage(companyId: string): Promise<Prediction | null> {
    const wallets = await prisma.wallet.findMany({ where: { companyId } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const pendingOutflows = await prisma.transaction.aggregate({
      where: { companyId, status: "PENDING", type: { in: ["WALLET_DEBIT", "INTERNAL_TRANSFER"] } },
      _sum: { primaryAmount: true },
    });

    const outflowTotal = Number(pendingOutflows._sum.primaryAmount ?? 0);
    const projectedBalance = totalBalance - outflowTotal;
    const threshold = totalBalance * 0.2;

    if (projectedBalance >= threshold) return null;

    const deficit = threshold - projectedBalance;
    const evidence: PredictionEvidence[] = [
      { type: "wallet_balance", description: "Total wallet balance", value: totalBalance, source: "Wallet", timestamp: new Date().toISOString() },
      { type: "pending_outflows", description: "Total pending outflows", value: outflowTotal, source: "Transaction", timestamp: new Date().toISOString() },
      { type: "projected_balance", description: "Projected balance after pending outflows", value: projectedBalance, source: "calculated", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromThresholdDeviation(totalBalance, threshold, totalBalance - projectedBalance, 0.85);

    const recommendations: PredictionRecommendation[] = [
      { action: "Review pending outflows and prioritize critical payments", rationale: `${deficit < 0 ? "Cash deficit of" : "Available cash of"} $${Math.abs(deficit).toLocaleString()} projected`, priority: "critical", effort: "low" },
      { action: "Consider delaying non-essential payments until inflows clear", rationale: "Preserve operating cash position", priority: "high", effort: "low" },
    ];

    return {
      id: this.baseId(companyId, "cash-shortage"),
      title: "Potential Cash Shortage",
      category: "CASH_FLOW",
      description: `Projected balance of $${projectedBalance.toLocaleString()} may fall below operating threshold of $${threshold.toLocaleString()}`,
      businessExplanation: `Pending outflows of $${outflowTotal.toLocaleString()} will reduce available cash. Current balance: $${totalBalance.toLocaleString()}.`,
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { totalBalance, outflowTotal, projectedBalance, threshold, deficit },
      affectedModules: ["Treasury", "Payments"],
      recommendations,
      severity: deficit < 0 ? "critical" : "high",
      businessImpact: "Cash shortage may delay payments and impact vendor relationships",
      horizon: "NEAR_TERM",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "cash-shortage"),
    };
  }

  private async predictLateApprovals(companyId: string): Promise<Prediction | null> {
    const pendingApprovals = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
    });

    if (pendingApprovals === 0) return null;

    const totalPending = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING" },
    });

    const evidence: PredictionEvidence[] = [
      { type: "overdue_approvals", description: "Approvals exceeding 24-hour SLA", value: pendingApprovals, source: "TransactionApproval", timestamp: new Date().toISOString() },
      { type: "total_pending", description: "Total pending approvals", value: totalPending, source: "TransactionApproval", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromSignalCount(pendingApprovals, Math.max(totalPending, 1), 0.9);

    return {
      id: this.baseId(companyId, "late-approvals"),
      title: "Late Approvals Detected",
      category: "APPROVALS",
      description: `${pendingApprovals} approval${pendingApprovals !== 1 ? "s" : ""} exceed${pendingApprovals !== 1 ? "" : "s"} the 24-hour SLA`,
      businessExplanation: "Delayed approvals create operational bottlenecks and may cascade into missed payment windows.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { pendingApprovals, totalPending },
      affectedModules: ["Approvals", "Payments", "Workflow"],
      recommendations: [
        { action: "Escalate overdue approvals to secondary approvers", rationale: `${pendingApprovals} approvals past 24h SLA`, priority: "critical", effort: "low" },
        { action: "Review approval routing rules for bottlenecks", rationale: "Prevent recurring delays", priority: "medium", effort: "medium" },
      ],
      severity: pendingApprovals > 5 ? "critical" : "high",
      businessImpact: "Late approvals may delay vendor payments and affect cash flow timing",
      horizon: "DAILY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "late-approvals"),
    };
  }

  private async predictWorkflowBottlenecks(companyId: string): Promise<Prediction | null> {
    const recentFailed = await prisma.workflowInstance.count({
      where: { companyId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 86_400_000) } },
    });

    const running = await prisma.workflowInstance.count({
      where: { companyId, status: "RUNNING" },
    });

    if (recentFailed < 3 && running < 5) return null;

    const evidence: PredictionEvidence[] = [
      { type: "failed_24h", description: "Workflows failed in last 24 hours", value: recentFailed, source: "WorkflowInstance", timestamp: new Date().toISOString() },
      { type: "running", description: "Currently running workflows", value: running, source: "WorkflowInstance", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromSignalCount(recentFailed + running, 50, 0.75);

    return {
      id: this.baseId(companyId, "workflow-bottlenecks"),
      title: "Workflow Bottlenecks Detected",
      category: "WORKFLOW_DELAYS",
      description: `${recentFailed} failures in 24h, ${running} currently running — workflow capacity may be strained`,
      businessExplanation: "Failed and queued workflows indicate potential bottlenecks in the automation pipeline.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { recentFailed, running },
      affectedModules: ["Workflow Engine", "Automation Studio"],
      recommendations: [
        { action: "Review failed workflow error logs for common patterns", rationale: `Identify root cause of ${recentFailed} recent failures`, priority: "high", effort: "medium" },
        { action: "Check workflow instance concurrency limits", rationale: `${running} concurrent workflows may exceed capacity`, priority: "medium", effort: "low" },
      ],
      severity: recentFailed > 5 ? "critical" : "high",
      businessImpact: "Workflow bottlenecks delay automated financial operations",
      horizon: "DAILY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "workflow-bottlenecks"),
    };
  }

  private async predictSLABreaches(companyId: string): Promise<Prediction | null> {
    const approaching = await prisma.transactionApproval.count({
      where: {
        transaction: { companyId }, status: "PENDING",
        createdAt: { gte: new Date(Date.now() - 82_800_000), lt: new Date(Date.now() - 64_800_000) },
      },
    });

    if (approaching === 0) return null;

    const evidence: PredictionEvidence[] = [
      { type: "approaching_sla", description: "Approvals approaching 24-hour SLA limit", value: approaching, source: "TransactionApproval", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromEvidenceStrength(0.8, 0.85);

    return {
      id: this.baseId(companyId, "sla-breach"),
      title: "Approaching SLA Breaches",
      category: "APPROVALS",
      description: `${approaching} approval${approaching !== 1 ? "s" : ""} within 4 hours of 24-hour SLA limit`,
      businessExplanation: "Approvals approaching their deadline must be actioned to avoid SLA breaches.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { approaching },
      affectedModules: ["Approvals"],
      recommendations: [
        { action: "Prioritize review of approaching-SLA approvals", rationale: `${approaching} at risk of SLA breach within 4h`, priority: "high", effort: "low" },
        { action: "Notify assigning approvers of pending deadlines", rationale: "Prevent automatic escalation", priority: "medium", effort: "low" },
      ],
      severity: "high",
      businessImpact: "SLA breaches may trigger escalation procedures and erode stakeholder confidence",
      horizon: "NEAR_TERM",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 14_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "sla-breach"),
    };
  }

  private async predictMonthEndCompletionRisk(companyId: string): Promise<Prediction | null> {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysToMonthEnd = Math.max(0, Math.ceil((endOfMonth.getTime() - now.getTime()) / 86_400_000));

    if (daysToMonthEnd > 7) return null;

    const [pendingReconciliations, pendingApprovals, unresolvedExceptions] = await Promise.all([
      prisma.reconciliationRun.count({ where: { companyId, status: { not: "COMPLETED" } } }),
      prisma.transactionApproval.count({ where: { transaction: { companyId }, status: "PENDING" } }),
      prisma.reconciliationException.count({ where: { companyId, resolved: false } }),
    ]);

    const riskScore = pendingReconciliations * 3 + pendingApprovals * 1 + unresolvedExceptions * 2;

    if (riskScore < 5) return null;

    const evidence: PredictionEvidence[] = [
      { type: "days_to_month_end", description: "Days remaining until month end", value: daysToMonthEnd, source: "calculated", timestamp: new Date().toISOString() },
      { type: "pending_reconciliations", description: "Uncompleted reconciliations", value: pendingReconciliations, source: "ReconciliationRun", timestamp: new Date().toISOString() },
      { type: "pending_approvals", description: "Pending transaction approvals", value: pendingApprovals, source: "TransactionApproval", timestamp: new Date().toISOString() },
      { type: "unresolved_exceptions", description: "Unresolved reconciliation exceptions", value: unresolvedExceptions, source: "ReconciliationException", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromSignalCount(riskScore, 20, 0.8);

    return {
      id: this.baseId(companyId, "month-end-risk"),
      title: "Month-End Completion Risk",
      category: "OPERATIONAL_CAPACITY",
      description: `${daysToMonthEnd} day${daysToMonthEnd !== 1 ? "s" : ""} to month end with ${pendingReconciliations} pending reconciliation${pendingReconciliations !== 1 ? "s" : ""} and ${pendingApprovals} approval${pendingApprovals !== 1 ? "s" : ""}`,
      businessExplanation: "Month-end close may be delayed if reconciliations and approvals are not completed in time.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { daysToMonthEnd, pendingReconciliations, pendingApprovals, unresolvedExceptions, riskScore },
      affectedModules: ["Reconciliation", "Approvals", "Treasury"],
      recommendations: [
        { action: "Assign additional resources to pending reconciliations", rationale: `${pendingReconciliations} reconciliations must complete by month end`, priority: "critical", effort: "medium" },
        { action: "Escalate pending approvals and unresolved exceptions", rationale: `${unresolvedExceptions} exceptions blocking completion`, priority: "high", effort: "low" },
      ],
      severity: riskScore > 15 ? "critical" : "high",
      businessImpact: "Delayed month-end close may affect financial reporting accuracy and compliance",
      horizon: "WEEKLY",
      timeframe: { start: now.toISOString(), end: endOfMonth.toISOString() },
      status: "active",
      companyId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: endOfMonth.toISOString(),
      auditRef: this.auditRef(companyId, "month-end-risk"),
    };
  }

  private async predictReconciliationDelays(companyId: string): Promise<Prediction | null> {
    const unresolvedExceptions = await prisma.reconciliationException.count({
      where: { companyId, resolved: false, createdAt: { lt: new Date(Date.now() - 172_800_000) } },
    });

    if (unresolvedExceptions === 0) return null;

    const evidence: PredictionEvidence[] = [
      { type: "old_exceptions", description: "Unresolved exceptions older than 48 hours", value: unresolvedExceptions, source: "ReconciliationException", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromEvidenceStrength(0.85, 0.85);

    return {
      id: this.baseId(companyId, "reconciliation-delay"),
      title: "Reconciliation Delays",
      category: "OPERATIONAL_CAPACITY",
      description: `${unresolvedExceptions} reconciliation exception${unresolvedExceptions !== 1 ? "s" : ""} unresolved for over 48 hours`,
      businessExplanation: "Aged reconciliation exceptions delay financial close and may indicate systemic issues.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { unresolvedExceptions },
      affectedModules: ["Reconciliation", "Treasury"],
      recommendations: [
        { action: "Investigate and resolve aged reconciliation exceptions", rationale: `${unresolvedExceptions} exceptions blocking reconciliation completion`, priority: "high", effort: "medium" },
        { action: "Review reconciliation rules for recurring exception patterns", rationale: "Prevent future delays", priority: "medium", effort: "medium" },
      ],
      severity: unresolvedExceptions > 5 ? "critical" : "high",
      businessImpact: "Reconciliation delays postpone financial close and may mask underlying accounting issues",
      horizon: "DAILY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "reconciliation-delay"),
    };
  }

  private async predictOutstandingApprovals(companyId: string): Promise<Prediction | null> {
    const totalPending = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING" },
    });

    if (totalPending < 5) return null;

    const highValue = await prisma.transactionApproval.count({
      where: { transaction: { companyId, primaryAmount: { gte: 50000 } }, status: "PENDING" },
    });

    const evidence: PredictionEvidence[] = [
      { type: "total_pending", description: "Total pending approvals", value: totalPending, source: "TransactionApproval", timestamp: new Date().toISOString() },
      { type: "high_value_pending", description: "High-value pending approvals (>$50K)", value: highValue, source: "TransactionApproval", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromSignalCount(totalPending, 20, 0.85);

    return {
      id: this.baseId(companyId, "outstanding-approvals"),
      title: "Outstanding Approvals",
      category: "APPROVALS",
      description: `${totalPending} approval${totalPending !== 1 ? "s" : ""} pending, ${highValue} above $50K`,
      businessExplanation: "Outstanding approvals may delay financial operations and require workload balancing.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { totalPending, highValue },
      affectedModules: ["Approvals", "Payments"],
      recommendations: [
        { action: "Process high-value approvals first to mitigate financial risk", rationale: `${highValue} approvals above $50K policy limit`, priority: "high", effort: "low" },
        { action: "Distribute pending approvals across available approvers", rationale: `${totalPending} total pending exceeds comfort threshold`, priority: "medium", effort: "low" },
      ],
      severity: highValue > 3 ? "critical" : "high",
      businessImpact: "Accumulated pending approvals increase operational risk and delay business velocity",
      horizon: "DAILY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "outstanding-approvals"),
    };
  }

  private async predictHighRiskWorkflows(companyId: string): Promise<Prediction | null> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
    const recentWorkflows = await prisma.workflowInstance.findMany({
      where: { companyId, createdAt: { gte: thirtyDaysAgo } },
      select: { status: true, definitionId: true, lastError: true },
    });

    if (recentWorkflows.length < 10) return null;

    const failureRate = recentWorkflows.filter((w) => w.status === "FAILED").length / recentWorkflows.length;

    if (failureRate < 0.2) return null;

    const evidence: PredictionEvidence[] = [
      { type: "total_workflows", description: "Workflows in last 30 days", value: recentWorkflows.length, source: "WorkflowInstance", timestamp: new Date().toISOString() },
      { type: "failure_rate", description: "30-day workflow failure rate", value: `${(failureRate * 100).toFixed(0)}%`, source: "calculated", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromThresholdDeviation(failureRate, 0.2, failureRate - 0.2, 0.8);

    return {
      id: this.baseId(companyId, "high-risk-workflows"),
      title: "High-Risk Workflows Detected",
      category: "WORKFLOW_DELAYS",
      description: `Workflow failure rate of ${(failureRate * 100).toFixed(0)}% exceeds 20% threshold`,
      businessExplanation: "Persistent workflow failures indicate configuration issues or systemic problems requiring attention.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { workflowCount: recentWorkflows.length, failureRate },
      affectedModules: ["Workflow Engine", "Automation Studio"],
      recommendations: [
        { action: "Audit failed workflow definitions and error logs", rationale: `${(failureRate * 100).toFixed(0)}% failure rate requires investigation`, priority: "critical", effort: "medium" },
        { action: "Add retry logic and error handling to failing workflows", rationale: "Improve automation reliability", priority: "high", effort: "medium" },
      ],
      severity: failureRate > 0.4 ? "critical" : "high",
      businessImpact: "High workflow failure rates reduce automation benefits and may cause missed financial operations",
      horizon: "WEEKLY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 7 * 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "high-risk-workflows"),
    };
  }

  private async predictOverdueComplianceTasks(companyId: string): Promise<Prediction | null> {
    const [openViolations, criticalAlerts] = await Promise.all([
      prisma.policyViolation.count({ where: { companyId, status: "OPEN", createdAt: { lt: new Date(Date.now() - 7 * 86_400_000) } } }),
      prisma.riskAlert.count({ where: { companyId, status: "OPEN", severity: "CRITICAL", createdAt: { lt: new Date(Date.now() - 86_400_000) } } }),
    ]);

    if (openViolations === 0 && criticalAlerts === 0) return null;

    const evidence: PredictionEvidence[] = [
      { type: "aged_violations", description: "Open violations older than 7 days", value: openViolations, source: "PolicyViolation", timestamp: new Date().toISOString() },
      { type: "critical_alerts", description: "Critical alerts older than 24 hours", value: criticalAlerts, source: "RiskAlert", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromEvidenceStrength(0.9, 0.85);

    return {
      id: this.baseId(companyId, "overdue-compliance"),
      title: "Overdue Compliance Tasks",
      category: "COMPLIANCE",
      description: `${openViolations} open violation${openViolations !== 1 ? "s" : ""} older than 7 days, ${criticalAlerts} critical alert${criticalAlerts !== 1 ? "s" : ""} older than 24 hours`,
      businessExplanation: "Aged compliance items increase regulatory risk and may trigger audit findings.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { openViolations, criticalAlerts },
      affectedModules: ["Compliance", "Governance"],
      recommendations: [
        { action: "Assign owners and set remediation deadlines for aged violations", rationale: `${openViolations} violations past 7-day remediation SLA`, priority: "critical", effort: "medium" },
        { action: "Investigate unresolved critical alerts immediately", rationale: `${criticalAlerts} critical alerts require escalation`, priority: "critical", effort: "low" },
      ],
      severity: criticalAlerts > 0 ? "critical" : "high",
      businessImpact: "Overdue compliance tasks may result in regulatory penalties and audit findings",
      horizon: "WEEKLY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 7 * 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "overdue-compliance"),
    };
  }

  private async predictForecastVariance(companyId: string): Promise<Prediction | null> {
    const wallets = await prisma.wallet.findMany({ where: { companyId } });
    const currentBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const yesterdayTx = await prisma.transaction.aggregate({
      where: { companyId, createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      _sum: { primaryAmount: true },
    });

    const dailyAverage = Number(yesterdayTx._sum.primaryAmount ?? 0);

    if (currentBalance === 0 || dailyAverage === 0) return null;

    const projectedBalance = currentBalance - dailyAverage * 7;
    const variance = Math.abs(currentBalance - projectedBalance) / currentBalance;

    if (variance < 0.2) return null;

    const evidence: PredictionEvidence[] = [
      { type: "current_balance", description: "Current wallet balance", value: currentBalance, source: "Wallet", timestamp: new Date().toISOString() },
      { type: "daily_average_flow", description: "Average daily transaction flow", value: dailyAverage, source: "Transaction", timestamp: new Date().toISOString() },
      { type: "projected_weekly", description: "Projected balance in 7 days", value: projectedBalance, source: "calculated", timestamp: new Date().toISOString() },
      { type: "variance", description: "Projected variance from current", value: `${(variance * 100).toFixed(0)}%`, source: "calculated", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromThresholdDeviation(currentBalance, currentBalance, currentBalance - projectedBalance, 0.7);

    return {
      id: this.baseId(companyId, "forecast-variance"),
      title: "Forecast Variance Detected",
      category: "FORECAST_ACCURACY",
      description: `Projected balance variance of ${(variance * 100).toFixed(0)}% from current — expected balance $${projectedBalance.toLocaleString()}`,
      businessExplanation: "Significant variance between current and projected balances suggests planning assumptions may need review.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { currentBalance, dailyAverage, projectedBalance, variance },
      affectedModules: ["Treasury", "Forecasting"],
      recommendations: [
        { action: "Review cash flow forecast assumptions and update projections", rationale: `${(variance * 100).toFixed(0)}% variance indicates outdated forecast model`, priority: "high", effort: "medium" },
        { action: "Check for unrecorded or delayed transactions affecting balance", rationale: "Improve forecast accuracy", priority: "medium", effort: "low" },
      ],
      severity: variance > 0.5 ? "critical" : "high",
      businessImpact: "Inaccurate forecasts may lead to poor treasury decisions and liquidity mismanagement",
      horizon: "WEEKLY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 7 * 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "forecast-variance"),
    };
  }

  private async predictDuplicatePaymentRisk(companyId: string): Promise<Prediction | null> {
    const recentTx = await prisma.transaction.findMany({
      where: {
        companyId,
        status: "COMPLETED",
        createdAt: { gte: new Date(Date.now() - 86_400_000) },
      },
      select: { primaryAmount: true, reference: true, id: true },
    });

    const amountGroups = new Map<string, { count: number; ids: string[] }>();
    for (const tx of recentTx) {
      const key = tx.reference ?? `${tx.primaryAmount}`;
      const group = amountGroups.get(key) ?? { count: 0, ids: [] };
      group.count++;
      group.ids.push(tx.id);
      amountGroups.set(key, group);
    }

    const duplicates = Array.from(amountGroups.values()).filter((g) => g.count > 1);

    if (duplicates.length === 0) return null;

    const duplicateCount = duplicates.reduce((sum, g) => sum + g.count - 1, 0);

    const evidence: PredictionEvidence[] = [
      { type: "duplicate_transactions", description: "Potential duplicate payments in last 24h", value: duplicateCount, source: "Transaction", timestamp: new Date().toISOString() },
      { type: "affected_groups", description: "Transaction groups with duplicates", value: duplicates.length, source: "Transaction", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromEvidenceStrength(0.7, 0.75);

    return {
      id: this.baseId(companyId, "duplicate-payment"),
      title: "Duplicate Payment Risk",
      category: "RISK",
      description: `${duplicateCount} potential duplicate payment${duplicateCount !== 1 ? "s" : ""} detected in the last 24 hours`,
      businessExplanation: "Multiple transactions with matching references or amounts may indicate duplicate payments.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { duplicateCount, groupCount: duplicates.length },
      affectedModules: ["Payments", "Treasury"],
      recommendations: [
        { action: "Review flagged transactions for duplicate payment patterns", rationale: `${duplicateCount} potential duplicates identified`, priority: "high", effort: "medium" },
        { action: "Verify each duplicate candidate against source documents", rationale: "Confirm if payments are intentional or errors", priority: "high", effort: "medium" },
      ],
      severity: "high",
      businessImpact: "Duplicate payments result in direct financial loss and reconciliation complexity",
      horizon: "DAILY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "duplicate-payment"),
    };
  }

  private async predictInactiveUsers(companyId: string): Promise<Prediction | null> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const activeUserIds = await prisma.auditLog.findMany({
      where: { companyId, createdAt: { gte: thirtyDaysAgo } },
      select: { actorUserId: true },
      distinct: ["actorUserId"],
    });

    const activeSet = new Set(activeUserIds.map((a) => a.actorUserId).filter(Boolean));

    const memberships = await prisma.companyMembership.findMany({
      where: { companyId },
      select: { userId: true },
    });

    const allUserIds = memberships.map((m) => m.userId);
    const inactiveUserIds = allUserIds.filter((id) => !activeSet.has(id));

    if (inactiveUserIds.length === 0) return null;

    const inactiveRate = inactiveUserIds.length / allUserIds.length;

    const evidence: PredictionEvidence[] = [
      { type: "inactive_users", description: "Users with no activity in 30+ days", value: inactiveUserIds.length, source: "AuditLog", timestamp: new Date().toISOString() },
      { type: "total_users", description: "Total company users", value: allUserIds.length, source: "CompanyMembership", timestamp: new Date().toISOString() },
      { type: "inactive_rate", description: "User inactivity rate", value: `${(inactiveRate * 100).toFixed(0)}%`, source: "calculated", timestamp: new Date().toISOString() },
    ];

    const { score, level, explanation } = confidenceScoreCalculator.fromSignalCount(inactiveUserIds.length, allUserIds.length, 0.95);

    return {
      id: this.baseId(companyId, "inactive-users"),
      title: "Inactive Users Detected",
      category: "USER_ADOPTION",
      description: `${inactiveUserIds.length} of ${allUserIds.length} user${allUserIds.length !== 1 ? "s" : ""} (${(inactiveRate * 100).toFixed(0)}%) inactive for 30+ days`,
      businessExplanation: "Low user engagement may indicate training gaps, workflow friction, or license underutilization.",
      confidence: level,
      confidenceScore: score,
      confidenceExplanation: explanation,
      evidence,
      supportingData: { inactiveUserIds: inactiveUserIds.length, totalUsers: allUserIds.length, inactiveRate },
      affectedModules: ["Users", "Onboarding"],
      recommendations: [
        { action: "Reach out to inactive users to identify adoption barriers", rationale: `${inactiveUserIds.length} users have not engaged in 30+ days`, priority: "medium", effort: "medium" },
        { action: "Review onboarding completion rates for inactive users", rationale: "Identify if training gaps exist", priority: "low", effort: "low" },
      ],
      severity: inactiveRate > 0.5 ? "high" : inactiveRate > 0.3 ? "medium" : "low",
      businessImpact: "Low user adoption reduces platform ROI and may indicate process gaps",
      horizon: "MONTHLY",
      timeframe: { start: new Date().toISOString(), end: new Date(Date.now() + 30 * 86_400_000).toISOString() },
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      auditRef: this.auditRef(companyId, "inactive-users"),
    };
  }
}

export const predictionEvidenceCollector = new PredictionEvidenceCollector();
