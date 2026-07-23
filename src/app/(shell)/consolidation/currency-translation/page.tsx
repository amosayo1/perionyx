import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsCurrencyTranslation from "@/components/consolidation/cons-currency-translation"
import ConsFXExposure from "@/components/consolidation/cons-fx-exposure"

export default function CurrencyTranslationPage() {
  const translations = consService.currencyTranslation.getAll()
  const entities = consService.entityManagement.getAll()
  const exposures = consService.analytics.generateFXExposureReport(entities, translations)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Currency Translation" description="Foreign currency translation, rates, and FX exposure management" />
      <ConsCurrencyTranslation translations={translations} />
      <ConsFXExposure exposures={exposures} />
    </PageContainer>
  )
}
