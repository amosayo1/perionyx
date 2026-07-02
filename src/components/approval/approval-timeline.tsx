'use client';

import { CheckCircle2, XCircle, Clock, AlertCircle, User } from 'lucide-react';

export interface ApprovalTimelineEvent {
  id: string;
  type: 'requested' | 'approved' | 'rejected' | 'escalated';
  actor: string;
  actorRole?: string;
  timestamp: string;
  message?: string;
  reason?: string;
}

export interface ApprovalTimelineProps {
  events: ApprovalTimelineEvent[];
  compact?: boolean;
}

export function ApprovalTimeline({ events, compact = false }: ApprovalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'escalated':
        return <AlertCircle className="w-5 h-5 text-perionyx-gold" />;
      default:
        return <Clock className="w-5 h-5 text-perionyx-text-muted" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'escalated':
        return 'Escalated';
      default:
        return 'Requested';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'escalated':
        return 'text-perionyx-gold';
      default:
        return 'text-perionyx-text-muted';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {events.map((event, idx) => (
          <div key={event.id} className="flex items-start gap-2">
            <div className={`mt-1 flex-shrink-0 ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-perionyx-text-primary">
                <span className={getEventColor(event.type)}>{getEventLabel(event.type)}</span>
                {' by '}
                <span className="text-perionyx-text-primary">{event.actor}</span>
              </div>
              <div className="text-[10px] text-perionyx-text-muted">{event.timestamp}</div>
              {event.reason && (
                <div className="text-[10px] text-perionyx-text-muted mt-0.5 italic">{event.reason}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="relative">
          {/* Vertical line connector */}
          {idx < events.length - 1 && (
            <div className="absolute top-12 left-2.5 w-0.5 h-8 bg-[rgba(212,175,55,0.2)]" />
          )}

          <div className="flex gap-4">
            {/* Event icon */}
            <div className="relative pt-1 flex-shrink-0">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center">
                <div className={getEventColor(event.type)}>{getEventIcon(event.type)}</div>
              </div>
            </div>

            {/* Event content */}
            <div className="pb-6 pt-1 flex-1">
              <div className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.04)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-perionyx-text-primary">
                      {getEventLabel(event.type)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-perionyx-text-muted" />
                      <span className="text-xs text-perionyx-text-muted">
                        {event.actor}
                        {event.actorRole && ` (${event.actorRole})`}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-perionyx-text-muted whitespace-nowrap">
                    {event.timestamp}
                  </div>
                </div>
                {event.message && (
                  <div className="text-xs text-perionyx-text-primary mt-2">{event.message}</div>
                )}
                {event.reason && (
                  <div className="text-xs text-[#f5b3b3] mt-2 border-l-2 border-red-600 pl-2">
                    <strong>Reason:</strong> {event.reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
