'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalTimeline, ApprovalTimelineEvent } from '@/components/approval';

export interface WalletActivityWithApprovals {
  walletId: string;
  walletName: string;
  recentEvents: ApprovalTimelineEvent[];
}

export interface WalletApprovalActivityProps {
  activities: WalletActivityWithApprovals[];
  isLoading?: boolean;
}

export function WalletApprovalActivity({ activities, isLoading = false }: WalletApprovalActivityProps) {
  if (isLoading) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Wallet Activity Timeline</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Approval workflow progression across wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Wallet Activity Timeline</CardTitle>
          <CardDescription className="text-perionyx-text-muted">No recent approval activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-perionyx-text-muted">No approval events to display</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-perionyx-text-primary">Wallet Activity Timeline</CardTitle>
        <CardDescription className="text-perionyx-text-muted">Approval workflow progression across wallets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.walletId} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-perionyx-gold" />
                <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">
                  {activity.walletName}
                </h3>
              </div>
              <div className="pl-4">
                <ApprovalTimeline events={activity.recentEvents} compact={true} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
