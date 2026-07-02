import { ReportLayout } from "@/components/reports/report-layout";
import { ReportHeader } from "@/components/reports/report-header";
import { ReportDashboard } from "@/components/reports/report-dashboard";
import { ReportLibrary } from "@/components/reports/report-library";
import { ReportBuilder } from "@/components/reports/report-builder";
import { ScheduledReports } from "@/components/reports/scheduled-reports";
import { ExportCenter } from "@/components/reports/export-center";
import { SavedReports } from "@/components/reports/saved-reports";
import { TemplateGallery } from "@/components/reports/template-gallery";
import { QuickNavigation } from "@/components/reports/quick-navigation";

export default function ReportsPage() {
  return (
    <ReportLayout>
      <ReportHeader />
      <ReportDashboard />
      <ReportLibrary />
      <ReportBuilder />
      <div className="grid gap-8 lg:grid-cols-2">
        <ScheduledReports />
        <ExportCenter />
      </div>
      <SavedReports />
      <TemplateGallery />
      <QuickNavigation />
    </ReportLayout>
  );
}
