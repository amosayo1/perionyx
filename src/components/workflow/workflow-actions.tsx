"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpCircle,
  PauseCircle,
  PlayCircle,
  UserCog,
  UserPlus,
  FileText,
  MessageSquare,
  Loader2,
  SendHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  body: string;
  author: string;
  timestamp: string;
  type: "note" | "comment" | "document-request";
};

interface Props {
  transactionId: string;
  canEscalate: boolean;
  isPaused: boolean;
  onEscalate?: () => Promise<void>;
  onAddNote?: (body: string) => Promise<void>;
  onRequestDocument?: (description: string) => Promise<void>;
  notes: Note[];
  compact?: boolean;
}

export function WorkflowActions({
  transactionId,
  canEscalate,
  isPaused,
  onEscalate,
  onAddNote,
  onRequestDocument,
  notes,
  compact = false,
}: Props) {
  const [escalating, setEscalating] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [docOpen, setDocOpen] = useState(false);
  const [docDesc, setDocDesc] = useState("");

  const handleEscalate = async () => {
    if (!onEscalate) return;
    setEscalating(true);
    try {
      await onEscalate();
    } finally {
      setEscalating(false);
    }
  };

  const handleAddNote = async () => {
    if (!onAddNote || !noteBody.trim()) return;
    await onAddNote(noteBody.trim());
    setNoteBody("");
    setNoteOpen(false);
  };

  const handleRequestDocument = async () => {
    if (!onRequestDocument || !docDesc.trim()) return;
    await onRequestDocument(docDesc.trim());
    setDocDesc("");
    setDocOpen(false);
  };

  const recentNotes = notes.slice(-3).reverse();

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className={cn("flex flex-wrap gap-2", compact && "flex-col")}>
        {/* Escalate */}
        {canEscalate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleEscalate()}
            disabled={escalating}
            className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            {escalating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUpCircle className="h-3.5 w-3.5" />
            )}
            Escalate
          </Button>
        )}

        {/* Pause/Resume (frontend-only toggle) */}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="gap-1.5 text-zinc-500 opacity-50 cursor-not-allowed"
          title="Pause/resume not available"
        >
          {isPaused ? (
            <PlayCircle className="h-3.5 w-3.5" />
          ) : (
            <PauseCircle className="h-3.5 w-3.5" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </Button>

        {/* Reassign (placeholder) */}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="gap-1.5 text-zinc-500 opacity-50 cursor-not-allowed"
          title="Reassign not available"
        >
          <UserCog className="h-3.5 w-3.5" />
          Reassign
        </Button>

        {/* Delegate (placeholder) */}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="gap-1.5 text-zinc-500 opacity-50 cursor-not-allowed"
          title="Delegate not available"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Delegate
        </Button>

        {/* Request Documents */}
        {onRequestDocument && (
          <Dialog open={docOpen} onOpenChange={setDocOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-zinc-400 hover:text-white">
                <FileText className="h-3.5 w-3.5" />
                Request Docs
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Additional Documents</DialogTitle>
                <DialogDescription>Describe what documents are needed to proceed with this workflow.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="doc-desc">Document description</Label>
                <textarea
                  id="doc-desc"
                  rows={3}
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  placeholder="e.g. Signed PO, invoice copy, bank confirmation..."
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDocOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleRequestDocument()} disabled={!docDesc.trim()}>
                  <SendHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Note */}
        {onAddNote && (
          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-zinc-400 hover:text-white">
                <MessageSquare className="h-3.5 w-3.5" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Internal Note</DialogTitle>
                <DialogDescription>This note is visible to all participants in the workflow.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="note-body">Note</Label>
                <textarea
                  id="note-body"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Type your note..."
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleAddNote()} disabled={!noteBody.trim()}>
                  <SendHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Add Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Recent notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-1.5">
          {recentNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-white/[0.04] bg-zinc-900/30 px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {note.type === "document-request" ? (
                    <FileText className="h-3 w-3 text-amber-400" />
                  ) : (
                    <MessageSquare className="h-3 w-3 text-zinc-500" />
                  )}
                  <span className="text-[10px] font-medium text-zinc-400">{note.author}</span>
                </div>
                <span className="text-[10px] text-zinc-600">{note.timestamp}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{note.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
