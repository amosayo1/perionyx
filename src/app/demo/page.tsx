import { DemoProvider } from "@/components/demo/demo-provider";
import { DemoLayout } from "@/components/demo/demo-layout";
import { Step1PaymentRequest } from "@/components/demo/step-1-payment-request";
import { Step2PolicyEngine } from "@/components/demo/step-2-policy-engine";
import { Step3ApprovalWorkflow } from "@/components/demo/step-3-approval-workflow";
import { Step4CfoReview } from "@/components/demo/step-4-cfo-review";
import { Step5LedgerPosting } from "@/components/demo/step-5-ledger-posting";
import { Step6TreasuryExecution } from "@/components/demo/step-6-treasury-execution";
import { Step7AuditTrail } from "@/components/demo/step-7-audit-trail";
import { Step8DashboardUpdated } from "@/components/demo/step-8-dashboard-updated";
import { StepFinal } from "@/components/demo/step-final";
import { DemoStepRenderer } from "@/components/demo/demo-step-renderer";

export default function DemoPage() {
  return (
    <DemoProvider>
      <DemoLayout>
        <DemoStepRenderer
          steps={{
            1: <Step1PaymentRequest />,
            2: <Step2PolicyEngine />,
            3: <Step3ApprovalWorkflow />,
            4: <Step4CfoReview />,
            5: <Step5LedgerPosting />,
            6: <Step6TreasuryExecution />,
            7: <Step7AuditTrail />,
            8: <Step8DashboardUpdated />,
            9: <StepFinal />,
          }}
        />
      </DemoLayout>
    </DemoProvider>
  );
}
