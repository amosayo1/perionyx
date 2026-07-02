'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ApprovalAuthority = {
  id: string;
  roleId: string;
  name: string;
  description?: string;
  scopeType: string;
  scopeId?: string;
  minAmount?: string;
  maxAmount?: string;
  requiresDualApproval: boolean;
  enabled: boolean;
  role: { name: string };
};

type Role = {
  id: string;
  name: string;
};

export default function ApproversPage() {
  const [authorities, setAuthorities] = useState<ApprovalAuthority[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roleId: '',
    name: '',
    description: '',
    scopeType: 'GLOBAL',
    scopeId: '',
    minAmount: '',
    maxAmount: '',
    requiresDualApproval: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [authRes, rolesRes] = await Promise.all([
        fetch('/api/v1/admin/approval-authorities'),
        fetch('/api/v1/admin/roles'),
      ]);

      if (authRes.ok) {
        const data = await authRes.json();
        setAuthorities(data.authorities || []);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(Array.isArray(rolesData) ? rolesData : rolesData.roles || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.roleId || !formData.name) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/approval-authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          roleId: '',
          name: '',
          description: '',
          scopeType: 'GLOBAL',
          scopeId: '',
          minAmount: '',
          maxAmount: '',
          requiresDualApproval: false,
        });
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to create authority:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">Approver Configuration</h1>
        <p className="mt-2 text-sm text-perionyx-text-muted">Define approver roles with scope and financial thresholds.</p>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="default">
          + Add Approver Authority
        </Button>
      ) : (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>New Approver Authority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Role *</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Authority Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Treasury Approver"
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-perionyx-text-primary">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Role description"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Scope Type</label>
                <select
                  value={formData.scopeType}
                  onChange={(e) => setFormData({ ...formData, scopeType: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary"
                >
                  <option value="GLOBAL">Global</option>
                  <option value="WALLET">Wallet</option>
                  <option value="TRANSACTION_TYPE">Transaction Type</option>
                </select>
              </div>

              {formData.scopeType !== 'GLOBAL' && (
                <div>
                  <label className="block text-sm font-medium text-perionyx-text-primary">Scope ID</label>
                  <input
                    type="text"
                    value={formData.scopeId}
                    onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                    placeholder="Wallet or Transaction Type ID"
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Min Amount</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Max Amount</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  placeholder="99999999.99"
                  step="0.01"
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresDualApproval}
                onChange={(e) => setFormData({ ...formData, requiresDualApproval: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-perionyx-text-primary">Requires dual approval</span>
            </label>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!formData.roleId || !formData.name || submitting} variant="default">
                {submitting ? 'Creating…' : 'Create Authority'}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-perionyx-text-muted">Loading authorities…</p>
      ) : (
        <div className="space-y-4">
          {authorities.map((authority) => (
            <Card key={authority.id} className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader>
                <CardTitle>{authority.name}</CardTitle>
                <CardDescription>{authority.role.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {authority.description && <p className="text-sm text-perionyx-text-muted">{authority.description}</p>}

                <div className="grid grid-cols-2 gap-4 text-xs text-perionyx-text-muted">
                  <div>
                    <p className="uppercase tracking-wider">Scope</p>
                    <p className="mt-1 text-perionyx-text-primary">
                      {authority.scopeType}
                      {authority.scopeId && ` (${authority.scopeId})`}
                    </p>
                  </div>

                  {authority.minAmount || authority.maxAmount ? (
                    <div>
                      <p className="uppercase tracking-wider">Amount Limits</p>
                      <p className="mt-1 text-perionyx-text-primary">
                        {authority.minAmount} - {authority.maxAmount}
                      </p>
                    </div>
                  ) : null}
                </div>

                {authority.requiresDualApproval && (
                  <div className="rounded-lg bg-[rgba(212,175,55,0.1)] px-3 py-2 text-xs text-perionyx-gold">
                    ⚠ Dual approval required
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
