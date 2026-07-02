'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, User } from 'lucide-react';

export interface PendingApproval {
  id: string;
  role: string;
  approvalsNeeded: number;
  approvalsReceived: number;
  oldestPendingHours: number;
}

export interface ApprovalBottlenecksWidgetProps {
  bottlenecks: PendingApproval[];
  isLoading?: boolean;
}

export function ApprovalBottlenecksWidget({ bottlenecks, isLoading = false }: ApprovalBottlenecksWidgetProps) {
  const urgentThreshold = 18; // hours

  if (isLoading) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Approval Bottlenecks</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Workflow delays and pending approvers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bottlenecks.length === 0) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Approval Bottlenecks</CardTitle>
          <CardDescription className="text-perionyx-text-muted">No workflow delays detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-perionyx-text-muted">All approvals are flowing smoothly</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-perionyx-text-primary">Approval Bottlenecks</CardTitle>
        <CardDescription className="text-perionyx-text-muted">Roles with pending approvals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bottlenecks.map((bottleneck) => {
            const isUrgent = bottleneck.oldestPendingHours > urgentThreshold;
            const progress = (bottleneck.approvalsReceived / bottleneck.approvalsNeeded) * 100;

            return (
              <div
                key={bottleneck.id}
                className={`p-4 rounded-lg border transition-all ${
                  isUrgent
                    ? 'border-red-600/30 bg-[rgba(139,0,0,0.1)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {isUrgent ? (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-perionyx-text-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">
                        {bottleneck.role}
                      </div>
                      <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-400' : 'text-perionyx-text-muted'}`}>
                        {bottleneck.oldestPendingHours}h pending
                      </div>
                    </div>
                  </div>
                  <Badge variant={isUrgent ? 'danger' : 'default'} className="flex-shrink-0">
                    {bottleneck.approvalsReceived}/{bottleneck.approvalsNeeded}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden border border-[rgba(255,255,255,0.08)]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUrgent
                        ? 'bg-gradient-to-r from-red-600 to-red-400'
                        : 'bg-gradient-to-r from-perionyx-gold to-yellow-300'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
