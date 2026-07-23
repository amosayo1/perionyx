import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { OnboardingService } from "@/modules/onboarding";
import { EnterpriseReadinessService } from "@/modules/onboarding/enterprise-readiness.service";

export default async function OnboardingSetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );

  const onboardingService = new OnboardingService();
  const sessionByCompany = onboardingService.getSessionByCompany(ctx.companyId);

  const wizardSession = sessionByCompany
    ? onboardingService.getProgress(sessionByCompany.id)
    : null;

  const readinessService = new EnterpriseReadinessService();
  const readiness = await readinessService.evaluate(ctx).catch(() => null);

  const summary = onboardingService.getSummary(ctx.companyId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Enterprise Setup Wizard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configure your platform step by step to unlock full enterprise capabilities
        </p>
      </div>

      <OnboardingWizard
        progress={wizardSession ? {
          sessionId: wizardSession.sessionId,
          companyId: wizardSession.companyId,
          status: wizardSession.status,
          overall: wizardSession.overall,
          currentStep: wizardSession.currentStep,
          steps: wizardSession.steps.map((s) => ({
            definition: s.definition,
            record: s.record,
            progress: s.progress,
          })),
          nextSteps: wizardSession.nextSteps,
          blockedSteps: wizardSession.blockedSteps,
          startedAt: wizardSession.startedAt,
          completedAt: wizardSession.completedAt,
          estimatedRemainingMinutes: wizardSession.estimatedRemainingMinutes,
        } : null}
        readiness={readiness ? {
          checks: readiness.checks.map((c) => ({
            domain: c.domain,
            label: c.label,
            status: c.status,
            score: c.score,
            details: c.details,
            suggestions: c.suggestions,
          })),
          overallScore: readiness.overallScore,
          summary: readiness.summary,
          suggestions: readiness.suggestions,
          completedAt: readiness.completedAt,
        } : null}
        summary={summary}
      />
    </div>
  );
}
