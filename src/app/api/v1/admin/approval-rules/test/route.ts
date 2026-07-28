import { z } from 'zod';
import { NextResponse } from 'next/server';
import { RuleEvaluationEngine } from '@/modules/rbac/rule-evaluation.engine';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { Prisma } from '@prisma/client';
import { ValidationError } from '@/lib/errors/app-error';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const TestRuleSchema = z.object({
  amount: z.number().nonnegative("amount must be non-negative"),
  transactionType: z.string().min(1, "transactionType is required").max(256),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

/**
 * POST /api/v1/admin/approval-rules/test
 * 
 * Test which approval rules match a sample transaction context.
 * Useful for validating rule configurations before deployment.
 */
export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      // Permission check: admin.manage_authorities
      await rbacService.ensurePermission(ctx.tenant.userId!, ctx.tenant.companyId, 'admin.manage_authorities');
  
      const rawBody = await request.json();
      const parsed = TestRuleSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { amount, transactionType, metadata } = parsed.data;
  
      // Evaluate rules
      const matchedRules = await RuleEvaluationEngine.evaluateTransaction({
        companyId: ctx.tenant.companyId,
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
  });
}
