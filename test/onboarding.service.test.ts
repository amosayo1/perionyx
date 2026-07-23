import { describe, it, expect, beforeEach, vi } from "vitest";
import { OnboardingService } from "@/modules/onboarding/onboarding.service";
import { setupRegistry } from "@/modules/onboarding/setup-registry";
import type { OnboardingStepExecutor, StepExecutionResult, ValidationResult, StepProgress, OnboardingSession } from "@/modules/onboarding/types";
import type { TenantContext } from "@/server/context/tenant-context";

function createMockExecutor(stepId: string): OnboardingStepExecutor {
  return {
    stepId: stepId as any,
    validate: vi.fn<[_session: any], Promise<ValidationResult>>().mockResolvedValue({ valid: true, errors: [], warnings: [] }),
    execute: vi.fn<[_session: any], Promise<StepExecutionResult>>().mockResolvedValue({
      success: true, status: "COMPLETED", error: null, metadata: { completedAt: new Date().toISOString() },
    }),
    skip: vi.fn<[_session: any], Promise<StepExecutionResult>>().mockResolvedValue({
      success: true, status: "SKIPPED", error: null, metadata: { skippedAt: new Date().toISOString(), skippedBy: "user" },
    }),
    getProgress: vi.fn<[_session: any], StepProgress>().mockReturnValue({ stepId: stepId as any, completed: 1, total: 1, label: stepId }),
  };
}

function createMockContext(): TenantContext {
  return { userId: "user-1", companyId: "company-1", role: "OWNER" };
}

function resetFirstStepToPending(session: OnboardingSession): void {
  const step = session.steps.find((s) => s.stepId === "company-setup")!;
  step.status = "PENDING";
  step.startedAt = null;
}

function completeFirstStep(session: OnboardingSession): void {
  const step = session.steps.find((s) => s.stepId === "company-setup")!;
  step.status = "COMPLETED";
  step.completedAt = new Date().toISOString();
}

describe("OnboardingService", () => {
  let service: OnboardingService;
  let ctx: TenantContext;
  const mockExecutors = new Map<string, OnboardingStepExecutor>();

  beforeEach(() => {
    mockExecutors.clear();
    service = new OnboardingService();
    ctx = createMockContext();

    const defs = setupRegistry.getAllDefinitions();
    for (const def of defs) {
      const mock = createMockExecutor(def.id);
      mockExecutors.set(def.id, mock);
      setupRegistry.register(mock);
    }
  });

  describe("createSession", () => {
    it("creates a session with NOT_STARTED status", () => {
      const session = service.createSession({ companyId: ctx.companyId }, ctx);
      expect(session.status).toBe("NOT_STARTED");
      expect(session.companyId).toBe("company-1");
      expect(session.steps).toHaveLength(10);
      expect(session.id).toBeTruthy();
    });

    it("creates all steps with PENDING status", () => {
      const session = service.createSession({ companyId: ctx.companyId }, ctx);
      for (const step of session.steps) {
        expect(step.status).toBe("PENDING");
      }
    });

    it("sets currentStepId to null initially", () => {
      const session = service.createSession({ companyId: ctx.companyId }, ctx);
      expect(session.currentStepId).toBeNull();
    });

    it("stores adminEmail in metadata", () => {
      const session = service.createSession({ companyId: ctx.companyId }, ctx);
      expect(session.metadata.adminEmail).toBe("user-1");
    });
  });

  describe("getSession", () => {
    it("returns session by id", () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      const found = service.getSession(created.id);
      expect(found.id).toBe(created.id);
    });

    it("throws NotFoundError for missing session", () => {
      expect(() => service.getSession("nonexistent")).toThrow("OnboardingSession not found");
    });
  });

  describe("getSessionByCompany", () => {
    it("returns session for company", () => {
      service.createSession({ companyId: ctx.companyId }, ctx);
      const found = service.getSessionByCompany("company-1");
      expect(found).toBeDefined();
    });

    it("returns undefined for company with no session", () => {
      expect(service.getSessionByCompany("no-such-company")).toBeUndefined();
    });
  });

  describe("startSession", () => {
    it("transitions session to IN_PROGRESS", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      const started = await service.startSession(created.id);
      expect(started.status).toBe("IN_PROGRESS");
      expect(started.startedAt).toBeTruthy();
    });

    it("sets currentStepId to first step", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      const started = await service.startSession(created.id);
      expect(started.currentStepId).toBe("company-setup");
    });

    it("marks first step as IN_PROGRESS", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      const started = await service.startSession(created.id);
      const firstStep = started.steps.find((s) => s.stepId === "company-setup");
      expect(firstStep?.status).toBe("IN_PROGRESS");
      expect(firstStep?.startedAt).toBeTruthy();
    });

    it("throws if session already started", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      await expect(service.startSession(created.id)).rejects.toThrow(
        "Session is already IN_PROGRESS",
      );
    });
  });

  describe("advanceStep", () => {
    it("transitions step to COMPLETED", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      // startSession sets first step to IN_PROGRESS; reset to PENDING so advanceStep works
      resetFirstStepToPending(service.getSession(created.id));

      const updated = await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });
      const step = updated.steps.find((s) => s.stepId === "company-setup");
      expect(step?.status).toBe("COMPLETED");
    });

    it("throws if session is not in progress", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await expect(
        service.advanceStep({ sessionId: created.id, stepId: "company-setup" }),
      ).rejects.toThrow("Session is not in progress");
    });

    it("throws for unknown step", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      await expect(
        service.advanceStep({ sessionId: created.id, stepId: "unknown" as any }),
      ).rejects.toThrow();
    });

    it("throws if prerequisites are not met", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      await expect(
        service.advanceStep({ sessionId: created.id, stepId: "governance" }),
      ).rejects.toThrow();
    });

    it("completes session when all required steps are done", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const order = ["company-setup", "org-structure", "users", "treasury-setup", "integrations", "governance", "workflows", "operations"];

      for (const stepId of order) {
        const session = service.getSession(created.id);
        if (session.status === "COMPLETED") break;
        await service.advanceStep({ sessionId: created.id, stepId: stepId as any });
      }

      const final = service.getSession(created.id);
      expect(final.status).toBe("COMPLETED");
      expect(final.completedAt).toBeTruthy();
    });

    it("sets next step after advancing", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const updated = await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });
      expect(updated.currentStepId).toBe("org-structure");
    });

    it("calls executor.execute with the session", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const mock = mockExecutors.get("company-setup")!;
      await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });
      expect(mock.execute).toHaveBeenCalled();
    });

    it("handles step failure via executor", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const mock = mockExecutors.get("company-setup")!;
      vi.mocked(mock.execute).mockResolvedValue({
        success: false, status: "FAILED", error: "Something went wrong", metadata: {},
      });

      const updated = await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });
      const step = updated.steps.find((s) => s.stepId === "company-setup");
      expect(step?.status).toBe("FAILED");
      expect(step?.error).toBe("Something went wrong");
    });
  });

  describe("skipStep", () => {
    async function advanceToWorkflows(created: ReturnType<typeof service.createSession>) {
      const order = ["company-setup", "org-structure", "users", "treasury-setup", "integrations", "governance", "workflows"];
      for (const stepId of order) {
        await service.advanceStep({ sessionId: created.id, stepId: stepId as any });
      }
    }

    it("skips an optional step", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));
      await advanceToWorkflows(created);

      // Set step to IN_PROGRESS first (state machine requires IN_PROGRESS -> SKIPPED)
      const session = service.getSession(created.id);
      const aiStep = session.steps.find((s) => s.stepId === "ai")!;
      aiStep.status = "IN_PROGRESS";
      aiStep.startedAt = new Date().toISOString();

      const updated = await service.skipStep({ sessionId: created.id, stepId: "ai" });
      const step = updated.steps.find((s) => s.stepId === "ai");
      expect(step?.status).toBe("SKIPPED");
    });

    it("throws when skipping a required step", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      await expect(
        service.skipStep({ sessionId: created.id, stepId: "company-setup" }),
      ).rejects.toThrow("Cannot skip required step: company-setup");
    });

    it("throws if session is not in progress", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await expect(
        service.skipStep({ sessionId: created.id, stepId: "ai" }),
      ).rejects.toThrow("Session is not in progress");
    });

    it("calls executor.skip", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));
      await advanceToWorkflows(created);

      // Set step to IN_PROGRESS first (state machine requires IN_PROGRESS -> SKIPPED)
      const session = service.getSession(created.id);
      const aiStep = session.steps.find((s) => s.stepId === "ai")!;
      aiStep.status = "IN_PROGRESS";
      aiStep.startedAt = new Date().toISOString();

      const mock = mockExecutors.get("ai")!;
      await service.skipStep({ sessionId: created.id, stepId: "ai" });
      expect(mock.skip).toHaveBeenCalled();
    });
  });

  describe("abandonSession", () => {
    it("transitions session to ABANDONED", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      const abandoned = service.abandonSession(created.id);
      expect(abandoned.status).toBe("ABANDONED");
    });

    it("throws for missing session", () => {
      expect(() => service.abandonSession("nonexistent")).toThrow("OnboardingSession not found");
    });
  });

  describe("getProgress", () => {
    it("returns progress for a session", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      const progress = service.getProgress(created.id);
      expect(progress.sessionId).toBe(created.id);
      expect(progress.overall.total).toBe(10);
      expect(progress.overall.percentComplete).toBe(0);
    });

    it("shows blocked steps for unmet prerequisites", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));
      await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });

      const progress = service.getProgress(created.id);
      expect(progress.nextSteps).toContain("org-structure");
      expect(progress.nextSteps).toContain("users");
      expect(progress.nextSteps).toContain("integrations");
    });

    it("reports estimated remaining minutes", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));
      await service.advanceStep({ sessionId: created.id, stepId: "company-setup" });

      const progress = service.getProgress(created.id);
      expect(progress.estimatedRemainingMinutes).toBeGreaterThan(0);
    });

    it("returns high percent when all steps completed", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const order = ["company-setup", "org-structure", "users", "treasury-setup", "integrations", "governance", "workflows", "operations"];
      for (const stepId of order) {
        await service.advanceStep({ sessionId: created.id, stepId: stepId as any });
      }

      const progress = service.getProgress(created.id);
      expect(progress.overall.percentComplete).toBeGreaterThanOrEqual(80);
    });
  });

  describe("getSummary", () => {
    it("returns not started for company with no session", () => {
      const summary = service.getSummary("no-such-company");
      expect(summary.hasStarted).toBe(false);
      expect(summary.hasCompleted).toBe(false);
      expect(summary.percentComplete).toBe(0);
      expect(summary.currentStepName).toBeNull();
    });

    it("returns started for company with active session", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      const summary = service.getSummary("company-1");
      expect(summary.hasStarted).toBe(true);
      expect(summary.currentStepName).toBe("Company Setup");
    });

    it("returns completed for finished session", async () => {
      const created = service.createSession({ companyId: ctx.companyId }, ctx);
      await service.startSession(created.id);
      resetFirstStepToPending(service.getSession(created.id));

      const order = ["company-setup", "org-structure", "users", "treasury-setup", "integrations", "governance", "workflows", "operations"];
      for (const stepId of order) {
        const session = service.getSession(created.id);
        if (session.status === "COMPLETED") break;
        await service.advanceStep({ sessionId: created.id, stepId: stepId as any });
      }

      const summary = service.getSummary("company-1");
      expect(summary.hasCompleted).toBe(true);
      expect(summary.hasStarted).toBe(true);
    });
  });
});
