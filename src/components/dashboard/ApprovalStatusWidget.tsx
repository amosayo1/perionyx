'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalStatusBadge, ApprovalIndicator, NotificationBadge } from '@/components/approval';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ApprovalMetrics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  escalatedCount: number;
  averageApprovalTime: number; // in hours
}

export interface ApprovalStatusWidgetProps {
  metrics: ApprovalMetrics;
  isLoading?: boolean;
}

export function ApprovalStatusWidget({ metrics, isLoading = false }: ApprovalStatusWidgetProps) {
  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Approval Intelligence</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            Real-time workflow orchestration and approval metrics.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending approvals */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.04)]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-perionyx-gold" />
                <div>
                  <div className="text-sm font-semibold text-perionyx-text-primary">Pending Approvals</div>
                  <div className="text-xs text-perionyx-text-muted">Awaiting decision</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-perionyx-gold">{metrics.totalPending}</span>
              </div>
            </div>

            {/* Approved count */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[rgba(46,125,94,0.2)] bg-[rgba(46,125,94,0.04)]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-semibold text-perionyx-text-primary">Approved</div>
                  <div className="text-xs text-perionyx-text-muted">This period</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-400">{metrics.totalApproved}</span>
              </div>
            </div>

            {/* Escalated count */}
            {metrics.escalatedCount > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-[rgba(139,0,0,0.2)] bg-[rgba(139,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-sm font-semibold text-perionyx-text-primary">Escalated</div>
                    <div className="text-xs text-perionyx-text-muted">Requires attention</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-400">{metrics.escalatedCount}</span>
                </div>
              </div>
            )}

            {/* Metrics summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[10px] text-perionyx-text-muted uppercase tracking-wide">Avg. Approval Time</div>
                <div className="text-sm font-bold text-perionyx-text-primary mt-1">{metrics.averageApprovalTime.toFixed(1)}h</div>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[10px] text-perionyx-text-muted uppercase tracking-wide">Rejection Rate</div>
                <div className="text-sm font-bold text-perionyx-text-primary mt-1">
                  {metrics.totalRejected > 0
                    ? `${((metrics.totalRejected / (metrics.totalApproved + metrics.totalRejected)) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
