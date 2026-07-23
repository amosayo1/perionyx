import { AlertTriangle, Clock, Zap } from 'lucide-react';

export interface EscalationWarningProps {
  isEscalated: boolean;
  hoursElapsed?: number;
  timeoutHours?: number;
  escalatedReason?: string;
  escalatedTo?: string;
  compact?: boolean;
}

export function EscalationWarning({
  isEscalated,
  hoursElapsed = 0,
  timeoutHours = 24,
  escalatedReason,
  escalatedTo,
  compact = false,
}: EscalationWarningProps) {
  if (!isEscalated && hoursElapsed <= timeoutHours * 0.75) {
    return null;
  }

  const isUrgent = hoursElapsed > timeoutHours * 0.75 && !isEscalated;
  const timeRemaining = Math.max(0, timeoutHours - Math.floor(hoursElapsed));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isEscalated ? (
          <>
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] font-semibold text-red-400 uppercase">Escalated</span>
          </>
        ) : (
          <>
            <Clock className="w-3.5 h-3.5 text-perionyx-gold" />
            <span className="text-[10px] font-semibold text-perionyx-gold uppercase">Urgent - {timeRemaining}h left</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-3 flex items-start gap-3 ${
        isEscalated
          ? 'border-red-600/30 bg-[rgba(139,0,0,0.1)]'
          : 'border-perionyx-gold/30 bg-[rgba(212,175,55,0.08)]'
      }`}
    >
      {isEscalated ? (
        <Zap className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-perionyx-gold mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-perionyx-text-primary">
          {isEscalated ? 'Escalated to Senior Review' : 'Urgent Approval Required'}
        </div>
        <div className="text-xs text-perionyx-text-muted mt-1">
          {isEscalated ? (
            <>
              <p>
                {escalatedReason && (
                  <>
                    <strong>Reason:</strong> {escalatedReason}
                  </>
                )}
              </p>
              {escalatedTo && (
                <p className="mt-1">
                  <strong>Escalated to:</strong> {escalatedTo}
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                <strong>{timeRemaining} hours remaining</strong> before automatic escalation
              </p>
              <p className="mt-1">This approval requires immediate attention to prevent escalation.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
