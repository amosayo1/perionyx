"use client";

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { ConversationSidebar } from "./conversation-sidebar";
import { ConversationMessage } from "./conversation-message";
import { ContextPanel } from "./context-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import type { PersonaRole } from "@/modules/copilot/command-center";

type ConversationSummary = { id: string; title: string; messageCount: number; updatedAt: string; };
type MessageRow = { id: string; role: "user" | "assistant"; content: string; citations: string[]; followUps: string[]; createdAt: string; };

export const ConversationWorkspace = forwardRef<{ createNewConversation: () => void }, { persona?: PersonaRole }>(function ConversationWorkspace({ persona }, ref) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streamContent, setStreamContent] = useState("");
  const [streamFollowUps, setStreamFollowUps] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef(persona);
  personaRef.current = persona;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/copilot/conversations");
      if (!res.ok) return;
      const body = await res.json();
      setConversations(body.items ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  // Listen for copilot:ask custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.text) {
        setInput(detail.text);
        // Auto-send if we have an active conversation
        if (activeId) {
          // Small delay to let the input update
          setTimeout(() => {
            setInput(detail.text);
          }, 50);
        }
      }
    };
    window.addEventListener("copilot:ask", handler);
    return () => window.removeEventListener("copilot:ask", handler);
  }, [activeId]);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/v1/copilot/conversations/${id}`);
      if (!res.ok) return;
      const body = await res.json();
      setMessages(body.messages ?? []);
    } catch { /* ignore */ }
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setMessages([]);
    setStreamContent("");
    fetchMessages(id);
  }, [fetchMessages]);

  // Auto-create conversation if none exists
  const ensureConversation = useCallback(async () => {
    if (activeId) return activeId;
    try {
      const res = await fetch("/api/v1/copilot/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) return null;
      const conv: ConversationSummary = await res.json();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setStreamContent("");
      return conv.id;
    } catch { return null; }
  }, [activeId]);

  const handleNew = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/copilot/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) return;
      const conv: ConversationSummary = await res.json();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setStreamContent("");
    } catch { /* ignore */ }
  }, []);

  useImperativeHandle(ref, () => ({ createNewConversation: handleNew }), [handleNew]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming) return;

    let id = activeId;
    if (!id) {
      id = await ensureConversation();
      if (!id) return;
    }

    const userMessage = input.trim();
    setInput("");
    setStreaming(true);
    setStreamContent("");
    setStreamFollowUps([]);

    const optimistic: MessageRow = { id: `temp-${Date.now()}`, role: "user", content: userMessage, citations: [], followUps: [], createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/v1/copilot/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          persona: personaRef.current,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let buffer = "";
      let savedUserMsg: MessageRow | null = null;
      let savedAssistantMsg: MessageRow | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "delta") {
              setStreamContent((prev) => prev + (parsed.content ?? ""));
            } else if (parsed.type === "done") {
              savedUserMsg = parsed.userMessage;
              savedAssistantMsg = parsed.message;
              if (parsed.message?.followUps) {
                setStreamFollowUps(parsed.message.followUps);
              }
            } else if (parsed.type === "error") {
              console.error("Copilot error:", parsed.message);
            }
          } catch { /* skip */ }
        }
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith("temp-"));
        if (savedUserMsg) filtered.push(savedUserMsg);
        if (savedAssistantMsg) filtered.push(savedAssistantMsg);
        return filtered;
      });
      setStreamContent("");
      fetchConversations();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Send error:", err);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, activeId, streaming, fetchConversations, ensureConversation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFollowUp = (text: string) => {
    setInput(text);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/30 overflow-hidden">
      <div className="hidden md:grid md:grid-cols-[200px_1fr] min-h-[600px]">
        <div className="border-r border-white/[0.06] p-3">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId ?? undefined}
            onSelect={handleSelect}
            onNew={handleNew}
            loading={loading}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] max-h-[700px]">
            {!activeId ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                  <Send className="h-5 w-5 text-gold" />
                </div>
                <p className="text-sm font-medium text-zinc-400 mb-1">No conversation selected</p>
                <p className="text-xs text-zinc-600">Select a conversation, start a new one, or ask a question</p>
              </div>
            ) : messages.length === 0 && !streaming ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-sm text-zinc-500">Ask a question to begin your intelligence session</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <ConversationMessage
                    key={m.id}
                    message={m}
                    isLast={i === messages.length - 1 && !streaming}
                    onFollowUp={handleFollowUp}
                  />
                ))}
                {streaming && (
                  <ConversationMessage
                    message={{
                      id: "streaming",
                      role: "assistant",
                      content: streamContent || "Thinking...",
                      citations: [],
                      followUps: streamFollowUps,
                      createdAt: new Date().toISOString(),
                    }}
                    isLast={true}
                    streaming={true}
                    onFollowUp={handleFollowUp}
                  />
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="px-4 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeId ? "Ask PERIONYX Intelligence..." : "Type a question to start..."}
                disabled={streaming}
                className="flex-1 border-white/[0.06] bg-zinc-900/60 text-sm text-white placeholder:text-zinc-600 disabled:opacity-50"
              />
              <Button
                variant="default"
                size="sm"
                disabled={streaming || !input.trim()}
                onClick={handleSend}
                className="h-9 w-9 rounded-lg bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 flex items-center justify-center disabled:opacity-50"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[480px]">
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] max-h-[500px]">
          {!activeId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-sm font-medium text-zinc-400 mb-1">PERIONYX Intelligence</p>
              <p className="text-xs text-zinc-600">Tap below to start</p>
            </div>
          ) : messages.length === 0 && !streaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-sm text-zinc-500">Ask a question to begin</p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <ConversationMessage
                  key={m.id}
                  message={m}
                  isLast={i === messages.length - 1 && !streaming}
                  onFollowUp={handleFollowUp}
                />
              ))}
              {streaming && (
                <ConversationMessage
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamContent || "Thinking...",
                    citations: [],
                    followUps: streamFollowUps,
                    createdAt: new Date().toISOString(),
                  }}
                  isLast={true}
                  streaming={true}
                  onFollowUp={handleFollowUp}
                />
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={streaming}
              className="flex-1 border-white/[0.06] bg-zinc-900/60 text-sm text-white placeholder:text-zinc-600 disabled:opacity-50"
            />
            <Button
              variant="default"
              size="sm"
              disabled={streaming || !input.trim()}
              onClick={handleSend}
              className="h-9 w-9 rounded-lg bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 flex items-center justify-center disabled:opacity-50"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
