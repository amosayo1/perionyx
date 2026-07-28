import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { OnboardingService } from "@/modules/onboarding";
import { EnterpriseReadinessService } from "@/modules/onboarding/enterprise-readiness.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function OnboardingSetupPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    const onboardingService = new OnboardingService();
    const sessionByCompany = onboardingService.getSessionByCompany(ctx.tenant.companyId);
  
    const wizardSession = sessionByCompany
      ? onboardingService.getProgress(sessionByCompany.id)
      : null;
  
    const readinessService = new EnterpriseReadinessService();
    const readiness = await readinessService.evaluate(ctx.tenant).catch(() => null);
  
    const summary = onboardingService.getSummary(ctx.tenant.companyId);
  
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
  });
}
