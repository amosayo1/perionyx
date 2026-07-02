import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { RuleEvaluationEngine } from '@/modules/rbac/rule-evaluation.engine';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { Prisma } from '@prisma/client';
import { ValidationError } from '@/lib/errors/app-error';

/**
 * POST /api/v1/admin/approval-rules/test
 * 
 * Test which approval rules match a sample transaction context.
 * Useful for validating rule configurations before deployment.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );

    // Permission check: admin.manage_authorities
    await rbacService.ensurePermission(session?.user?.id!, ctx.companyId, 'admin.manage_authorities');

    const { amount, transactionType, metadata } = await request.json();

    // Validate input
    if (!amount || !transactionType) {
      throw new ValidationError('amount and transactionType are required');
    }

    if (typeof amount !== 'number' || amount < 0) {
      throw new ValidationError('amount must be a non-negative number');
    }

    if (typeof transactionType !== 'string') {
      throw new ValidationError('transactionType must be a string');
    }

    // Evaluate rules
    const matchedRules = await RuleEvaluationEngine.evaluateTransaction({
      companyId: ctx.companyId,
      amount: new Prisma.Decimal(amount),
      transactionType,
      metadata: metadata || {},
    });

    return NextResponse.json({
      testInput: {
        amount,
        transactionType,
      },
      matchedRulesCount: matchedRules.length,
      matchedRules,
      message:
        matchedRules.length === 0
          ? 'No rules match this transaction'
          : `${matchedRules.length} rule(s) match this transaction`,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
