export type PermissionDefinition = {
  name: string;
  category: string;
  description: string;
};

export const PermissionRegistry: PermissionDefinition[] = [
  { name: 'transaction.create', category: 'Transactions', description: 'Create new transactions or move treasury funds.' },
  { name: 'transaction.view', category: 'Transactions', description: 'View transaction details and history.' },
  { name: 'transaction.approve', category: 'Approvals', description: 'Approve transactions that require governance approval.' },
  { name: 'transaction.reject', category: 'Approvals', description: 'Reject or block transactions requiring approval.' },
  { name: 'transaction.request_approval', category: 'Approvals', description: 'Request approval for a transaction from assigned approvers.' },
  { name: 'wallet.manage', category: 'Wallets', description: 'Create, configure, and manage wallet settings and balances.' },
  { name: 'wallet.view', category: 'Wallets', description: 'View wallet balances and activity.' },
  { name: 'reconciliation.execute', category: 'Reconciliation', description: 'Run reconciliation workflows and resolve mismatches.' },
  { name: 'audit.view', category: 'Audit', description: 'View audit logs and compliance history.' },
  { name: 'connector.manage', category: 'Connectors', description: 'Install, configure, and manage connectors.' },
  { name: 'connector.view', category: 'Connectors', description: 'View installed connectors and their status.' },
  { name: 'connector.connect', category: 'Connectors', description: 'Connect and disconnect connectors.' },
  { name: 'connector.sync', category: 'Connectors', description: 'Trigger manual sync on connectors.' },
  { name: 'connector.credentials', category: 'Connectors', description: 'Manage connector credentials and secrets.' },
  { name: 'admin.manage_roles', category: 'Administration', description: 'Manage roles, permissions, and authorization policies.' },
  { name: 'admin.manage_approvers', category: 'Administration', description: 'Configure approver roles, wallet approvers, and approval thresholds.' },
  { name: 'admin.manage_authorities', category: 'Administration', description: 'Manage approval authority and transaction approval profiles.' },
  { name: 'admin.manage_users', category: 'Administration', description: 'Assign roles to users and manage user access.' },
];
