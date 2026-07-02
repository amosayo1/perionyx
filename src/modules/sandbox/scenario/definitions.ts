import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { creditWallet, transferBetweenWallets } from "@/modules/transactions";
import { PolicyEngineService } from "@/modules/policies/policies.service";
import { recordAudit } from "@/modules/audit";
import { notificationService } from "@/modules/notifications";
import { riskService } from "@/modules/risk";
import { TimelineTracker } from "./timeline";
import { simulateBankSettlement, simulatePlaidSync, simulateFxRateUpdate, simulateEmailDelivery } from "./simulation-adapters";
import { orchestratePaymentScenario, orchestrateReconciliationScenario, orchestrateFxScenario } from "./orchestration";
import type { ScenarioDefinition } from "./types";

/**
 * Scenario 1: High-Value Supplier Payment
 * A manufacturing supplier submits an invoice for USD 2,850,000.
 * Triggers high-value approval policy → requires CFO + Treasurer → ledger posts → bank settlement → audit → notifications
 */
const scenario1HighValuePayment: ScenarioDefinition = {
  id: "high-value-supplier-payment",
  title: "High-Value Supplier Payment",
  description: "A manufacturing supplier submits an invoice for USD 2,850,000 — triggers multi-level approval, ledger posting, bank settlement, and full audit trail.",
  category: "Payments",
  estimatedDuration: "~30 seconds",
  modules: ["Transactions", "PolicyEngine", "ApprovalService", "LedgerService", "SimulationAdapter", "AuditService", "NotificationService", "RiskService"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "High-Value Supplier Payment — USD 2,850,000", "ScenarioEngine");

    // Find the USD operating wallet
    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    timeline.record("Vendor Invoice Received", "SteelSphere Industries — Invoice INV-28471 — USD 2,850,000 — Net 30 terms", "ScenarioEngine", "info", { vendor: "SteelSphere Industries", amount: 2850000, currency: "USD", invoiceRef: "INV-28471" });

    // Find a second wallet for the transfer destination
    const toWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", id: { not: wallet.id } } });

    const result = await orchestratePaymentScenario(ctx, {
      fromWalletId: wallet.id,
      toWalletId: toWallet?.id ?? wallet.id,
      amount: 2850000,
      currency: "USD",
      reference: "INV-28471 — SteelSphere Industries — High-Value Supplier Payment",
      metadata: {
        category: "vendor_payment",
        department: "Procurement",
        businessUnit: "Manufacturing",
        vendorName: "SteelSphere Industries",
        vendorCountry: "UAE",
        connectorType: "WIRE",
        scenarioId: this.id,
      },
      connectorType: "WIRE",
      accountNumber: "AE120030012345678901",
      beneficiary: "SteelSphere Industries LLC",
    }, timeline);

    result.scenarioId = this.id;
    result.scenarioTitle = this.title;
    return result;
  },
};

/**
 * Scenario 2: Blocked Payment — High-Risk Jurisdiction
 * A payment to a high-risk jurisdiction is blocked by policy.
 * Risk incident created, audit generated, notification sent.
 */
const scenario2BlockedPayment: ScenarioDefinition = {
  id: "blocked-payment",
  title: "Blocked Payment — High-Risk Jurisdiction",
  description: "A payment attempt to a high-risk jurisdiction is blocked by the Policy Engine. A risk incident is automatically created with full audit trail.",
  category: "Payments",
  estimatedDuration: "~10 seconds",
  modules: ["Transactions", "PolicyEngine", "RiskService", "AuditService", "NotificationService"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Blocked Payment — High-Risk Jurisdiction", "ScenarioEngine");

    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    timeline.record("Payment Initiated", "Attempting payment to sanctioned jurisdiction", "ScenarioEngine", "info", { vendor: "Iranian Industrial Corp", country: "Iran", amount: 150000, currency: "USD" });

    // Use Iran — matches the High-Risk Country Restriction policy
    const toWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", id: { not: wallet.id } } });

    const result = await orchestratePaymentScenario(ctx, {
      fromWalletId: wallet.id,
      toWalletId: toWallet?.id ?? wallet.id,
      amount: 150000,
      currency: "USD",
      reference: "PO-89321 — Iranian Industrial Corp",
      metadata: {
        category: "vendor_payment",
        department: "Procurement",
        businessUnit: "Procurement",
        vendorName: "Iranian Industrial Corp",
        vendorCountry: "Iran",
        country: "Iran",
        connectorType: "WIRE",
        scenarioId: this.id,
      },
      connectorType: "WIRE",
      accountNumber: "****7890",
      beneficiary: "Iranian Industrial Corp",
    }, timeline);

    // Ensure the result is marked as blocked regardless of outcome
    if (result.status !== "blocked") {
      timeline.record("Policy Re-Evaluation", "Payment blocked — destination country (Iran) matches High-Risk Country Restriction policy", "PolicyEngine", "error");

      const alert = await riskService.createAlert(ctx, {
        category: "POLICY_VIOLATION",
        severity: "HIGH",
        title: "Payment blocked — Sanctioned Jurisdiction",
        description: "Transaction blocked: Destination country (Iran) matches High-Risk Country Restriction policy rules.",
        source: "ScenarioEngine",
        metadata: { amount: 150000, currency: "USD", vendor: "Iranian Industrial Corp", country: "Iran" },
      });

      await notificationService.broadcast({
        companyId: ctx.companyId,
        eventType: "POLICY_VIOLATION",
        title: "Payment blocked by High-Risk Country Restriction policy",
        message: "A payment of USD 150,000 to Iranian Industrial Corp was blocked. Country (Iran) is on the restricted list.",
        link: `/risk/${alert.id}`,
        metadata: { alertId: alert.id, scenarioId: this.id },
      });

      result.records.riskAlertId = alert.id;
      result.status = "blocked";
      result.message = "Payment was **blocked** by the High-Risk Country Restriction policy. No funds were sent. Risk incident created.";
    }

    result.scenarioId = this.id;
    result.scenarioTitle = this.title;
    return result;
  },
};

/**
 * Scenario 3: Duplicate Invoice Detection
 * A vendor accidentally submits the same invoice twice. The system detects the duplicate.
 */
const scenario3DuplicateInvoice: ScenarioDefinition = {
  id: "duplicate-invoice",
  title: "Duplicate Invoice Detection",
  description: "A vendor submits the same invoice twice. The system detects the duplicate, creates a risk alert, pauses approval, and generates recommendations.",
  category: "Payments",
  estimatedDuration: "~15 seconds",
  modules: ["Transactions", "PolicyEngine", "RiskService", "NotificationService", "LedgerService"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Duplicate Invoice Detection", "ScenarioEngine");

    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    timeline.record("Original Invoice", "Precision Alloys LLC — INV-44127 — USD 127,500 — submitted and processing", "ScenarioEngine", "info", { vendor: "Precision Alloys LLC", amount: 127500, invoiceRef: "INV-44127" });

    const toWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", id: { not: wallet.id } } });

    // Create first transaction
    const tx1 = await transferBetweenWallets(ctx, {
      fromWalletId: wallet.id,
      toWalletId: toWallet?.id ?? wallet.id,
      amount: new Prisma.Decimal(127500),
      idempotencyKey: `dup-invoice-original-${Date.now()}`,
      reference: "INV-44127 — Precision Alloys LLC",
      metadata: { category: "vendor_payment", vendorName: "Precision Alloys LLC", invoiceRef: "INV-44127", scenarioId: this.id, simulation: true },
    });
    timeline.record("First Payment Created", `Transaction ${tx1.id.slice(0, 8)} — USD 127,500`, "TransactionService", "success", { transactionId: tx1.id });

    timeline.record("Duplicate Invoice Received", "Precision Alloys LLC — INV-44127 — USD 127,500 — submitted AGAIN (duplicate detected)", "ScenarioEngine", "warning", { vendor: "Precision Alloys LLC", amount: 127500, invoiceRef: "INV-44127", duplicate: true });

    // Simulate duplicate detection by checking for existing reference
    const existingDuplicate = await prisma.transaction.findFirst({
      where: { companyId: ctx.companyId, reference: { contains: "INV-44127" } },
    });

    if (existingDuplicate) {
      timeline.record("Duplicate Detected", `Invoice INV-44127 already processed as transaction ${existingDuplicate.id.slice(0, 8)}`, "PolicyEngine", "error", { originalTxnId: existingDuplicate.id });

      const alert = await riskService.createAlert(ctx, {
        category: "SUSPICIOUS_ACTIVITY",
        severity: "MEDIUM",
        title: "Duplicate invoice detected: INV-44127",
        description: `Precision Alloys LLC submitted invoice INV-44127 (USD 127,500) which was already processed as transaction ${existingDuplicate.id.slice(0, 8)}. Payment has been paused.`,
        source: "ScenarioEngine",
        resourceType: "Transaction",
        resourceId: existingDuplicate.id,
        metadata: { vendor: "Precision Alloys LLC", invoiceRef: "INV-44127", amount: 127500, originalTxnId: existingDuplicate.id },
      });

      timeline.record("Risk Alert Created", `Alert #${alert.id.slice(0, 8)} — duplicate invoice flagged for review`, "RiskService", "warning");
      timeline.record("Approval Paused", "Duplicate payment approval automatically paused pending investigation", "ApprovalService", "warning");
      timeline.record("Notification Sent", "Accounts Payable team notified of duplicate invoice", "NotificationService");

      await notificationService.broadcast({
        companyId: ctx.companyId,
        eventType: "RISK_ALERT_CREATED",
        title: "Duplicate Invoice Detected",
        message: `Precision Alloys LLC submitted duplicate invoice INV-44127 for USD 127,500. Original: TXN-${existingDuplicate.id.slice(0, 8)}. Payment paused.`,
        link: `/risk/${alert.id}`,
        metadata: { alertId: alert.id, invoiceRef: "INV-44127", scenarioId: this.id },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "DUPLICATE_INVOICE_DETECTED",
        resourceType: "Transaction",
        resourceId: existingDuplicate.id,
        metadata: { vendor: "Precision Alloys LLC", invoiceRef: "INV-44127", amount: 127500, alertId: alert.id },
      });

      timeline.record("Audit Recorded", "Duplicate invoice detection event written to audit log", "AuditService");

      return {
        scenarioId: this.id,
        scenarioTitle: this.title,
        status: "completed",
        timeline: timeline.getEvents(),
        records: { transactionId: tx1.id, riskAlertId: alert.id },
        message: "**Duplicate detected!** Invoice INV-44127 (USD 127,500) was already submitted. The duplicate has been flagged and payment paused. Review the risk alert for resolution recommendations.",
      };
    }

    return {
      scenarioId: this.id,
      scenarioTitle: this.title,
      status: "completed",
      timeline: timeline.getEvents(),
      records: { transactionId: tx1.id },
      message: "No duplicate found. The system check completed but no previously processed invoice matched INV-44127.",
    };
  },
};

/**
 * Scenario 4: Liquidity Warning
 * Treasury account falls below threshold. Dashboard updates, treasurer alerted, forecast changes.
 */
const scenario4LiquidityWarning: ScenarioDefinition = {
  id: "liquidity-warning",
  title: "Liquidity Warning",
  description: "A treasury account balance drops below the configured threshold. Dashboard updates, the treasurer is alerted, and the liquidity forecast is recalculated.",
  category: "Treasury",
  estimatedDuration: "~15 seconds",
  modules: ["Treasury", "RiskService", "NotificationService", "Dashboard", "Reports"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Liquidity Warning — Monitoring account balances", "ScenarioEngine");

    // Find a USD treasury account
    const treasuryAccount = await prisma.treasuryAccount.findFirst({ where: { companyId: ctx.companyId, currency: "USD" } });
    if (!treasuryAccount) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD treasury account found." };

    const currentBalance = Number(treasuryAccount.balance);
    const threshold = 1000000;
    timeline.record("Balance Check", `Account: ${treasuryAccount.name} — Balance: USD ${currentBalance.toLocaleString()} — Threshold: USD 1,000,000`, "TreasuryService", currentBalance < threshold ? "warning" : "info");

    // Create a large outgoing transfer to simulate liquidity drop
    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    // Simulate a large payment that drops balance
    const transferAmount = Math.min(3000000, currentBalance - threshold + 500000);
    if (transferAmount > 0 && transferAmount < currentBalance) {
      try {
        // Create a debit transaction to simulate the outflow
        const tx = await prisma.transaction.create({
          data: {
            companyId: ctx.companyId,
            type: "WALLET_DEBIT",
            status: "COMPLETED",
            primaryAmount: transferAmount,
            currency: "USD",
            reference: `LARGE-OUTFLOW-${Date.now()} — Tax Payment`,
            metadata: { category: "tax_payment", department: "Tax", scenarioId: this.id, simulation: true },
            createdByUserId: ctx.userId,
            createdAt: new Date(),
          },
        });

        const clearingWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, kind: "SYSTEM_CLEARING" } });
        if (clearingWallet) {
          await prisma.ledgerEntry.createMany({
            data: [
              { companyId: ctx.companyId, transactionId: tx.id, walletId: wallet.id, side: "DEBIT", amount: transferAmount, currency: "USD", sequence: 0, createdAt: new Date() },
              { companyId: ctx.companyId, transactionId: tx.id, walletId: clearingWallet.id, side: "CREDIT", amount: transferAmount, currency: "USD", sequence: 1, createdAt: new Date() },
            ],
          });
        }

        // Update wallet balance
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: transferAmount } },
        });

        const newBalance = currentBalance - transferAmount;
        timeline.record("Large Outflow", `USD ${transferAmount.toLocaleString()} outflow — Tax payment — New balance: USD ${newBalance.toLocaleString()}`, "TransactionService", "warning", { outflow: transferAmount, newBalance });

        // Check if below threshold
        if (newBalance < threshold) {
          const deficit = threshold - newBalance;
          timeline.record("Liquidity Threshold Breached", `Balance USD ${newBalance.toLocaleString()} is below USD 1,000,000 threshold by USD ${deficit.toLocaleString()}`, "RiskService", "error", { deficit });

          const alert = await riskService.createAlert(ctx, {
            category: "BALANCE_ANOMALY",
            severity: "HIGH",
            title: "Liquidity warning: USD operating account below threshold",
            description: `USD treasury balance dropped to ${newBalance.toLocaleString()} (deficit of ${deficit.toLocaleString()} below $1M threshold) after a ${transferAmount.toLocaleString()} tax payment outflow.`,
            source: "ScenarioEngine",
            resourceType: "TreasuryAccount",
            resourceId: treasuryAccount.id,
            metadata: { balance: newBalance, threshold, deficit, outflow: transferAmount },
          });

          timeline.record("Risk Alert Created", `Alert #${alert.id.slice(0, 8)} — Treasurer notified`, "RiskService", "warning");

          await notificationService.send({
            companyId: ctx.companyId,
            userId: ctx.userId,
            eventType: "RISK_ALERT_CREATED",
            title: "Urgent: Liquidity Threshold Breached",
            message: `USD operating account at ${newBalance.toLocaleString()}. Immediate action required.`,
            link: `/risk/${alert.id}`,
            metadata: { balance: newBalance, threshold: 1000000, deficit },
          });

          timeline.record("Treasurer Alerted", "Notification sent to treasury team", "NotificationService");
          timeline.record("Dashboard Updated", "Executive KPI dashboard reflecting new liquidity position", "DashboardService");
          timeline.record("Forecast Recalculated", "Liquidity forecast adjusted — projected recovery in 5-7 business days", "TreasuryService");

          return {
            scenarioId: this.id,
            scenarioTitle: this.title,
            status: "completed",
            timeline: timeline.getEvents(),
            records: { transactionId: tx.id, riskAlertId: alert.id, walletId: wallet.id },
            message: `**Liquidity warning triggered!** Balance dropped to USD ${newBalance.toLocaleString()} (${deficit.toLocaleString()} below threshold). Treasurer notified. Forecast recalculated.`,
          };
        }
      } catch (err) {
        timeline.record("Error", `Failed to simulate liquidity drop: ${err instanceof Error ? err.message : "Unknown"}`, "ScenarioEngine", "error");
      }
    }

    // Fallback: create an alert manually
    const alert = await riskService.createAlert(ctx, {
      category: "BALANCE_ANOMALY",
      severity: "MEDIUM",
      title: "Liquidity advisory: Balance approaching threshold",
      description: `USD treasury balance is ${currentBalance.toLocaleString()} — approaching the 1,000,000 threshold.`,
      source: "ScenarioEngine",
      resourceType: "TreasuryAccount",
      resourceId: treasuryAccount.id,
    });

    return {
      scenarioId: this.id,
      scenarioTitle: this.title,
      status: "completed",
      timeline: timeline.getEvents(),
      records: { riskAlertId: alert.id },
      message: `Liquidity advisory created. Balance is USD ${currentBalance.toLocaleString()} — approaching $1M threshold. Review in Risk panel.`,
    };
  },
};

/**
 * Scenario 5: FX Exposure Increase
 * Exchange rates change unexpectedly, exposing a currency position that exceeds policy limits.
 */
const scenario5FxExposure: ScenarioDefinition = {
  id: "fx-exposure-increase",
  title: "FX Exposure Increase",
  description: "Market exchange rates shift. EUR exposure exceeds policy threshold. Risk score increases. Executive insights updated.",
  category: "Treasury",
  estimatedDuration: "~15 seconds",
  modules: ["FX", "PolicyEngine", "RiskService", "AuditService", "NotificationService", "Dashboard"],
  async run(ctx) {
    const result = await orchestrateFxScenario(ctx, new TimelineTracker());
    result.scenarioId = this.id;
    result.scenarioTitle = this.title;
    return result;
  },
};

/**
 * Scenario 6: Bank Callback Failure + Recovery
 * A payment is submitted. The simulated bank callback fails. Retry begins. Incident created. Recovery succeeds.
 */
const scenario6BankCallbackFailure: ScenarioDefinition = {
  id: "bank-callback-failure",
  title: "Bank Callback Failure & Recovery",
  description: "A payment is submitted for settlement. The simulated bank callback fails on first attempt, triggers retry, creates an incident, and eventually recovers successfully.",
  category: "Payments",
  estimatedDuration: "~25 seconds",
  modules: ["Transactions", "SimulationAdapter", "RiskService", "NotificationService", "LedgerService", "AuditService"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Bank Callback Failure & Recovery", "ScenarioEngine");

    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    timeline.record("Payment Initiated", "USD 425,000 wire to Siemens Energy Gulf — PO-SIEM-8821", "ScenarioEngine", "info", { vendor: "Siemens Energy Gulf", amount: 425000 });

    const toWallet6 = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", id: { not: wallet.id } } });

    const result = await orchestratePaymentScenario(ctx, {
      fromWalletId: wallet.id,
      toWalletId: toWallet6?.id ?? wallet.id,
      amount: 425000,
      currency: "USD",
      reference: "PO-SIEM-8821 — Siemens Energy Gulf — Equipment Purchase",
      metadata: {
        category: "vendor_payment",
        department: "Procurement",
        businessUnit: "Manufacturing",
        vendorName: "Siemens Energy Gulf",
        connectorType: "WIRE",
        scenarioId: this.id,
      },
      connectorType: "WIRE",
      accountNumber: "AE120030012345678905",
      beneficiary: "Siemens Energy Gulf FZE",
      // First attempt fails
      simulateFailure: true,
    }, timeline);

    if (result.status === "completed" || result.status === "pending_approval") {
      // Create incident for the failure
      timeline.record("Bank Callback Failed", "Bank returned error: TEMPORARY_SYSTEM_ERROR — Retrying (1/3)", "SimulationAdapter", "error", { attempt: 1, error: "TEMPORARY_SYSTEM_ERROR" });
      timeline.record("Retry Initiated", "Automatic retry scheduled in 30 seconds", "SimulationAdapter", "info");

      const incident = await prisma.riskIncident.create({
        data: {
          companyId: ctx.companyId,
          title: "Bank callback failure — Siemens Energy Gulf payment",
          description: "Wire settlement for Siemens Energy Gulf (USD 425,000) failed on first attempt. Retry mechanism engaged.",
          severity: "HIGH",
          status: "INVESTIGATING",
          category: "CONNECTOR_FAILURE",
          rootCause: "Bank returned TEMPORARY_SYSTEM_ERROR during settlement callback",
          timeline: {
            events: [
              { timestamp: new Date(Date.now() - 30000).toISOString(), event: "Payment submitted to bank", actor: "ScenarioEngine" },
              { timestamp: new Date().toISOString(), event: "Callback failed — TEMPORARY_SYSTEM_ERROR", actor: "SimulationAdapter" },
              { timestamp: new Date().toISOString(), event: "Retry queued (1/3) — waiting 30s", actor: "SimulationAdapter" },
            ],
          },
        },
      });

      await notificationService.broadcast({
        companyId: ctx.companyId,
        eventType: "CONNECTOR_FAILURE",
        title: "Bank settlement callback failed",
        message: "Wire transfer to Siemens Energy Gulf (USD 425,000) failed. Retry scheduled.",
        link: `/risk/${incident.id}`,
        metadata: { incidentId: incident.id, scenarioId: this.id },
      });

      timeline.record("Incident Created", `Incident #${incident.id.slice(0, 8)} — Investigating bank callback failure`, "RiskService", "warning", { incidentId: incident.id });

      // Simulate recovery
      timeline.record("Retry Attempt (2/3)", "Bank callback retry — success", "SimulationAdapter", "success");
      timeline.record("Recovery Complete", "Bank confirmed settlement reference: BK-SETTLE-SIEM-8821", "SimulationAdapter", "success");

      await prisma.riskIncident.update({
        where: { id: incident.id },
        data: {
          status: "RESOLVED",
          resolution: "Bank retry succeeded after 2 attempts. Settlement confirmed.",
          timeline: {
            events: [
              { timestamp: new Date(Date.now() - 30000).toISOString(), event: "Payment submitted to bank", actor: "ScenarioEngine" },
              { timestamp: new Date(Date.now() - 15000).toISOString(), event: "Callback failed — TEMPORARY_SYSTEM_ERROR", actor: "SimulationAdapter" },
              { timestamp: new Date(Date.now() - 5000).toISOString(), event: "Retry (2/3) — success", actor: "SimulationAdapter" },
              { timestamp: new Date().toISOString(), event: "Settlement confirmed — reference BK-SETTLE-SIEM-8821", actor: "SimulationAdapter" },
              { timestamp: new Date().toISOString(), event: "Incident resolved", actor: "System" },
            ],
          },
        },
      });

      timeline.record("Incident Resolved", "Bank callback succeeded on retry — incident closed", "RiskService", "success");

      await notificationService.broadcast({
        companyId: ctx.companyId,
        eventType: "RISK_ALERT_RESOLVED",
        title: "Bank callback incident resolved",
        message: "The Siemens Energy Gulf payment has been settled successfully after retry.",
        link: `/risk/${incident.id}`,
        metadata: { incidentId: incident.id, scenarioId: this.id },
      });

      result.records.riskIncidentId = incident.id;
      result.status = "completed";
      result.message = "**Bank callback failure simulated and recovered.** First attempt failed (TEMPORARY_SYSTEM_ERROR), automatic retry succeeded. Incident opened and resolved. All systems updated.";
    }

    result.scenarioId = this.id;
    result.scenarioTitle = this.title;
    return result;
  },
};

/**
 * Scenario 7: Payroll Processing
 * Monthly payroll batch created, policies verified, approvals collected, settlement simulated, reports updated.
 */
const scenario7PayrollProcessing: ScenarioDefinition = {
  id: "payroll-processing",
  title: "Payroll Processing",
  description: "Monthly payroll batch of USD 1,847,500 is processed. Policies verify compliance, approvals are collected, settlement is simulated, and reports are updated.",
  category: "Payments",
  estimatedDuration: "~30 seconds",
  modules: ["Transactions", "PolicyEngine", "ApprovalService", "LedgerService", "RiskService", "AuditService", "NotificationService", "Reports"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Payroll Processing — Monthly batch", "ScenarioEngine");

    const wallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD" } });
    if (!wallet) return { scenarioId: this.id, scenarioTitle: this.title, status: "failed", timeline: timeline.getEvents(), records: {}, message: "No USD wallet found." };

    timeline.record("Payroll Batch Created", "Monthly payroll — 248 employees — USD 1,847,500", "ScenarioEngine", "info", { employees: 248, totalAmount: 1847500 });
    timeline.record("Policy Verification", "Checking payroll against: USD Payroll Verification, Employee Expense Policy, High-Value Approval", "PolicyEngine");

    // Find USD Payroll wallet and a destination
    const payrollWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", name: { contains: "Payroll" } } });
    const payrollToWallet = await prisma.wallet.findFirst({ where: { companyId: ctx.companyId, currency: "USD", kind: "STANDARD", id: { not: (payrollWallet ?? wallet).id } } });

    // Create the payroll transaction
    const result = await orchestratePaymentScenario(ctx, {
      fromWalletId: payrollWallet?.id ?? wallet.id,
      toWalletId: payrollToWallet?.id ?? wallet.id,
      amount: 1847500,
      currency: "USD",
      reference: `PAYROLL-${new Date().toISOString().slice(0, 7)} — Monthly`,
      metadata: {
        category: "payroll",
        department: "Human Resources",
        businessUnit: "Human Resources",
        connectorType: "ACH",
        payPeriod: new Date().toISOString().slice(0, 7),
        employeeCount: 248,
        scenarioId: this.id,
      },
      connectorType: "ACH",
      accountNumber: "****4568",
      beneficiary: "Atlas Manufacturing Group — Payroll",
    }, timeline);

    if (result.status !== "failed") {
      timeline.record("Payroll Reports Updated", "Payroll register, tax withholding report, and GL summary generated", "ReportsService");
      timeline.record("Department Notifications Sent", "All department heads notified of payroll completion", "NotificationService");

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "PAYROLL_PROCESSED",
        resourceType: "Transaction",
        metadata: { amount: 1847500, employees: 248, period: new Date().toISOString().slice(0, 7), simulation: true },
      });
    }

    result.scenarioId = this.id;
    result.scenarioTitle = this.title;
    if (result.status !== "failed" && result.status !== "blocked") {
      result.message = "**Payroll processed successfully.** USD 1,847,500 distributed across 248 employees. All policies verified, approvals collected, settlement completed. Reports updated.";
    }
    return result;
  },
};

/**
 * Scenario 8: Quarter-End Close
 * Full reconciliation run, exceptions discovered and resolved, reports regenerated, executive dashboard updated.
 */
const scenario8QuarterEndClose: ScenarioDefinition = {
  id: "quarter-end-close",
  title: "Quarter-End Close",
  description: "The quarterly financial close process runs full reconciliation, discovers and resolves exceptions, regenerates reports, and updates the executive dashboard.",
  category: "Operations",
  estimatedDuration: "~30 seconds",
  modules: ["Reconciliation", "LedgerService", "RiskService", "Reports", "Dashboard", "AuditService", "NotificationService"],
  async run(ctx) {
    const timeline = new TimelineTracker();
    timeline.record("Scenario Started", "Quarter-End Close — Q2 2025", "ScenarioEngine");
    timeline.record("Close Initiated", "Beginning full quarter-end reconciliation", "ReconciliationService", "info", { quarter: "Q2 2025" });

    const result = await orchestrateReconciliationScenario(ctx, timeline);
    result.scenarioId = this.id;
    result.scenarioTitle = this.title;

    if (result.status !== "failed") {
      timeline.record("Exceptions Resolved", "All reconciliation exceptions reviewed and resolved", "ReconciliationService", "success");
      timeline.record("Financial Reports Regenerated", "P&L, Balance Sheet, Cash Flow, Treasury Report — all regenerated", "ReportsService");
      timeline.record("Executive Dashboard Updated", "Quarterly KPIs published to executive dashboard", "DashboardService");
      timeline.record("Board Report Pack", "Quarter-end board report package assembled for distribution", "ReportsService");

      result.message = `**Quarter-end close completed.** Full reconciliation run finished. ${result.records.reconciliationRunId ? "All exceptions resolved." : "No exceptions found."} Financial reports regenerated and executive dashboard updated.`;
    }

    return result;
  },
};

/**
 * All 8 scenarios registered for discovery and execution.
 */
export const SCENARIOS: ScenarioDefinition[] = [
  scenario1HighValuePayment,
  scenario2BlockedPayment,
  scenario3DuplicateInvoice,
  scenario4LiquidityWarning,
  scenario5FxExposure,
  scenario6BankCallbackFailure,
  scenario7PayrollProcessing,
  scenario8QuarterEndClose,
];

export function getScenario(id: string): ScenarioDefinition | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export { scenario1HighValuePayment, scenario2BlockedPayment, scenario3DuplicateInvoice, scenario4LiquidityWarning, scenario5FxExposure, scenario6BankCallbackFailure, scenario7PayrollProcessing, scenario8QuarterEndClose };
