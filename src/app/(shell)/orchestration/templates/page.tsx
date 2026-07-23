"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowTemplateCard } from "@/components/orchestration/workflow-template-card";
import type { WorkflowTemplateData } from "@/modules/orchestration";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplateData[]>([]);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = category ? `?category=${category}` : "";
    fetch(`/api/v1/orchestration/templates${params}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.items ?? []))
      .catch(() => {});
  }, [category]);

  const instantiate = async (tmpl: WorkflowTemplateData) => {
    const name = prompt(`Name for new workflow from "${tmpl.name}":`, tmpl.name);
    if (!name) return;
    const res = await fetch(`/api/v1/orchestration/templates/${tmpl.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setMessage(`Workflow "${name}" created from template`);
    } else {
      setMessage("Failed to create workflow from template");
    }
  };

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Workflow Templates" description="Pre-built workflow templates for common financial processes" />

      {message && (
        <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-4 py-2 text-sm text-amber-400">{message}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory("")} className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${!category ? "border-amber-400/30 bg-amber-400/10 text-amber-400" : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"}`}>All</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${category === c ? "border-amber-400/30 bg-amber-400/10 text-amber-400" : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"}`}>{c.replace("-", " ")}</button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tmpl) => (
          <WorkflowTemplateCard key={tmpl.id} template={tmpl} onInstantiate={instantiate} />
        ))}
      </div>
    </PageContainer>
  );
}
