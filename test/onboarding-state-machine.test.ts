import { describe, it, expect, beforeEach } from "vitest";
import { OnboardingStateMachine } from "@/modules/onboarding/onboarding-state-machine";
import type { OnboardingSession, OnboardingStepRecord } from "@/modules/onboarding/types";

describe("OnboardingStateMachine", () => {
  let machine: OnboardingStateMachine;

  beforeEach(() => {
    machine = new OnboardingStateMachine();
  });

  const createSession = (overrides?: Partial<OnboardingSession>): OnboardingSession => ({
    id: "session-1",
    companyId: "company-1",
    status: "NOT_STARTED",
    currentStepId: null,
    steps: [],
    startedAt: null,
    completedAt: null,
    updatedAt: "2025-01-01T00:00:00.000Z",
    metadata: {},
    ...overrides,
  });

  const createStepRecord = (overrides?: Partial<OnboardingStepRecord>): OnboardingStepRecord => ({
    stepId: "company-setup",
    status: "PENDING",
    startedAt: null,
    completedAt: null,
    skippedAt: null,
    error: null,
    metadata: {},
    ...overrides,
  });

  describe("canTransitionSession", () => {
    it("allows NOT_STARTED -> IN_PROGRESS", () => {
      expect(machine.canTransitionSession("NOT_STARTED", "IN_PROGRESS")).toBe(true);
    });

    it("allows IN_PROGRESS -> COMPLETED", () => {
      expect(machine.canTransitionSession("IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("allows IN_PROGRESS -> ABANDONED", () => {
      expect(machine.canTransitionSession("IN_PROGRESS", "ABANDONED")).toBe(true);
    });

    it("rejects NOT_STARTED -> COMPLETED", () => {
      expect(machine.canTransitionSession("NOT_STARTED", "COMPLETED")).toBe(false);
    });

    it("rejects NOT_STARTED -> ABANDONED", () => {
      expect(machine.canTransitionSession("NOT_STARTED", "ABANDONED")).toBe(false);
    });

    it("rejects COMPLETED -> IN_PROGRESS", () => {
      expect(machine.canTransitionSession("COMPLETED", "IN_PROGRESS")).toBe(false);
    });

    it("rejects COMPLETED -> ABANDONED", () => {
      expect(machine.canTransitionSession("COMPLETED", "ABANDONED")).toBe(false);
    });

    it("rejects ABANDONED -> IN_PROGRESS", () => {
      expect(machine.canTransitionSession("ABANDONED", "IN_PROGRESS")).toBe(false);
    });

    it("rejects ABANDONED -> COMPLETED", () => {
      expect(machine.canTransitionSession("ABANDONED", "COMPLETED")).toBe(false);
    });

    it("rejects NOT_STARTED -> NOT_STARTED (self)", () => {
      expect(machine.canTransitionSession("NOT_STARTED", "NOT_STARTED")).toBe(false);
    });

    it("rejects IN_PROGRESS -> IN_PROGRESS (self)", () => {
      expect(machine.canTransitionSession("IN_PROGRESS", "IN_PROGRESS")).toBe(false);
    });
  });

  describe("canTransitionStep", () => {
    it("allows PENDING -> IN_PROGRESS", () => {
      expect(machine.canTransitionStep("PENDING", "IN_PROGRESS")).toBe(true);
    });

    it("allows IN_PROGRESS -> COMPLETED", () => {
      expect(machine.canTransitionStep("IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("allows IN_PROGRESS -> FAILED", () => {
      expect(machine.canTransitionStep("IN_PROGRESS", "FAILED")).toBe(true);
    });

    it("allows IN_PROGRESS -> SKIPPED", () => {
      expect(machine.canTransitionStep("IN_PROGRESS", "SKIPPED")).toBe(true);
    });

    it("allows FAILED -> IN_PROGRESS (retry)", () => {
      expect(machine.canTransitionStep("FAILED", "IN_PROGRESS")).toBe(true);
    });

    it("rejects COMPLETED -> anything", () => {
      expect(machine.canTransitionStep("COMPLETED", "IN_PROGRESS")).toBe(false);
      expect(machine.canTransitionStep("COMPLETED", "FAILED")).toBe(false);
      expect(machine.canTransitionStep("COMPLETED", "SKIPPED")).toBe(false);
      expect(machine.canTransitionStep("COMPLETED", "PENDING")).toBe(false);
    });

    it("rejects SKIPPED -> anything", () => {
      expect(machine.canTransitionStep("SKIPPED", "IN_PROGRESS")).toBe(false);
      expect(machine.canTransitionStep("SKIPPED", "COMPLETED")).toBe(false);
      expect(machine.canTransitionStep("SKIPPED", "FAILED")).toBe(false);
    });

    it("rejects PENDING -> COMPLETED (skip in-progress)", () => {
      expect(machine.canTransitionStep("PENDING", "COMPLETED")).toBe(false);
    });

    it("rejects PENDING -> FAILED", () => {
      expect(machine.canTransitionStep("PENDING", "FAILED")).toBe(false);
    });

    it("rejects PENDING -> SKIPPED", () => {
      expect(machine.canTransitionStep("PENDING", "SKIPPED")).toBe(false);
    });
  });

  describe("transitionSession", () => {
    it("transitions NOT_STARTED to IN_PROGRESS", () => {
      const session = createSession();
      const result = machine.transitionSession(session, "IN_PROGRESS");
      expect(result.status).toBe("IN_PROGRESS");
      expect(result.updatedAt).toBeTruthy();
    });

    it("transitions IN_PROGRESS to COMPLETED", () => {
      const session = createSession({ status: "IN_PROGRESS" });
      const result = machine.transitionSession(session, "COMPLETED");
      expect(result.status).toBe("COMPLETED");
    });

    it("transitions IN_PROGRESS to ABANDONED", () => {
      const session = createSession({ status: "IN_PROGRESS" });
      const result = machine.transitionSession(session, "ABANDONED");
      expect(result.status).toBe("ABANDONED");
    });

    it("throws on invalid session transition", () => {
      const session = createSession({ status: "COMPLETED" });
      expect(() => machine.transitionSession(session, "IN_PROGRESS")).toThrow(
        "Cannot transition session from COMPLETED to IN_PROGRESS",
      );
    });

    it("throws on NOT_STARTED -> COMPLETED", () => {
      const session = createSession();
      expect(() => machine.transitionSession(session, "COMPLETED")).toThrow(
        "Cannot transition session from NOT_STARTED to COMPLETED",
      );
    });

    it("does not mutate original session", () => {
      const session = createSession();
      const result = machine.transitionSession(session, "IN_PROGRESS");
      expect(session.status).toBe("NOT_STARTED");
      expect(result.status).toBe("IN_PROGRESS");
    });
  });

  describe("transitionStep", () => {
    it("transitions PENDING to IN_PROGRESS and sets startedAt", () => {
      const record = createStepRecord();
      const result = machine.transitionStep(record, "IN_PROGRESS");
      expect(result.status).toBe("IN_PROGRESS");
      expect(result.startedAt).toBeTruthy();
    });

    it("preserves existing startedAt when transitioning to IN_PROGRESS", () => {
      const record = createStepRecord({ startedAt: "2025-01-01T00:00:00.000Z" });
      const result = machine.transitionStep(record, "IN_PROGRESS");
      expect(result.startedAt).toBe("2025-01-01T00:00:00.000Z");
    });

    it("sets completedAt when transitioning to COMPLETED", () => {
      const record = createStepRecord({ status: "IN_PROGRESS" });
      const result = machine.transitionStep(record, "COMPLETED");
      expect(result.status).toBe("COMPLETED");
      expect(result.completedAt).toBeTruthy();
    });

    it("sets skippedAt when transitioning to SKIPPED", () => {
      const record = createStepRecord({ status: "IN_PROGRESS" });
      const result = machine.transitionStep(record, "SKIPPED");
      expect(result.status).toBe("SKIPPED");
      expect(result.skippedAt).toBeTruthy();
    });

    it("sets error when transitioning to FAILED with result error", () => {
      const record = createStepRecord({ status: "IN_PROGRESS" });
      const result = machine.transitionStep(record, "FAILED", {
        success: false, status: "FAILED", error: "Something went wrong", metadata: {},
      });
      expect(result.status).toBe("FAILED");
      expect(result.error).toBe("Something went wrong");
    });

    it("preserves existing error on FAILED if result has no error", () => {
      const record = createStepRecord({ status: "IN_PROGRESS", error: "previous error" });
      const result = machine.transitionStep(record, "FAILED", {
        success: false, status: "FAILED", error: null, metadata: {},
      });
      expect(result.error).toBe("previous error");
    });

    it("merges metadata from result", () => {
      const record = createStepRecord({ status: "IN_PROGRESS", metadata: { existing: true } });
      const result = machine.transitionStep(record, "COMPLETED", {
        success: true, status: "COMPLETED", error: null, metadata: { newKey: "value" },
      });
      expect(result.metadata).toEqual({ newKey: "value" });
    });

    it("throws on invalid step transition", () => {
      const record = createStepRecord();
      expect(() => machine.transitionStep(record, "COMPLETED")).toThrow(
        "Cannot transition step company-setup from PENDING to COMPLETED",
      );
    });

    it("allows FAILED -> IN_PROGRESS (retry)", () => {
      const record = createStepRecord({ status: "FAILED", error: "previous failure" });
      const result = machine.transitionStep(record, "IN_PROGRESS");
      expect(result.status).toBe("IN_PROGRESS");
    });

    it("does not mutate original record", () => {
      const record = createStepRecord();
      const result = machine.transitionStep(record, "IN_PROGRESS");
      expect(record.status).toBe("PENDING");
      expect(result.status).toBe("IN_PROGRESS");
    });
  });

  describe("isComplete", () => {
    it("returns true when all required steps are completed", () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "COMPLETED" }),
        ],
      });
      expect(machine.isComplete(session, ["company-setup", "org-structure"])).toBe(true);
    });

    it("returns false when a required step is not completed", () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "PENDING" }),
        ],
      });
      expect(machine.isComplete(session, ["company-setup", "org-structure"])).toBe(false);
    });

    it("returns false when a required step is skipped", () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "SKIPPED" }),
        ],
      });
      expect(machine.isComplete(session, ["company-setup", "org-structure"])).toBe(false);
    });

    it("returns false when a required step is in progress", () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "IN_PROGRESS" }),
        ],
      });
      expect(machine.isComplete(session, ["company-setup"])).toBe(false);
    });

    it("returns true for empty required steps list", () => {
      const session = createSession({ steps: [] });
      expect(machine.isComplete(session, [])).toBe(true);
    });

    it("ignores steps not in the required list", () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "ai", status: "SKIPPED" }),
        ],
      });
      expect(machine.isComplete(session, ["company-setup"])).toBe(true);
    });
  });
});
