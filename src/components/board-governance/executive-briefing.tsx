"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Calendar, CheckCircle, BarChart3, Shield, Scale, Target,
  Clock, AlertTriangle, TrendingUp,
} from "lucide-react";

interface BriefingSection {
  title: string;
  type: "meeting-preview" | "actions" | "financial" | "audit" | "compliance" | "tax" | "strategic";
  items: { id: string; title: string; status?: string; summary: string; metric?: string }[];
}

export function ExecutiveBriefing() {
  const [sections, setSections] = useState<BriefingSection[]>([]);
  const [briefingDate, setBriefingDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/briefings/latest").then((r) => (r.ok ? r.json() : null));
        if (res) {
          setSections(res.sections ?? []);
          setBriefingDate(res.date ?? "");
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultSections: BriefingSection[] = [
    {
      title: "Meeting Preview", type: "meeting-preview",
      items: [
        { id: "1", title: "Q2 2026 Board Meeting", summary: "Scheduled for July 25. 8 agenda items, 2 resolutions requiring vote.", metric: "July 25, 09:00" },
        { id: "2", title: "Pre-read Materials", summary: "Board pack distributed. 7 sections, 41 pages total. All sections approved.", metric: "7 sections" },
      ],
    },
    {
      title: "Action Items Status", type: "actions",
      items: [
        { id: "3", title: "Circulate budget presentation", summary: "Assigned to CFO. Due July 22.", status: "in-progress" },
        { id: "4", title: "Prepare audit findings report", summary: "Internal Audit. Due July 23.", status: "completed" },
        { id: "5", title: "Update risk register for board review", summary: "CRO. Due July 24.", status: "in-progress" },
        { id: "6", title: "Finalize compensation benchmarking", summary: "Compensation Chair. Due July 30.", status: "pending" },
      ],
    },
    {
      title: "Financial Highlights", type: "financial",
      items: [
        { id: "7", title: "Revenue YTD", summary: "$142M actual vs $138M budget. 2.9% favorable variance.", metric: "$142M" },
        { id: "8", title: "Operating Margin", summary: "18.2% vs 17.5% target. Improved by cost optimization initiatives.", metric: "18.2%" },
        { id: "9", title: "Cash Position", summary: "$67M unrestricted. Strong liquidity coverage at 2.4x.", metric: "$67M" },
      ],
    },
    {
      title: "Audit Highlights", type: "audit",
      items: [
        { id: "10", title: "Internal Audit Findings", summary: "2 critical, 5 high, 12 medium findings from Q2 audit cycle.", metric: "2 critical" },
        { id: "11", title: "Remediation Progress", summary: "78% of prior quarter findings remediated. 3 items pending.", metric: "78% remediated" },
      ],
    },
    {
      title: "Compliance Highlights", type: "compliance",
      items: [
        { id: "12", title: "SOX Compliance", summary: "All key controls operating effectively. 1 exception noted in IT general controls.", metric: "98% compliant" },
        { id: "13", title: "Regulatory Updates", summary: "New SEC disclosure requirements effective Q3. Assessment in progress.", status: "in-progress" },
      ],
    },
    {
      title: "Tax Highlights", type: "tax",
      items: [
        { id: "14", title: "Effective Tax Rate", summary: "21.4% YTD vs 22.0% budget. Favorable due to R&D credits.", metric: "21.4%" },
        { id: "15", title: "Transfer Pricing", summary: "DE-SG intercompany margin review pending. Risk assessment in progress.", status: "in-progress" },
      ],
    },
    {
      title: "Strategic Highlights", type: "strategic",
      items: [
        { id: "16", title: "Market Expansion", summary: "APAC revenue growing 34% YoY. Singapore hub fully operational.", metric: "+34% YoY" },
        { id: "17", title: "Digital Transformation", summary: "Platform modernization on track. Phase 2 delivery on schedule.", status: "on-track" },
        { id: "18", title: "ESG Progress", summary: "Carbon neutral certification achieved. Diversity targets at 85% of goal.", metric: "Carbon neutral" },
      ],
    },
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;
  const date = briefingDate || new Date().toISOString().split("T")[0];

  const sectionIcons: Record<string, typeof FileText> = {
    "meeting-preview": Calendar, actions: CheckCircle, financial: BarChart3,
    audit: Shield, compliance: Shield, tax: Scale, strategic: Target,
  };

  const sectionColors: Record<string, string> = {
    "meeting-preview": "text-blue-400 bg-blue-500/10",
    actions: "text-amber-400 bg-amber-500/10",
    financial: "text-emerald-400 bg-emerald-500/10",
    audit: "text-orange-400 bg-orange-500/10",
    compliance: "text-purple-400 bg-purple-500/10",
    tax: "text-rose-400 bg-rose-500/10",
    strategic: "text-gold-500 bg-gold-500/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Board Briefing</h1>
          <p className="text-sm text-white/60 mt-1">Comprehensive briefing for upcoming board meeting</p>
        </div>
        <div className="text-sm text-white/40">Briefing date: {date}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Action Items", value: "4", detail: "1 completed, 2 in-progress, 1 pending", color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Resolutions", value: "2", detail: "Requiring board vote", color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Compliance", value: "98%", detail: "SOX control effectiveness", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Governance Score", value: "92%", detail: "Above 90% threshold", color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <FileText className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/50 mt-1">{s.label}</div>
            <div className="text-[10px] text-white/50 mt-0.5">{s.detail}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {displaySections.map((section, si) => {
          const Icon = sectionIcons[section.type] || FileText;
          const colorClass = sectionColors[section.type] || "text-white/50 bg-white/5";

          return (
            <motion.div key={section.type} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{item.title}</div>
                      <p className="text-xs text-white/50 mt-1">{item.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.metric && (
                        <span className="text-sm font-medium text-gold-500">{item.metric}</span>
                      )}
                      {item.status && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          item.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          item.status === "in-progress" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          item.status === "on-track" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}>{item.status.toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
