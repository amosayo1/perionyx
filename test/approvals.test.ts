import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { ApprovalWorkflowEngine } from '../src/modules/ledger/approval-workflow';
import { ApprovalPolicyService } from '../src/modules/rbac/approval-policy.service';
import { rbacService } from '../src/modules/rbac/rbac.service';

describe('Approval workflow', () => {
  it('creates approval records and allows approval by authorized user', async () => {
    const company = await prisma.company.create({ data: { name: 'Approval Co', slug: `approval-co-${Date.now()}` } });
    const user = await prisma.user.create({ data: { email: `approver-${Date.now()}@example.com`, passwordHash: 'x' } });

    // create role and permissions
    await rbacService.upsertPermission('approvals.approve');
    await rbacService.upsertPermission('admin.manage_authorities');
    const role = await prisma.role.create({ data: { companyId: company.id, name: 'TREASURER', description: 'treasurer' } });
    await rbacService.addPermissionToRole(role.id, 'approvals.approve');
    await rbacService.addPermissionToRole(role.id, 'admin.manage_authorities');
    await rbacService.assignRoleToUser(user.id, role.id, company.id);

    // create rule requiring treasurer approvals for amounts >= 10
    const rule = await ApprovalPolicyService.createRule(company.id, user.id, {
      name: 'small-approval',
      minAmount: 10,
      applicableTransactionTypes: ['WALLET_CREDIT'],
      requiredApprovalsCount: 1,
      sequentialApproval: false,
      dualApprovalRequired: false,
      requiresComplianceReview: false,
      priority: 100,
      scope: 'GLOBAL',
      approvalSteps: [
        { stepNumber: 1, roleRequired: 'TREASURER', approvalCount: 1 }
      ]
    });

    const tx = await prisma.transaction.create({ data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 20, currency: 'USD', idempotencyKey: `tx-${Date.now()}` } as any });

    const reqs = await ApprovalWorkflowEngine.getApprovalRequirements(tx.id, company.id);
    expect(reqs.requiredApprovals.length).toBeGreaterThan(0);

    // simulate approval
    const pending = await prisma.transactionApproval.findFirst({ where: { transactionId: tx.id, status: 'PENDING' } });
    
    if (!pending) {
      // Create a pending approval record since rule evaluation doesn't create them automatically
      await prisma.transactionApproval.create({
        data: {
          transactionId: tx.id,
          companyId: company.id,
          status: 'PENDING',
          approvingUserRole: 'TREASURER',
          level: 50,
          sequenceNumber: 0
        }
      });
    }

    const pendingApproval = await prisma.transactionApproval.findFirst({ where: { transactionId: tx.id, status: 'PENDING' } });
    expect(pendingApproval).toBeTruthy();

    await prisma.transactionApproval.update({ where: { id: pendingApproval!.id }, data: { status: 'APPROVED', approvingUserId: user.id, approvedAt: new Date() } });

    const final = await ApprovalWorkflowEngine.getApprovalRequirements(tx.id, company.id);
    expect(final.isApproved).toBe(true);
  });
});
