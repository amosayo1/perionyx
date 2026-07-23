import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCJournalReviewBoard from "@/components/financial-close/fc-journal-review-board"

export default function FCJournalReviewPage() {
  const journals = fcService.journalReview.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Journal Review" description="Review and approve journal entries for the close period" />
      <FCJournalReviewBoard journals={journals} />
    </PageContainer>
  )
}
