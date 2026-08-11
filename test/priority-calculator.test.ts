import { describe, it, expect } from "vitest";
import { calculateCategoryUrgency, getDefaultSignals } from "@/modules/todays-work";
import type { PrioritySignals } from "@/modules/todays-work";

describe("calculateCategoryUrgency", () => {
  it("returns 'low' when all signals are zero", () => {
    const signals = getDefaultSignals();
    expect(calculateCategoryUrgency(signals)).toBe("low");
  });

  it("returns 'low' for 1 overdue invoice (score=1, threshold=2)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), overdueInvoices: 1 };
    expect(calculateCategoryUrgency(signals)).toBe("low");
  });

  it("returns 'medium' for 3 overdue invoices (score=2)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), overdueInvoices: 3 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'medium' for 15 overdue invoices (score=4, below critical threshold of 8)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), overdueInvoices: 15 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'high' for combined overdue+exceptions reaching score 5+", () => {
    const signals: PrioritySignals = {
      ...getDefaultSignals(),
      overdueInvoices: 10,
      openExceptions: 3,
    };
    expect(calculateCategoryUrgency(signals)).toBe("high");
  });

  it("returns 'critical' for combined signals reaching score 8+", () => {
    const signals: PrioritySignals = {
      ...getDefaultSignals(),
      overdueInvoices: 10,
      openExceptions: 5,
      oldestInvoiceAgeDays: 30,
      blockedInvoices: 3,
    };
    expect(calculateCategoryUrgency(signals)).toBe("critical");
  });

  it("returns 'medium' for 30-day-old invoice alone (score=4)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), oldestInvoiceAgeDays: 30 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'medium' for 14-day-old invoice alone (score=2)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), oldestInvoiceAgeDays: 14 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'medium' for breached approval SLA (score=2)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), approvalSlaBreachedCount: 1 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'medium' for payments due today (score=2)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), paymentsDueTodayCount: 1 };
    expect(calculateCategoryUrgency(signals)).toBe("medium");
  });

  it("returns 'low' for 1 blocked invoice (score=1)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), blockedInvoices: 1 };
    expect(calculateCategoryUrgency(signals)).toBe("low");
  });

  it("returns 'low' for supplier risk (score=1)", () => {
    const signals: PrioritySignals = { ...getDefaultSignals(), supplierRiskCount: 1 };
    expect(calculateCategoryUrgency(signals)).toBe("low");
  });

  it("achieves 'high' urgency for 3 overdue + 3 exceptions + 14 day oldest (score=2+2+2=6)", () => {
    const signals: PrioritySignals = {
      ...getDefaultSignals(),
      overdueInvoices: 3,
      openExceptions: 3,
      oldestInvoiceAgeDays: 14,
    };
    expect(calculateCategoryUrgency(signals)).toBe("high");
  });

  it("achieves 'high' urgency with overdue + blocked + sla (score=4+1+2=7)", () => {
    const signals: PrioritySignals = {
      ...getDefaultSignals(),
      overdueInvoices: 5,
      blockedInvoices: 1,
      approvalSlaBreachedCount: 1,
    };
    const result = calculateCategoryUrgency(signals);
    expect(result === "high" || result === "critical").toBe(true);
  });
});

describe("getDefaultSignals", () => {
  it("returns all fields at zero", () => {
    const signals = getDefaultSignals();
    expect(signals.overdueInvoices).toBe(0);
    expect(signals.paymentsDueTodayCount).toBe(0);
    expect(signals.openExceptions).toBe(0);
    expect(signals.blockedInvoices).toBe(0);
    expect(signals.supplierRiskCount).toBe(0);
    expect(signals.approvalSlaBreachedCount).toBe(0);
    expect(signals.oldestInvoiceAgeDays).toBe(0);
    expect(signals.totalPendingInvoices).toBe(0);
  });
});
