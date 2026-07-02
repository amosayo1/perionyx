'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Condition {
  id: string;
  fieldName: string;
  operator: string;
  value: string;
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onConditionsChange: (conditions: Condition[]) => void;
}

const OPERATORS = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'GREATER_THAN', label: 'Greater Than' },
  { value: 'LESS_THAN', label: 'Less Than' },
  { value: 'BETWEEN', label: 'Between' },
  { value: 'IN', label: 'In List' },
  { value: 'CONTAINS', label: 'Contains' },
];

const FIELDS = [
  { value: 'amount', label: 'Transaction Amount' },
  { value: 'transactionType', label: 'Transaction Type' },
  { value: 'walletId', label: 'Wallet ID' },
  { value: 'connectorType', label: 'Connector Type' },
  { value: 'currency', label: 'Currency' },
  { value: 'metadata.department', label: 'Department (Metadata)' },
  { value: 'metadata.costCenter', label: 'Cost Center (Metadata)' },
];

export function ConditionBuilder({ conditions, onConditionsChange }: ConditionBuilderProps) {
  const [newCondition, setNewCondition] = useState({
    fieldName: 'amount',
    operator: 'EQUALS',
    value: '',
  });

  const handleAddCondition = () => {
    if (!newCondition.fieldName || !newCondition.value.trim()) {
      return;
    }

    const condition: Condition = {
      id: `cond-${Date.now()}`,
      ...newCondition,
    };

    onConditionsChange([...conditions, condition]);
    setNewCondition({
      fieldName: 'amount',
      operator: 'EQUALS',
      value: '',
    });
  };

  const handleRemoveCondition = (id: string) => {
    onConditionsChange(conditions.filter((c) => c.id !== id));
  };

  const handleUpdateCondition = (id: string, field: string, value: string) => {
    onConditionsChange(
      conditions.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-perionyx-text-primary mb-3">
          Advanced Conditions (Optional)
        </h4>
        <p className="text-xs text-perionyx-text-muted mb-4">
          Add conditions to match transactions based on custom criteria.
        </p>
      </div>

      {/* Current Conditions */}
      {conditions.length > 0 && (
        <div className="space-y-2 mb-4">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className="flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.05)] p-3"
            >
              <div className="flex-1">
                <p className="text-sm text-perionyx-text-primary">
                  <span className="font-medium">{FIELDS.find((f) => f.value === condition.fieldName)?.label}</span>
                  {' '}
                  <span className="text-perionyx-text-muted">
                    {OPERATORS.find((o) => o.value === condition.operator)?.label}
                  </span>
                  {' '}
                  <span className="text-perionyx-gold">{condition.value}</span>
                </p>
              </div>
              <button
                onClick={() => handleRemoveCondition(condition.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Condition */}
      <div className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-perionyx-text-muted uppercase tracking-wider mb-1">
              Field
            </label>
            <select
              value={newCondition.fieldName}
              onChange={(e) => setNewCondition({ ...newCondition, fieldName: e.target.value })}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-sm text-perionyx-text-primary"
            >
              {FIELDS.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-perionyx-text-muted uppercase tracking-wider mb-1">
              Operator
            </label>
            <select
              value={newCondition.operator}
              onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-sm text-perionyx-text-primary"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-perionyx-text-muted uppercase tracking-wider mb-1">
              Value
            </label>
            <input
              type="text"
              value={newCondition.value}
              onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
              placeholder="e.g. USD or ACH"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-sm text-perionyx-text-primary placeholder-perionyx-text-muted"
            />
          </div>
        </div>

        <Button
          onClick={handleAddCondition}
          variant="outline"
          size="sm"
          className="w-full"
        >
          + Add Condition
        </Button>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-[rgba(147,51,234,0.1)] px-3 py-2">
        <p className="text-xs text-purple-300">
          💡 All conditions must match for the rule to apply.
        </p>
      </div>
    </div>
  );
}
