import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { TaxFilters } from "../../../../components/tax/tax-filters";
import { JurisdictionRegistry } from "../../../../components/tax/jurisdiction-registry";

export default async function JurisdictionsPage() {
  const jurisdictions = taxService.jurisdictions.getAllJurisdictions();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Jurisdictions" description="Tax jurisdiction registry and authority management" />
      <TaxFilters />
      <JurisdictionRegistry jurisdictions={jurisdictions} />
    </PageContainer>
  );
}
