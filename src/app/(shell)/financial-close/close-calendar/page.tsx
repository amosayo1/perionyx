import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCCalendar from "@/components/financial-close/fc-calendar"

export default function FCCloseCalendarPage() {
  const entries = fcService.closeCalendar.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Close Calendar" description="Upcoming close deadlines, meetings, and reviews" />
      <FCCalendar entries={entries} />
    </PageContainer>
  )
}
