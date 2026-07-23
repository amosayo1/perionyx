'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionBuilder } from '@/components/rule-condition-builder';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type ApprovalRule = {
  id: string;
  name: string;
  description?: string;
  priority: number;
  scope: string;
  minAmount: string;
  maxAmount?: string;
  requiredApprovalsCount: number;
  sequentialApproval: boolean;
  dualApprovalRequired: boolean;
  requiresComplianceReview: boolean;
  enabled: boolean;
  expiresAt?: string;
  approvalSteps: Array<{ stepNumber: number; roleRequired: string; approvalCount: number }>;
  conditions: any[];
};

type FormStep = {
  stepNumber: number;
  roleRequired: string;
  approvalCount: number;
  timeoutHours?: number;
};

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 100,
    scope: 'GLOBAL',
    scopeId: '',
    minAmount: 0,
    maxAmount: undefined as number | undefined,
    applicableTransactionTypes: [] as string[],
    applicableConnectorTypes: [] as string[],
    requiredApprovalsCount: 1,
    sequentialApproval: false,
    dualApprovalRequired: false,
    escalationTimeoutHours: undefined as number | undefined,
    requiresComplianceReview: false,
    approvalSteps: [] as FormStep[],
    conditions: [] as Array<{ id: string; fieldName: string; operator: string; value: string }>,
  });

  const [newStep, setNewStep] = useState<FormStep>({
    stepNumber: 1,
    roleRequired: '',
    approvalCount: 1,
  });

  const [testAmount, setTestAmount] = useState(0);
  const [testType, setTestType] = useState('WALLET_CREDIT');
  const [testResults, setTestResults] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; onConfirm: () => void; title: string; message: string; destructive?: boolean }>({ open: false, onConfirm: () => {}, title: "", message: "" });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/v1/admin/approval-rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (!newStep.roleRequired.trim()) return;

    const stepNumber = formData.approvalSteps.length + 1;
    setFormData({
      ...formData,
      approvalSteps: [...formData.approvalSteps, { ...newStep, stepNumber }],
    });
    setNewStep({ stepNumber: stepNumber + 1, roleRequired: '', approvalCount: 1 });
  };

  const handleRemoveStep = (idx: number) => {
    const updated = formData.approvalSteps.filter((_, i) => i !== idx);
    setFormData({ ...formData, approvalSteps: updated });
  };

  const handleAddTransactionType = (type: string) => {
    if (!formData.applicableTransactionTypes.includes(type)) {
      setFormData({
        ...formData,
        applicableTransactionTypes: [...formData.applicableTransactionTypes, type],
      });
    }
  };

  const handleRemoveTransactionType = (type: string) => {
    setFormData({
      ...formData,
      applicableTransactionTypes: formData.applicableTransactionTypes.filter((t) => t !== type),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.approvalSteps.length === 0) {
      setFormError('Please provide a name and at least one approval step');
      return;
    }
    setFormError(null);

    setSubmitting(true);
    try {
      const method = editingRuleId ? 'PUT' : 'POST';
      const url = editingRuleId ? `/api/v1/admin/approval-rules/${editingRuleId}` : '/api/v1/admin/approval-rules';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingRuleId(null);
        resetForm();
        await fetchRules();
      }
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/approval-rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchRules();
      }
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const confirmDeleteRule = (ruleId: string) => {
    setConfirmState({
      open: true,
      destructive: true,
      title: 'Delete Rule',
      message: 'Delete this rule?',
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, open: false }));
        handleDeleteRule(ruleId);
      },
    });
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/approval-rules/${ruleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (res.ok) {
        await fetchRules();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 100,
      scope: 'GLOBAL',
      scopeId: '',
      minAmount: 0,
      maxAmount: undefined,
      applicableTransactionTypes: [],
      applicableConnectorTypes: [],
      requiredApprovalsCount: 1,
      sequentialApproval: false,
      dualApprovalRequired: false,
      escalationTimeoutHours: undefined,
      requiresComplianceReview: false,
      approvalSteps: [],
      conditions: [],
    });
    setNewStep({ stepNumber: 1, roleRequired: '', approvalCount: 1 });
  };

  const handleTestRules = async () => {
    setTestLoading(true);
    try {
      const res = await fetch('/api/v1/admin/approval-rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: testAmount,
          transactionType: testType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (err) {
      console.error('Failed to test rules:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const openEditForm = (rule: ApprovalRule) => {
    setEditingRuleId(rule.id);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      priority: rule.priority,
      scope: rule.scope,
      scopeId: '',
      minAmount: parseInt(rule.minAmount),
      maxAmount: rule.maxAmount ? parseInt(rule.maxAmount) : undefined,
      applicableTransactionTypes: [],
      applicableConnectorTypes: [],
      requiredApprovalsCount: rule.requiredApprovalsCount,
      sequentialApproval: rule.sequentialApproval,
      dualApprovalRequired: rule.dualApprovalRequired,
      escalationTimeoutHours: undefined,
      requiresComplianceReview: rule.requiresComplianceReview,
      approvalSteps: rule.approvalSteps,
      conditions: rule.conditions || [],
    });
    setShowForm(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">Approval Rules</h1>
        <p className="mt-2 text-sm text-perionyx-text-muted">Configure enterprise approval policies for transactions.</p>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="default" size="lg">
          + Create Approval Rule
        </Button>
      ) : (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>{editingRuleId ? 'Edit Rule' : 'Create Approval Rule'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">Rule Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-perionyx-text-primary">Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Transfers above $10k"
                    aria-label="Rule name"
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-perionyx-text-primary">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    aria-label="Priority"
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary"
                  />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-perionyx-text-primary">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rule description and business context"
                  aria-label="Description"
                  className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                  rows={3}
                />
              </div>
            </div>

            {/* Amount Thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">Thresholds</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-perionyx-text-primary">Min Amount</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                    aria-label="Minimum amount"
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-perionyx-text-primary">Max Amount</label>
                  <input
                    type="number"
                    value={formData.maxAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="No limit"
                    aria-label="Maximum amount"
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
                  />
                </div>
              </div>
            </div>

            {/* Approval Requirements */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">Approval Steps *</h3>
              
              <div className="space-y-2">
                {formData.approvalSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-[rgba(212,175,55,0.05)] p-3">
                    <div>
                      <p className="text-sm font-medium text-perionyx-text-primary">Step {step.stepNumber}</p>
                      <p className="text-xs text-perionyx-text-muted">{step.roleRequired} ({step.approvalCount} approvers)</p>
                    </div>
                    <button onClick={() => handleRemoveStep(idx)} className="text-xs text-perionyx-gold hover:text-red-400">
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[rgba(212,175,55,0.12)] p-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newStep.roleRequired}
                    onChange={(e) => setNewStep({ ...newStep, roleRequired: e.target.value })}
                    placeholder="Role (e.g. treasury_admin)"
                    aria-label="Approval step role"
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-perionyx-text-primary placeholder-perionyx-text-muted"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newStep.approvalCount}
                    onChange={(e) => setNewStep({ ...newStep, approvalCount: parseInt(e.target.value) })}
                    placeholder="Approvers needed"
                    aria-label="Number of approvers required"
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-perionyx-text-primary"
                  />
                </div>
                <Button onClick={handleAddStep} size="sm" variant="outline" className="w-full">
                  Add Step
                </Button>
              </div>
            </div>

            {/* Advanced Conditions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">Advanced Conditions</h3>
              <ConditionBuilder
                conditions={formData.conditions}
                onConditionsChange={(conditions) => setFormData({ ...formData, conditions })}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-perionyx-text-primary uppercase tracking-wide">Options</h3>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sequentialApproval}
                  onChange={(e) => setFormData({ ...formData, sequentialApproval: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-perionyx-text-primary">Sequential approval (one after another)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.dualApprovalRequired}
                  onChange={(e) => setFormData({ ...formData, dualApprovalRequired: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-perionyx-text-primary">Require dual approval</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresComplianceReview}
                  onChange={(e) => setFormData({ ...formData, requiresComplianceReview: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-perionyx-text-primary">Requires compliance review</span>
              </label>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-400">{formError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitting} variant="default">
                {submitting ? 'Saving…' : 'Save Rule'}
              </Button>
              <Button onClick={() => { setShowForm(false); setEditingRuleId(null); resetForm(); setFormError(null); }} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-perionyx-text-muted">Loading rules…</p>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{rule.name}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded ${rule.enabled ? 'bg-[rgba(34,197,94,0.2)] text-green-300' : 'bg-[rgba(239,68,68,0.2)] text-red-300'}`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {rule.description && <CardDescription>{rule.description}</CardDescription>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditForm(rule)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => confirmDeleteRule(rule.id)} className="text-red-400">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Amount</p>
                    <p className="mt-1 text-perionyx-text-primary">${rule.minAmount}–{rule.maxAmount ? `$${rule.maxAmount}` : 'Unlimited'}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Approvals</p>
                    <p className="mt-1 text-perionyx-text-primary">{rule.requiredApprovalsCount} required {rule.sequentialApproval && ' (sequential)'}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Priority</p>
                    <p className="mt-1 text-perionyx-text-primary">#{rule.priority}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Approval Chain</p>
                  <div className="mt-2 space-y-1">
                    {rule.approvalSteps.map((step) => (
                      <div key={step.stepNumber} className="text-xs text-perionyx-text-primary">
                        Step {step.stepNumber}: <span className="text-perionyx-gold">{step.roleRequired}</span> ({step.approvalCount}x)
                      </div>
                    ))}
                  </div>
                </div>

                {rule.dualApprovalRequired && (
                  <div className="rounded-lg bg-[rgba(212,175,55,0.1)] px-3 py-2 text-xs text-perionyx-gold">
                    ⚠ Dual approval required
                  </div>
                )}

                {rule.requiresComplianceReview && (
                  <div className="rounded-lg bg-[rgba(147,51,234,0.1)] px-3 py-2 text-xs text-purple-300">
                    ✓ Compliance review required
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rule Testing Section */}
      <Card className="border-[rgba(147,51,234,0.12)] bg-perionyx-bg-panel shadow-soft mt-8">
        <CardHeader>
          <CardTitle>Test Rule Matching</CardTitle>
          <CardDescription>Test which rules apply to a sample transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-perionyx-text-primary">Transaction Amount</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value))}
                placeholder="e.g. 50000"
                aria-label="Test transaction amount"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary placeholder-perionyx-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-perionyx-text-primary">Transaction Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                aria-label="Test transaction type"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-perionyx-text-primary"
              >
                <option value="WALLET_CREDIT">WALLET_CREDIT</option>
                <option value="WALLET_DEBIT">WALLET_DEBIT</option>
                <option value="INTERNAL_TRANSFER">INTERNAL_TRANSFER</option>
                <option value="SETTLEMENT">SETTLEMENT</option>
              </select>
            </div>
          </div>

          <Button onClick={handleTestRules} disabled={testLoading} variant="default" className="w-full">
            {testLoading ? 'Testing…' : 'Test Rules'}
          </Button>

          {testResults && (
            <div className="rounded-lg border border-[rgba(147,51,234,0.12)] bg-[rgba(147,51,234,0.05)] p-4">
              <p className="text-sm font-medium text-purple-300 mb-3">{testResults.message}</p>

              {testResults.matchedRules.length > 0 ? (
                <div className="space-y-2">
                  {testResults.matchedRules.map((rule: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-[rgba(255,255,255,0.03)] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-perionyx-text-primary font-medium">{rule.name}</p>
                          <p className="text-xs text-perionyx-text-muted">Priority: #{rule.priority}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-perionyx-gold">
                            {rule.requiredApprovalsCount} approval{rule.requiredApprovalsCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-perionyx-text-muted">No rules match the test input</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmState.open}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        title={confirmState.title}
        message={confirmState.message}
        destructive={confirmState.destructive}
        confirmLabel="Delete"
      />
    </div>
  );
}
