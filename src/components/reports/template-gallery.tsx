"use client";

import { useState, useCallback } from "react";
import { reportTemplates } from "./data";
import { TemplateCard } from "./template-card";
import { ReportBuilderDialog } from "./report-builder-dialog";
import type { ReportTemplate } from "./types";

export function TemplateGallery({ onSelectTemplate }: { onSelectTemplate?: (template: ReportTemplate) => void }) {
  const [localBuilderOpen, setLocalBuilderOpen] = useState(false);
  const [localTemplate, setLocalTemplate] = useState<ReportTemplate | null>(null);

  const handleSelect = useCallback((template: ReportTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      setLocalTemplate(template);
      setLocalBuilderOpen(true);
    }
  }, [onSelectTemplate]);

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Template Gallery</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Start with a pre-built template for common reporting needs</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reportTemplates.map((tmpl) => (
            <TemplateCard key={tmpl.id} template={tmpl} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      <ReportBuilderDialog
        open={localBuilderOpen}
        onOpenChange={setLocalBuilderOpen}
        template={localTemplate}
      />
    </>
  );
}
