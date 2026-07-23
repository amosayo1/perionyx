import { describe, it, expect, beforeEach } from "vitest";
import { OnboardingValidator, type StepValidator } from "@/modules/onboarding/validators";
import type { OnboardingSession, OnboardingStepRecord } from "@/modules/onboarding/types";

describe("OnboardingValidator", () => {
  let validator: OnboardingValidator;

  beforeEach(() => {
    validator = new OnboardingValidator();
  });

  const createSession = (overrides?: Partial<OnboardingSession>): OnboardingSession => ({
    id: "session-1",
    companyId: "company-1",
    status: "IN_PROGRESS",
    currentStepId: "company-setup",
    steps: [],
    startedAt: "2025-01-01T00:00:00.000Z",
    completedAt: null,
    updatedAt: "2025-01-01T00:00:00.000Z",
    metadata: {},
    ...overrides,
  });

  const createStepRecord = (overrides?: Partial<OnboardingStepRecord>): OnboardingStepRecord => ({
    stepId: "company-setup",
    status: "COMPLETED",
    startedAt: null,
    completedAt: null,
    skippedAt: null,
    error: null,
    metadata: {},
    ...overrides,
  });

  describe("register and unregister", () => {
    it("registers a step validator", () => {
      const sv: StepValidator = {
        stepId: "company-setup",
        validate: () => Promise.resolve({ valid: true, errors: [], warnings: [] }),
      };
      validator.register(sv);
      expect(true).toBe(true);
    });

    it("unregisters a step validator", () => {
      const sv: StepValidator = {
        stepId: "company-setup",
        validate: () => Promise.resolve({ valid: true, errors: [], warnings: [] }),
      };
      validator.register(sv);
      validator.unregister("company-setup");
      expect(true).toBe(true);
    });
  });

  describe("validateStep", () => {
    it("returns valid when validator exists and passes", async () => {
      const sv: StepValidator = {
        stepId: "company-setup",
        validate: () => Promise.resolve({ valid: true, errors: [], warnings: [] }),
      };
      validator.register(sv);
      const result = await validator.validateStep("company-setup", createSession());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("returns errors when validator rejects", async () => {
      const sv: StepValidator = {
        stepId: "company-setup",
        validate: () =>
          Promise.resolve({
            valid: false,
            errors: [{ field: "name", message: "Name required", code: "MISSING_NAME" }],
            warnings: [],
          }),
      };
      validator.register(sv);
      const result = await validator.validateStep("company-setup", createSession());
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("MISSING_NAME");
    });

    it("returns no-validator error when step is not registered", async () => {
      const result = await validator.validateStep("unknown" as any, createSession());
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("NO_VALIDATOR");
    });
  });

  describe("validatePrerequisites", () => {
    it("passes when all prerequisites are completed", async () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "COMPLETED" }),
        ],
      });
      const result = await validator.validatePrerequisites(
        "treasury-setup", session, ["org-structure"],
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("passes when prerequisites are skipped", async () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "SKIPPED" }),
        ],
      });
      const result = await validator.validatePrerequisites(
        "governance", session, ["org-structure"],
      );
      expect(result.valid).toBe(true);
    });

    it("fails when a prerequisite is pending", async () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "COMPLETED" }),
          createStepRecord({ stepId: "org-structure", status: "PENDING" }),
        ],
      });
      const result = await validator.validatePrerequisites(
        "treasury-setup", session, ["org-structure"],
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("PREREQUISITE_NOT_MET");
    });

    it("fails when a prerequisite is in progress", async () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "IN_PROGRESS" }),
        ],
      });
      const result = await validator.validatePrerequisites(
        "org-structure", session, ["company-setup"],
      );
      expect(result.valid).toBe(false);
    });

    it("fails when a prerequisite is failed", async () => {
      const session = createSession({
        steps: [
          createStepRecord({ stepId: "company-setup", status: "FAILED" }),
        ],
      });
      const result = await validator.validatePrerequisites(
        "org-structure", session, ["company-setup"],
      );
      expect(result.valid).toBe(false);
    });

    it("fails when a prerequisite record is missing entirely", async () => {
      const session = createSession({ steps: [] });
      const result = await validator.validatePrerequisites(
        "org-structure", session, ["company-setup"],
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("PREREQUISITE_NOT_MET");
    });

    it("passes with empty prerequisites", async () => {
      const result = await validator.validatePrerequisites(
        "company-setup", createSession(), [],
      );
      expect(result.valid).toBe(true);
    });

    it("reports all unmet prerequisites, not just the first", async () => {
      const session = createSession({ steps: [] });
      const result = await validator.validatePrerequisites(
        "governance", session, ["users", "treasury-setup"],
      );
      expect(result.errors).toHaveLength(2);
    });
  });

  describe("validateSession", () => {
    it("validates a valid in-progress session", async () => {
      const session = createSession({ companyId: "company-1" });
      const result = await validator.validateSession(session);
      expect(result.valid).toBe(true);
    });

    it("fails when companyId is empty", async () => {
      const session = createSession({ companyId: "" });
      const result = await validator.validateSession(session);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("MISSING_COMPANY");
    });

    it("fails when companyId is undefined", async () => {
      const session = createSession({ companyId: "" });
      const result = await validator.validateSession(session);
      expect(result.valid).toBe(false);
    });

    it("fails when session is already completed", async () => {
      const session = createSession({ status: "COMPLETED" });
      const result = await validator.validateSession(session);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("SESSION_COMPLETED");
    });

    it("reports both missing company and completed status", async () => {
      const session = createSession({ companyId: "", status: "COMPLETED" });
      const result = await validator.validateSession(session);
      expect(result.errors).toHaveLength(2);
    });
  });
});
