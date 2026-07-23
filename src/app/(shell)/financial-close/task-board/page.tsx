import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCTaskBoard from "@/components/financial-close/fc-task-board"

export default function FCTaskBoardPage() {
  const tasks = fcService.taskEngine.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Task Board" description="Kanban-style view of close tasks by status" />
      <FCTaskBoard tasks={tasks} />
    </PageContainer>
  )
}
