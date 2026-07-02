import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const transactionId = (await params).id;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason ?? 'rejected by approver';
    await ApprovalWorkflowEngine.rejectTransaction(transactionId, ctx.companyId, session?.user?.id ?? '', session?.user?.companyRole ?? '', reason);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}

