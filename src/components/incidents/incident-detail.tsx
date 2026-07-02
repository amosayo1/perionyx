"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IncidentSeverityBadge } from "./incident-severity-badge";
import { IncidentStatusBadge } from "./incident-status-badge";
import { IncidentSlaCard } from "./incident-sla-card";
import { IncidentOwnerCard } from "./incident-owner-card";
import { IncidentResolutionCard } from "./incident-resolution-card";
import { IncidentTimeline } from "./incident-timeline";
import { IncidentLinkedRecords } from "./incident-linked-records";
import { IncidentSummary } from "./incident-summary";
import { IncidentActions } from "./incident-actions";
import type { Incident } from "./types";

export function IncidentDetailPage({ incident }: { incident: Incident }) {

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Link href="/operations" className="hover:text-zinc-400 transition-colors">
            Operations
          </Link>
          <span>/</span>
          <Link href="/operations/incidents" className="hover:text-zinc-400 transition-colors">
            Incidents
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{incident.id}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <Link href="/operations/incidents">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {incident.id}
            </h1>
            <IncidentSeverityBadge severity={incident.severity} />
            <IncidentStatusBadge status={incident.status} />
            {incident.priority === "P1" && (
              <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                <AlertTriangle className="h-3 w-3" />
                P1
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-300 max-w-2xl">{incident.title}</p>
        </div>
        <IncidentActions />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left — Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="linked">Linked Records</TabsTrigger>
              <TabsTrigger value="resolution">Resolution</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <IncidentSummary incident={incident} />
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <IncidentTimeline incidentId={incident.id} />
              </div>
            </TabsContent>
            <TabsContent value="linked" className="mt-4">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <IncidentLinkedRecords incident={incident} />
              </div>
            </TabsContent>
            <TabsContent value="resolution" className="mt-4">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <IncidentResolutionCard incident={incident} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-4">
          {/* SLA Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              SLA Status
            </h3>
            <IncidentSlaCard incident={incident} />
          </div>

          {/* Owner Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Ownership
            </h3>
            <IncidentOwnerCard incident={incident} />
          </div>
        </div>
      </div>
    </div>
  );
}
