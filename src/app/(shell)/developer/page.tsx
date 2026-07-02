import { DeveloperLayout } from "@/components/developer/developer-layout";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { DeveloperOverview } from "@/components/developer/developer-overview";
import { ApiOverview } from "@/components/developer/api-overview";
import { SdkCenter } from "@/components/developer/sdk-center";
import { AuthenticationMethods } from "@/components/developer/authentication-methods";
import { WebhookOverview } from "@/components/developer/webhook-overview";
import { SandboxEnvironment } from "@/components/developer/sandbox-environment";
import { DeveloperResources } from "@/components/developer/developer-resources";
import { QuickNavigation } from "@/components/developer/quick-navigation";

export default function DeveloperPage() {
  return (
    <DeveloperLayout>
      <DeveloperHeader />
      <DeveloperOverview />
      <ApiOverview />
      <SdkCenter />
      <AuthenticationMethods />
      <WebhookOverview />
      <SandboxEnvironment />
      <DeveloperResources />
      <QuickNavigation />
    </DeveloperLayout>
  );
}
