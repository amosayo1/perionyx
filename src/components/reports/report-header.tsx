"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateCard } from "./template-card";
import { ReportBuilderDialog } from "./report-builder-dialog";
import { ExportButton } from "@/components/export/ExportButton";
import { reportTemplates } from "./data";
import type { ReportTemplate } from "./types";

const dateRangeOptions = ["This Month", "Last Month", "This Quarter", "This Year"];

export function ReportHeader() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [scheduled, setScheduled] = useState(false);
  const [dateRangeIdx, setDateRangeIdx] = useState(0);

  const handleCreate = useCallback(() => {
    setTemplateDialogOpen(true);
  }, []);

  const handleSelectTemplate = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(false);
    setBuilderOpen(true);
  }, []);

  const toggleSchedule = useCallback(() => {
    setScheduled((prev) => {
      const next = !prev;
      if (next) {
        toast.success("Report scheduled — weekly delivery every Monday at 8:00 AM");
      } else {
        toast.info("Schedule cancelled");
      }
      return next;
    });
  }, []);

  const cycleDateRange = useCallback(() => {
    setDateRangeIdx((prev) => {
      const next = (prev + 1) % dateRangeOptions.length;
      toast.info(`Date range: ${dateRangeOptions[next]}`);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Generate, schedule, and export enterprise treasury reports.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 hover:bg-[#d4af37]/20"
          onClick={handleCreate}
        >
          <Plus className="h-3.5 w-3.5" />
          Create Report
        </Button>
        <Button
          variant={scheduled ? "default" : "outline"}
          size="sm"
          className="gap-1.5 text-xs"
          onClick={toggleSchedule}
        >
          {scheduled ? <CheckCircle2 className="h-3.5 w-3.5 text-[#d4af37]" /> : <Clock className="h-3.5 w-3.5" />}
          {scheduled ? "Scheduled" : "Schedule"}
        </Button>
        <ExportButton type="reports" label="Export" size="sm" />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={cycleDateRange}>
          <Calendar className="h-3.5 w-3.5" />
          {dateRangeOptions[dateRangeIdx]}
        </Button>
      </div>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a New Report</DialogTitle>
            <DialogDescription>Choose a template to get started. You can customize everything later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {reportTemplates.map((tmpl) => (
              <TemplateCard key={tmpl.id} template={tmpl} onSelect={handleSelectTemplate} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ReportBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        template={selectedTemplate}
      />
    </div>
  );
}
