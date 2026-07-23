'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  metrics: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    totalEscalated: number;
    averageApprovalTime: number;
    rejectionRate: number;
  };
  ruleUsage: Array<{
    ruleId: string;
    ruleName: string;
    matchCount: number;
    averageApprovalCount: number;
    averageApprovalTime: number;
    rejectionCount: number;
    rejectionRate: number;
  }>;
  bottlenecks: Array<{
    role: string;
    pendingCount: number;
    averageWaitTime: number;
    oldestPendingHours: number;
  }>;
  transactionTypes: Array<{
    type: string;
    count: number;
    approvalRate: number;
    rejectionRate: number;
    averageApprovalTime: number;
  }>;
  recentActivity: Array<{
    id: string;
    transactionId: string;
    status: string;
    approvingUserRole: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
  }>;
}

export default function ApprovalAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/approval-analytics');
      if (res.ok) {
        const analytics = await res.json();
        setData(analytics);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      setError('Error fetching analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 py-8">
        <p className="text-perionyx-text-muted">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 py-8">
        <p role="alert" className="text-red-400">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  const { metrics, ruleUsage, bottlenecks, transactionTypes, recentActivity } = data;
  const totalApprovals =
    metrics.totalPending + metrics.totalApproved + metrics.totalRejected + metrics.totalEscalated;

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">
          Approval Analytics
        </h1>
        <p className="mt-2 text-sm text-perionyx-text-muted">
          Comprehensive approval workflow metrics and insights.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{metrics.totalPending}</p>
            <p className="mt-1 text-xs text-perionyx-text-muted">
              {totalApprovals > 0
                ? ((metrics.totalPending / totalApprovals) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[rgba(34,197,94,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-400">{metrics.totalApproved}</p>
            <p className="mt-1 text-xs text-perionyx-text-muted">
              {totalApprovals > 0
                ? ((metrics.totalApproved / totalApprovals) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[rgba(239,68,68,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-400">{metrics.totalRejected}</p>
            <p className="mt-1 text-xs text-perionyx-text-muted">{metrics.rejectionRate.toFixed(1)}% rejection rate</p>
          </CardContent>
        </Card>

        <Card className="border-[rgba(147,51,234,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Avg Time</p>
            <p className="mt-2 text-3xl font-bold text-purple-400">{metrics.averageApprovalTime}h</p>
            <p className="mt-1 text-xs text-perionyx-text-muted">to approve</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Approval Bottlenecks */}
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>Approval Bottlenecks</CardTitle>
            <CardDescription>Roles with highest pending approvals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottlenecks.length === 0 ? (
              <p className="text-xs text-perionyx-text-muted">No pending approvals</p>
            ) : (
              bottlenecks.map((bottleneck) => (
                <div
                  key={bottleneck.role}
                  className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-perionyx-text-primary">{bottleneck.role}</p>
                      <p className="text-xs text-perionyx-text-muted">
                        {bottleneck.pendingCount} pending • Oldest {bottleneck.oldestPendingHours}h
                      </p>
                    </div>
                    <Badge className="bg-[rgba(239,68,68,0.2)] text-red-300">
                      {bottleneck.pendingCount}
                    </Badge>
                  </div>
                  <div className="w-full bg-[rgba(255,255,255,0.05)] rounded h-1">
                    <div
                      className="bg-red-500 h-1 rounded"
                      style={{
                        width: `${Math.min(
                          (bottleneck.oldestPendingHours / 168) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Rule Usage */}
        <Card className="border-[rgba(147,51,234,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>Most Used Rules</CardTitle>
            <CardDescription>Top approval rules by transaction count</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ruleUsage.length === 0 ? (
              <p className="text-xs text-perionyx-text-muted">No rule usage data</p>
            ) : (
              ruleUsage.map((rule) => (
                <div key={rule.ruleId} className="rounded-lg bg-[rgba(255,255,255,0.03)] p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-perionyx-text-primary">{rule.ruleName}</p>
                      <p className="text-xs text-perionyx-text-muted">
                        {rule.matchCount} matches • {rule.averageApprovalTime}h avg
                      </p>
                    </div>
                    <Badge className={`${rule.rejectionRate > 10 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                      {rule.rejectionRate.toFixed(1)}% rejected
                    </Badge>
                  </div>
                  <div className="w-full bg-[rgba(255,255,255,0.05)] rounded h-1.5">
                    <div
                      className="bg-perionyx-gold h-1.5 rounded"
                      style={{
                        width: `${Math.min(
                          (rule.matchCount / (ruleUsage[0]?.matchCount || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Types */}
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle>Transaction Type Metrics</CardTitle>
          <CardDescription>Approval statistics by transaction type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionTypes.length === 0 ? (
              <p className="text-xs text-perionyx-text-muted">No transaction data</p>
            ) : (
              transactionTypes.map((type) => (
                <div
                  key={type.type}
                  className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-4"
                >
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Type</p>
                      <p className="mt-1 font-medium text-perionyx-text-primary">{type.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Count</p>
                      <p className="mt-1 text-perionyx-text-primary">{type.count}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Approval Rate</p>
                      <p className="mt-1 text-green-400">{type.approvalRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Rejection Rate</p>
                      <p className="mt-1 text-red-400">{type.rejectionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Avg Approval Time</p>
                      <p className="mt-1 text-perionyx-text-primary">{type.averageApprovalTime}h</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle>Recent Approval Activity</CardTitle>
          <CardDescription>Latest 20 approval events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-perionyx-text-muted">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs"
                >
                  <div className="flex-1">
                    <p className="text-perionyx-text-primary font-medium">
                      Transaction {activity.transactionId.slice(0, 8)}...
                    </p>
                    <p className="text-perionyx-text-muted">
                      {activity.approvingUserRole || 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.rejectionReason && (
                      <span className="text-red-300">{activity.rejectionReason}</span>
                    )}
                    <Badge
                      className={`${
                        activity.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-300'
                          : activity.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300'
                          : activity.status === 'ESCALATED'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
