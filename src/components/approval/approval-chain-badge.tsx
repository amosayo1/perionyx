import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ApprovalStep {
  stepNumber: number;
  roleRequired: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface ApprovalChainBadgeProps {
  steps: ApprovalStep[];
  compact?: boolean;
  maxStepsShown?: number;
}

export function ApprovalChainBadge({
  steps,
  compact = false,
  maxStepsShown = 3,
}: ApprovalChainBadgeProps) {
  const displaySteps = steps.slice(0, maxStepsShown);
  const hasMore = steps.length > maxStepsShown;

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {displaySteps.map((step, idx) => (
          <div key={step.stepNumber} className="flex items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                step.status === 'approved'
                  ? 'bg-[rgba(46,125,94,0.2)] border-green-600 text-green-400'
                  : step.status === 'rejected'
                    ? 'bg-[rgba(93,32,32,0.2)] border-red-600 text-red-400'
                    : 'bg-[rgba(212,175,55,0.12)] border-perionyx-gold text-perionyx-gold'
              }`}
            >
              {step.stepNumber}
            </div>
            {idx < displaySteps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-perionyx-text-muted" />
            )}
          </div>
        ))}
        {hasMore && (
          <span className="text-[10px] text-perionyx-text-muted ml-1">
            +{steps.length - maxStepsShown} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displaySteps.map((step) => (
        <div key={step.stepNumber} className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full border-2 flex-shrink-0 ${
              step.status === 'approved'
                ? 'bg-[rgba(46,125,94,0.2)] border-green-600'
                : step.status === 'rejected'
                  ? 'bg-[rgba(93,32,32,0.2)] border-red-600'
                  : 'bg-[rgba(212,175,55,0.12)] border-perionyx-gold'
            }`}
          >
            {step.status === 'approved' ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : step.status === 'rejected' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <span className="text-xs font-bold text-perionyx-gold">{step.stepNumber}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">
              {step.roleRequired}
            </div>
            {step.approvedBy && step.approvedAt && (
              <div className="text-xs text-perionyx-text-muted">
                Approved by {step.approvedBy} on {step.approvedAt}
              </div>
            )}
          </div>
          <Badge
            variant={
              step.status === 'approved'
                ? 'success'
                : step.status === 'rejected'
                  ? 'danger'
                  : 'warning'
            }
            className="flex-shrink-0"
          >
            {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✕' : '●'}
          </Badge>
        </div>
      ))}
    </div>
  );
}
