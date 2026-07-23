"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: string;
  icon?: React.ReactNode;
}

interface TimelineCardProps {
  title: string;
  description?: string;
  events: TimelineEvent[];
  className?: string;
}

export function TimelineCard({ title, description, events, className }: TimelineCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 py-0">
        {events.length === 0 ? (
          <div className="flex items-center justify-center px-6 py-8 text-sm text-zinc-500">
            No events recorded
          </div>
        ) : (
          <ol className="relative ml-4 border-l border-white/[0.06]">
            {events.map((event, i) => (
              <li key={event.id} className={cn("ml-6", i < events.length - 1 ? "pb-6" : "pb-4")}>
                <span className="absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.06] bg-zinc-900">
                  {event.icon ?? <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />}
                </span>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    {event.description && (
                      <p className="mt-0.5 text-xs text-zinc-400">{event.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <time className="text-xs text-zinc-500">
                        {formatDateTime(event.timestamp)}
                      </time>
                    </div>
                  </div>
                  {event.status && (
                    <Badge variant={event.status === "COMPLETED" || event.status === "SUCCESS" ? "success" : event.status === "FAILED" ? "danger" : "default"}>
                      {event.status}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
