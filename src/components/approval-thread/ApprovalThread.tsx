"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";

type Comment = {
  id: string;
  body: string;
  mentions: string[];
  createdAt: string;
  author: { id: string; name: string | null; email: string };
};

type Participant = {
  userId: string;
  user: { id: string; name: string | null; email: string };
};

type Thread = {
  id: string;
  comments: Comment[];
  participants: Participant[];
} | null;

interface Props {
  transactionId: string;
}

export function ApprovalThread({ transactionId }: Props) {
  const [thread, setThread] = useState<Thread>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchThread = (signal: AbortSignal) => {
    fetch(`/api/v1/transactions/${transactionId}/thread`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.thread) setThread(data.thread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchThread(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/v1/transactions/${transactionId}/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.comment) {
          setThread((prev) => {
            if (!prev) return prev;
            return { ...prev, comments: [...prev.comments, data.comment] };
          });
          setText("");
          setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 100);
        }
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Approval discussion</CardTitle>
          <CardDescription>Discuss and approve this transaction.</CardDescription>
        </div>
        {thread && (
          <span className="rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] px-2.5 py-0.5 text-xs text-perionyx-gold">
            {thread.comments.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-perionyx-text-muted" />
          </div>
        ) : thread ? (
          <>
            <div
              ref={listRef}
              className="max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin"
            >
              {thread.comments.length === 0 ? (
                <p className="py-6 text-center text-sm text-perionyx-text-muted">No comments yet.</p>
              ) : (
                thread.comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-perionyx-text-muted">
                      <span className="font-medium text-perionyx-text-primary">
                        {c.author.name ?? c.author.email}
                      </span>
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-perionyx-text-primary">
                      {c.body.split(/(@\w+)/).map((part, i) =>
                        part.startsWith("@") ? (
                          <span key={i} className="font-semibold text-perionyx-gold">{part}</span>
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>
            {thread.participants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 text-xs text-perionyx-text-muted">
                <MessageSquare className="mr-1 h-3 w-3" />
                {thread.participants.map((p) => (
                  <span
                    key={p.userId}
                    className="rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-0.5"
                  >
                    {p.user.name ?? p.user.email}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-start gap-2">
              <Textarea
                placeholder="Add a comment... Use @TREASURER, @ADMIN, etc. to notify."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[60px] resize-none border-[rgba(212,175,55,0.2)] bg-perionyx-bg-card text-sm text-perionyx-text-primary placeholder:text-perionyx-text-muted"
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!text.trim() || sending}
                className="mt-1 shrink-0 rounded-xl bg-perionyx-gold text-perionyx-bg-card hover:bg-perionyx-gold-light"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-perionyx-text-muted">Start the approval discussion.</p>
            <div className="flex items-start gap-2 flex-1 max-w-md">
              <Textarea
                placeholder="Add a comment... Use @TREASURER, @ADMIN, etc. to notify."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[60px] resize-none border-[rgba(212,175,55,0.2)] bg-perionyx-bg-card text-sm text-perionyx-text-primary placeholder:text-perionyx-text-muted"
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!text.trim() || sending}
                className="mt-1 shrink-0 rounded-xl bg-perionyx-gold text-perionyx-bg-card hover:bg-perionyx-gold-light"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
