import { prisma } from "@/server/db/prisma";
import { HIGH_VALUE_THRESHOLD, PENDING_STATUSES } from "@/modules/work-queue";
import type {
  ITodaysWorkService,
  TaskCategory,
  TodaysWorkResult,
  PrioritySignals,
} from "./types";
import { calculateCategoryUrgency, getDefaultSignals } from "./priority-calculator";
import { estimateWorkload, formatEstimatedMinutes } from "./workload-estimator";

interface InvoiceQueryRow {
  id: string;
  status: string;
  totalAmount: { toNumber(): number };
  dueDate: Date;
  invoiceDate: Date;
}

export class TodaysWorkService implements ITodaysWorkService {
  async getTodaysWork(companyId: string): Promise<TodaysWorkResult> {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const [pendingInvoices, openExceptions] = await Promise.all([
      prisma.procurementVendorInvoice.findMany({
        where: {
          companyId,
          status: { in: PENDING_STATUSES },
        },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          dueDate: true,
          invoiceDate: true,
        },
      }),
      prisma.procurementInvoiceException.findMany({
        where: {
          companyId,
          status: "OPEN",
        },
        select: { id: true },
      }),
    ]);

    const overdueInvoices = pendingInvoices.filter((inv) => inv.dueDate < todayStart);
    const dueTodayInvoices = pendingInvoices.filter(
      (inv) =>
        inv.dueDate >= todayStart &&
        inv.dueDate < new Date(todayStart.getTime() + 86400000),
    );
    const highValueInvoices = pendingInvoices.filter(
      (inv) => inv.totalAmount.toNumber() >= HIGH_VALUE_THRESHOLD,
    );

    const exceptionCount = openExceptions.length;
    const overdueCount = overdueInvoices.length;
    const dueTodayCount = dueTodayInvoices.length;
    const highValueCount = highValueInvoices.length;
    const mediumValueCount = pendingInvoices.length - highValueCount - overdueCount;
    const oldestAge = this.calculateOldestAge(pendingInvoices);

    const highPrioritySignals: PrioritySignals = {
      ...getDefaultSignals(),
      overdueInvoices: overdueCount,
      paymentsDueTodayCount: dueTodayCount,
      openExceptions: exceptionCount,
      totalPendingInvoices: pendingInvoices.length,
      oldestInvoiceAgeDays: oldestAge,
    };

    const mediumPrioritySignals: PrioritySignals = {
      ...getDefaultSignals(),
      totalPendingInvoices: Math.max(0, mediumValueCount),
    };

    const quickApprovalSignals: PrioritySignals = {
      ...getDefaultSignals(),
      totalPendingInvoices: pendingInvoices.length - overdueCount - highValueCount,
    };

    const highUrgency = calculateCategoryUrgency(highPrioritySignals);
    const mediumUrgency = calculateCategoryUrgency(mediumPrioritySignals);

    const workload = estimateWorkload(
      overdueCount + highValueCount,
      mediumValueCount,
      Math.max(0, pendingInvoices.length - overdueCount - highValueCount - exceptionCount),
      exceptionCount,
    );

    const categories: TaskCategory[] = [];

    const highPriorityReason = this.buildHighPriorityReason(overdueCount, exceptionCount, oldestAge, highValueCount);

    categories.push({
      id: "high-priority-reviews",
      label: "High Priority Reviews",
      count: overdueCount + highValueCount + exceptionCount,
      urgency: highUrgency,
      estimatedEffort: formatEstimatedMinutes(
        (overdueCount + highValueCount) * 12 + exceptionCount * 8,
      ),
      estimatedMinutes: (overdueCount + highValueCount) * 12 + exceptionCount * 8,
      navigationTarget: "/work-queue?filter=high-priority",
      supportingReason: highPriorityReason,
    });

    if (mediumValueCount > 0) {
      categories.push({
        id: "medium-priority-reviews",
        label: "Medium Priority Reviews",
        count: mediumValueCount,
        urgency: mediumUrgency,
        estimatedEffort: formatEstimatedMinutes(mediumValueCount * 5),
        estimatedMinutes: mediumValueCount * 5,
        navigationTarget: "/work-queue?filter=medium-priority",
        supportingReason: `${mediumValueCount} invoice${mediumValueCount === 1 ? "" : "s"} awaiting standard review`,
      });
    }

    const quickApprovalCount = Math.max(0, pendingInvoices.length - overdueCount - highValueCount - exceptionCount);
    if (quickApprovalCount > 0) {
      categories.push({
        id: "quick-approvals",
        label: "Quick Approvals",
        count: quickApprovalCount,
        urgency: "low",
        estimatedEffort: formatEstimatedMinutes(quickApprovalCount * 1),
        estimatedMinutes: quickApprovalCount * 1,
        navigationTarget: "/work-queue?filter=quick-approvals",
        supportingReason: `${quickApprovalCount} invoice${quickApprovalCount === 1 ? "" : "s"} eligible for fast-track approval`,
      });
    }

    if (exceptionCount > 0) {
      categories.push({
        id: "policy-exceptions",
        label: "Policy Exceptions",
        count: exceptionCount,
        urgency: highUrgency,
        estimatedEffort: formatEstimatedMinutes(exceptionCount * 8),
        estimatedMinutes: exceptionCount * 8,
        navigationTarget: "/work-queue?filter=exceptions",
        supportingReason: `${exceptionCount} open exception${exceptionCount === 1 ? "" : "s"} requiring resolution`,
      });
    }

    return {
      categories,
      totalTasks: workload.estimatedMinutes,
      estimatedTotalMinutes: workload.estimatedMinutes,
      highPriorityPercentage: workload.highPriorityPercentage,
    };
  }

  private calculateOldestAge(invoices: InvoiceQueryRow[]): number {
    if (invoices.length === 0) return 0;
    const now = Date.now();
    let maxAge = 0;
    for (const inv of invoices) {
      const age = Math.floor((now - inv.invoiceDate.getTime()) / 86400000);
      if (age > maxAge) maxAge = age;
    }
    return maxAge;
  }

  private buildHighPriorityReason(
    overdueCount: number,
    exceptionCount: number,
    oldestAgeDays: number,
    highValueCount: number,
  ): string {
    const parts: string[] = [];
    if (overdueCount > 0) {
      parts.push(`${overdueCount} overdue invoice${overdueCount === 1 ? "" : "s"}`);
    }
    if (highValueCount > 0) {
      parts.push(`${highValueCount} above $${HIGH_VALUE_THRESHOLD.toLocaleString()}`);
    }
    if (exceptionCount > 0) {
      parts.push(`${exceptionCount} open exception${exceptionCount === 1 ? "" : "s"}`);
    }
    if (oldestAgeDays > 0) {
      parts.push(`oldest is ${oldestAgeDays} days old`);
    }
    return parts.length > 0 ? parts.join("; ") : "No high-priority items currently";
  }
}
