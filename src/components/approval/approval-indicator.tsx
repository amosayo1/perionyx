'use client';

import { Clock, AlertCircle } from 'lucide-react';

export interface ApprovalIndicatorProps {
  pendingCount: number;
  requiredCount: number;
  isEscalated?: boolean;
  hoursElapsed?: number;
  timeoutHours?: number;
}

export function ApprovalIndicator({
  pendingCount,
  requiredCount,
  isEscalated = false,
  hoursElapsed = 0,
  timeoutHours = 24,
}: ApprovalIndicatorProps) {
  const isUrgent = hoursElapsed > (timeoutHours * 0.75);
  const percentComplete = ((requiredCount - pendingCount) / requiredCount) * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden border border-[rgba(255,255,255,0.08)]">
            <div
              className={`h-full transition-all duration-300 ${
                percentComplete === 100
                  ? 'bg-gradient-to-r from-green-600 to-green-400'
                  : isEscalated
                    ? 'bg-gradient-to-r from-red-600 to-red-400'
                    : 'bg-gradient-to-r from-perionyx-gold to-yellow-300'
              }`}
              style={{ width: `${Math.min(percentComplete, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-xs font-bold text-perionyx-text-primary">
            {requiredCount - pendingCount}/{requiredCount}
          </span>
          {isEscalated && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
          {isUrgent && !isEscalated && <Clock className="w-3.5 h-3.5 text-perionyx-gold" />}
        </div>
      </div>

      {/* Pending count display */}
      {pendingCount > 0 && (
        <div className="text-[10px] text-perionyx-text-muted">
          <span className={isEscalated ? 'text-red-400' : isUrgent ? 'text-perionyx-gold' : ''}>
            {pendingCount} approval{pendingCount !== 1 ? 's' : ''} pending
          </span>
          {timeoutHours && (
            <span className="text-[9px] ml-2">
              • {timeoutHours - Math.floor(hoursElapsed)}h remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
}
