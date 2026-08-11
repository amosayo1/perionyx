import { describe, it, expect } from "vitest";
import { estimateWorkload, formatEstimatedMinutes, HANDLING_DURATIONS } from "@/modules/todays-work";

describe("estimateWorkload", () => {
  it("calculates zero workload for no tasks", () => {
    const result = estimateWorkload(0, 0, 0, 0);
    expect(result.estimatedMinutes).toBe(0);
    expect(result.highPriorityPercentage).toBe(0);
  });

  it("calculates workload with only high-priority tasks", () => {
    const result = estimateWorkload(5, 0, 0, 0);
    const expected = 5 * HANDLING_DURATIONS.highPriorityReviewMinutes;
    expect(result.estimatedMinutes).toBe(expected);
    expect(result.highPriorityPercentage).toBe(100);
  });

  it("calculates workload with only quick approvals", () => {
    const result = estimateWorkload(0, 0, 20, 0);
    const expected = 20 * HANDLING_DURATIONS.quickApprovalMinutes;
    expect(result.estimatedMinutes).toBe(expected);
    expect(result.highPriorityPercentage).toBe(0);
  });

  it("calculates mixed workload correctly", () => {
    const result = estimateWorkload(3, 5, 8, 2);
    const expected =
      3 * HANDLING_DURATIONS.highPriorityReviewMinutes +
      5 * HANDLING_DURATIONS.mediumPriorityReviewMinutes +
      8 * HANDLING_DURATIONS.quickApprovalMinutes +
      2 * HANDLING_DURATIONS.exceptionResolutionMinutes;
    expect(result.estimatedMinutes).toBe(expected);
  });

  it("calculates high-priority percentage including exceptions", () => {
    const result = estimateWorkload(2, 5, 10, 3);
    const total = 2 + 5 + 10 + 3;
    const highCount = 2 + 3;
    expect(result.highPriorityPercentage).toBe(Math.round((highCount / total) * 100));
  });

  it("handles zero high-priority with some tasks", () => {
    const result = estimateWorkload(0, 0, 10, 0);
    expect(result.highPriorityPercentage).toBe(0);
  });

  it("handles all tasks as high-priority", () => {
    const result = estimateWorkload(5, 0, 0, 3);
    expect(result.highPriorityPercentage).toBe(100);
  });
});

describe("formatEstimatedMinutes", () => {
  it("returns '<1 min' for zero", () => {
    expect(formatEstimatedMinutes(0)).toBe("<1 min");
  });

  it("returns '<1 min' for fractional minutes", () => {
    expect(formatEstimatedMinutes(0.5)).toBe("<1 min");
  });

  it('returns "~X min" for under an hour', () => {
    expect(formatEstimatedMinutes(45)).toBe("~45 min");
  });

  it('returns "~X min" for 1 minute', () => {
    expect(formatEstimatedMinutes(1)).toBe("~1 min");
  });

  it('returns "~Xh" for exact hours', () => {
    expect(formatEstimatedMinutes(120)).toBe("~2h");
  });

  it('returns "~Xh Ym" for hours and minutes', () => {
    expect(formatEstimatedMinutes(150)).toBe("~2h 30m");
  });

  it('handles exactly 60 minutes', () => {
    expect(formatEstimatedMinutes(60)).toBe("~1h");
  });

  it('rounds minutes to nearest integer', () => {
    expect(formatEstimatedMinutes(61.7)).toBe("~1h 2m");
  });
});
