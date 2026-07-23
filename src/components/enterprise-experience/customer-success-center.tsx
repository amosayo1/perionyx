"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { CustomerSuccessResourceData, FeatureRequestData, SupportTicketData, ResourceType, FeatureRequestStatus, TicketPriority, TicketStatus } from "@/modules/enterprise-experience/types";
import { Search, FileText, Video, Megaphone, BookOpen, HelpCircle, ArrowUp, MessageSquare, Plus, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const resourceIcons: Record<ResourceType, LucideIcon> = {
  documentation: FileText,
  tutorial: Video,
  release_note: Megaphone,
  video: Video,
  guide: BookOpen,
  faq: HelpCircle,
};

const resourceLabels: Record<ResourceType, string> = {
  documentation: "Docs", tutorial: "Tutorial", release_note: "Release Notes",
  video: "Video", guide: "Guide", faq: "FAQ",
};

const requestStatusColors: Record<FeatureRequestStatus, string> = {
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  under_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  planned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  shipped: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
};

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  waiting: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-zinc-600/10 text-zinc-500 border-zinc-600/20",
};

function ResourceCard({ resource }: { resource: CustomerSuccessResourceData }) {
  const Icon = resourceIcons[resource.type] ?? FileText;
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 transition-colors hover:bg-zinc-900/60"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-amber-400" />
        <span className="rounded-full border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-500">
          {resourceLabels[resource.type]}
        </span>
        {resource.roleTarget && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
            {resource.roleTarget}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-white">{resource.title}</p>
      {resource.description && (
        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{resource.description}</p>
      )}
      {resource.tags && resource.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function FeatureRequestItem({ request }: { request: FeatureRequestData }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex flex-col items-center gap-0.5">
        <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-sm font-semibold text-white">{request.votes}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{request.title}</p>
        {request.description && (
          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{request.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", requestStatusColors[request.status])}>
            {request.status.replace("_", " ")}
          </span>
          {request.category && (
            <span className="text-[10px] text-zinc-500">{request.category}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketItem({ ticket }: { ticket: SupportTicketData }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", statusColors[ticket.status])}>
          {ticket.status.replace("_", " ")}
        </span>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", priorityColors[ticket.priority])}>
          {ticket.priority}
        </span>
        {ticket.category && (
          <span className="text-[10px] text-zinc-500">{ticket.category}</span>
        )}
      </div>
      <p className="text-sm font-medium text-white">{ticket.subject}</p>
      {ticket.description && (
        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{ticket.description}</p>
      )}
      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-zinc-500">
        {ticket.assignedTo && <span>Assigned: {ticket.assignedTo}</span>}
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

interface CustomerSuccessCenterProps {
  resources: CustomerSuccessResourceData[];
  featureRequests: FeatureRequestData[];
  tickets: SupportTicketData[];
  onSubmitRequest: (data: { title: string; description?: string }) => void;
  onCreateTicket: (data: { subject: string; description?: string }) => void;
}

type Tab = "resources" | "requests" | "tickets";

export function CustomerSuccessCenter({ resources, featureRequests, tickets, onSubmitRequest, onCreateTicket }: CustomerSuccessCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resources");
  const [search, setSearch] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  const filteredResources = useMemo(() => {
    if (!search) return resources;
    const q = search.toLowerCase();
    return resources.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [resources, search]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "resources", label: "Resources", count: resources.length },
    { id: "requests", label: "Feature Requests", count: featureRequests.length },
    { id: "tickets", label: "Support Tickets", count: tickets.length },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-4 flex items-center gap-1 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-zinc-600">({tab.count})</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "resources" && (
          <motion.div key="resources" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
              {filteredResources.length === 0 && (
                <p className="col-span-full text-sm text-zinc-500">No resources found</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div key="requests" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{featureRequests.length} feature requests</p>
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-500"
              >
                <Plus className="h-4 w-4" />
                Submit Request
              </button>
            </div>
            <AnimatePresence>
              {showRequestForm && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mb-4 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-4"
                >
                  <input
                    type="text"
                    placeholder="Feature title"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="mb-2 w-full rounded-lg border border-white/[0.06] bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={requestDesc}
                    onChange={(e) => setRequestDesc(e.target.value)}
                    rows={3}
                    className="mb-3 w-full rounded-lg border border-white/[0.06] bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onSubmitRequest({ title: requestTitle, description: requestDesc || undefined });
                        setRequestTitle("");
                        setRequestDesc("");
                        setShowRequestForm(false);
                      }}
                      disabled={!requestTitle.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-500 disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              {featureRequests.map((req) => (
                <FeatureRequestItem key={req.id} request={req} />
              ))}
              {featureRequests.length === 0 && (
                <p className="text-sm text-zinc-500">No feature requests yet</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "tickets" && (
          <motion.div key="tickets" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{tickets.length} tickets</p>
              <button
                onClick={() => setShowTicketForm(!showTicketForm)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-500"
              >
                <Plus className="h-4 w-4" />
                Create Ticket
              </button>
            </div>
            <AnimatePresence>
              {showTicketForm && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mb-4 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-4"
                >
                  <input
                    type="text"
                    placeholder="Subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="mb-2 w-full rounded-lg border border-white/[0.06] bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    rows={3}
                    className="mb-3 w-full rounded-lg border border-white/[0.06] bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400/30 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onCreateTicket({ subject: ticketSubject, description: ticketDesc || undefined });
                        setTicketSubject("");
                        setTicketDesc("");
                        setShowTicketForm(false);
                      }}
                      disabled={!ticketSubject.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-500 disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              {tickets.map((t) => (
                <TicketItem key={t.id} ticket={t} />
              ))}
              {tickets.length === 0 && (
                <p className="text-sm text-zinc-500">No support tickets</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
