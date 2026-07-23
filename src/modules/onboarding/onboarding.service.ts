import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import type {
  OnboardingSession,
  OnboardingSessionStatus,
  OnboardingStepDefinition,
  OnboardingStepId,
  OnboardingStepRecord,
  OnboardingProgress,
  OnboardingSummary,
  CreateSessionInput,
  AdvanceStepInput,
  SkipStepInput,
} from "./types";
import { OnboardingStateMachine } from "./onboarding-state-machine";
import { setupRegistry, SetupRegistry } from "./setup-registry";
import { OnboardingValidator } from "./validators";

export class OnboardingService {
  private sessions = new Map<string, OnboardingSession>();
  private stateMachine: OnboardingStateMachine;
  private registry: SetupRegistry;
  private validator: OnboardingValidator;

  constructor() {
    this.stateMachine = new OnboardingStateMachine();
    this.registry = setupRegistry;
    this.validator = new OnboardingValidator();
    this.registerDefaultValidators();
  }

  private registerDefaultValidators(): void {
    const entries = this.registry.getAllEntries();
    for (const entry of entries) {
      this.validator.register({
        stepId: entry.definition.id,
        validate: (session) => entry.executor.validate(session),
      });
    }
  }

  createSession(input: CreateSessionInput, ctx: TenantContext): OnboardingSession {
    const now = new Date().toISOString();
    const definitions = this.registry.getAllDefinitions();

    const steps: OnboardingStepRecord[] = definitions.map((def) => ({
      stepId: def.id,
      status: "PENDING" as const,
      startedAt: null,
      completedAt: null,
      skippedAt: null,
      error: null,
      metadata: {},
    }));

    const session: OnboardingSession = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      status: "NOT_STARTED",
      currentStepId: null,
      steps,
      startedAt: null,
      completedAt: null,
      updatedAt: now,
      metadata: { adminEmail: ctx.userId },
    };

    this.sessions.set(session.id, session);

    logger.info(
      { sessionId: session.id, companyId: ctx.companyId },
      "onboarding_session_created",
    );

    return session;
  }

  getSession(sessionId: string): OnboardingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundError("OnboardingSession");
    return session;
  }

  getSessionByCompany(companyId: string): OnboardingSession | undefined {
    return Array.from(this.sessions.values()).find((s) => s.companyId === companyId);
  }

  async startSession(sessionId: string): Promise<OnboardingSession> {
    const session = this.getSession(sessionId);

    if (session.status !== "NOT_STARTED") {
      throw new ValidationError(`Session is already ${session.status}`);
    }

    const now = new Date().toISOString();
    const started = this.stateMachine.transitionSession(session, "IN_PROGRESS");
    const firstStepId = this.registry.getAllDefinitions()[0]?.id ?? null;

    const updated: OnboardingSession = {
      ...started,
      startedAt: now,
      currentStepId: firstStepId,
      steps: started.steps.map((s) =>
        s.stepId === firstStepId ? { ...s, status: "IN_PROGRESS" as const, startedAt: now } : s,
      ),
    };

    this.sessions.set(sessionId, updated);

    logger.info(
      { sessionId, companyId: updated.companyId },
      "onboarding_session_started",
    );

    return updated;
  }

  async advanceStep(input: AdvanceStepInput): Promise<OnboardingSession> {
    const session = this.getSession(input.sessionId);

    if (session.status !== "IN_PROGRESS") {
      throw new ValidationError(`Session is not in progress (${session.status})`);
    }

    const definition = this.registry.getDefinition(input.stepId);
    if (!definition) throw new NotFoundError(`Step ${input.stepId}`);

    const stepRecord = session.steps.find((s) => s.stepId === input.stepId);
    if (!stepRecord) throw new NotFoundError(`Step record ${input.stepId}`);

    const prereqValidation = await this.validator.validatePrerequisites(
      input.stepId,
      session,
      definition.prerequisiteIds,
    );
    if (!prereqValidation.valid) {
      throw new ValidationError(
        prereqValidation.errors.map((e) => e.message).join("; "),
      );
    }

    const executor = this.registry.getExecutor(input.stepId);
    if (!executor) throw new NotFoundError(`Step executor ${input.stepId}`);

    const inProgressRecord = this.stateMachine.transitionStep(stepRecord, "IN_PROGRESS");
    const stepIndex = session.steps.findIndex((s) => s.stepId === input.stepId);
    const steps = [...session.steps];
    steps[stepIndex] = inProgressRecord;

    const runningSession: OnboardingSession = {
      ...session,
      currentStepId: input.stepId,
      steps,
      updatedAt: new Date().toISOString(),
    };

    const result = await executor.execute(runningSession);
    const completedRecord = this.stateMachine.transitionStep(
      steps[stepIndex],
      result.status,
      result,
    );
    steps[stepIndex] = completedRecord;

    const requiredStepIds = this.registry
      .getAllDefinitions()
      .filter((d) => d.isRequired)
      .map((d) => d.id);

    const isComplete = this.stateMachine.isComplete(
      { ...runningSession, steps },
      requiredStepIds,
    );

    let status: OnboardingSessionStatus = "IN_PROGRESS";
    if (isComplete) {
      status = "COMPLETED";
    }

    const nextStepId = this.findNextStep(steps);

    const updated: OnboardingSession = {
      ...runningSession,
      status,
      currentStepId: nextStepId,
      steps,
      completedAt: isComplete ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(input.sessionId, updated);

    logger.info(
      { sessionId: input.sessionId, stepId: input.stepId, status: result.status, isComplete },
      "onboarding_step_completed",
    );

    return updated;
  }

  async skipStep(input: SkipStepInput): Promise<OnboardingSession> {
    const session = this.getSession(input.sessionId);

    if (session.status !== "IN_PROGRESS") {
      throw new ValidationError(`Session is not in progress (${session.status})`);
    }

    const definition = this.registry.getDefinition(input.stepId);
    if (!definition) throw new NotFoundError(`Step ${input.stepId}`);

    if (definition.isRequired) {
      throw new ValidationError(`Cannot skip required step: ${input.stepId}`);
    }

    const stepRecord = session.steps.find((s) => s.stepId === input.stepId);
    if (!stepRecord) throw new NotFoundError(`Step record ${input.stepId}`);

    const executor = this.registry.getExecutor(input.stepId);
    if (!executor) throw new NotFoundError(`Step executor ${input.stepId}`);

    const result = await executor.skip(session);
    const stepIndex = session.steps.findIndex((s) => s.stepId === input.stepId);
    const steps = [...session.steps];
    steps[stepIndex] = this.stateMachine.transitionStep(steps[stepIndex], result.status, result);

    const nextStepId = this.findNextStep(steps);
    const updated: OnboardingSession = {
      ...session,
      currentStepId: nextStepId,
      steps,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(input.sessionId, updated);
    return updated;
  }

  abandonSession(sessionId: string): OnboardingSession {
    const session = this.getSession(sessionId);
    const updated = this.stateMachine.transitionSession(session, "ABANDONED");
    this.sessions.set(sessionId, { ...updated, updatedAt: new Date().toISOString() });
    return updated;
  }

  getProgress(sessionId: string): OnboardingProgress {
    const session = this.getSession(sessionId);
    return this.buildProgress(session);
  }

  getSummary(companyId: string): OnboardingSummary {
    const session = this.getSessionByCompany(companyId);
    if (!session) {
      return { hasStarted: false, hasCompleted: false, percentComplete: 0, currentStepName: null };
    }

    const progress = this.buildProgress(session);
    return {
      hasStarted: session.status !== "NOT_STARTED",
      hasCompleted: session.status === "COMPLETED",
      percentComplete: progress.overall.percentComplete,
      currentStepName: progress.currentStep?.label ?? null,
    };
  }

  private findNextStep(steps: OnboardingStepRecord[]): OnboardingStepId | null {
    const completedIds = steps
      .filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED")
      .map((s) => s.stepId);

    const nextSteps = this.registry.getNextSteps(completedIds);
    return nextSteps[0] ?? null;
  }

  private buildProgress(session: OnboardingSession): OnboardingProgress {
    const completedIds = session.steps
      .filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED")
      .map((s) => s.stepId);

    const nextSteps = this.registry.getNextSteps(completedIds);
    const blockedSteps = this.registry.getBlockedSteps(completedIds);

    const total = session.steps.length;
    const completed = session.steps.filter((s) => s.status === "COMPLETED").length;
    const inProgress = session.steps.filter((s) => s.status === "IN_PROGRESS").length;
    const pending = session.steps.filter((s) => s.status === "PENDING").length;
    const skipped = session.steps.filter((s) => s.status === "SKIPPED").length;
    const failed = session.steps.filter((s) => s.status === "FAILED").length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    const currentStepDef: OnboardingStepDefinition | null = session.currentStepId
      ? (this.registry.getDefinition(session.currentStepId) ?? null)
      : null;

    const remainingMinutes = nextSteps.reduce((sum, stepId) => {
      const def = this.registry.getDefinition(stepId);
      return sum + (def?.estimatedMinutes ?? 0);
    }, 0);

    const steps = session.steps.map((record) => {
      const definition = this.registry.getDefinition(record.stepId)!;
      const executor = this.registry.getExecutor(record.stepId);
      const progress = executor?.getProgress(session) ?? {
        stepId: record.stepId,
        completed: 0,
        total: 1,
        label: definition.label,
      };
      return { definition, record, progress };
    });

    return {
      sessionId: session.id,
      companyId: session.companyId,
      status: session.status,
      overall: { total, completed, inProgress, pending, skipped, failed, percentComplete },
      currentStep: currentStepDef,
      steps,
      nextSteps,
      blockedSteps,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      estimatedRemainingMinutes: remainingMinutes,
    };
  }
}
