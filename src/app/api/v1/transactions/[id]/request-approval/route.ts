import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';

export async function POST(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const transactionId = (await params).id;
    
    // Get the approval requirements for this transaction
    const requirements = await ApprovalWorkflowEngine.getApprovalRequirements(transactionId, ctx.companyId);
    
    return NextResponse.json({ requirements });
  } catch (err) {
    return handleRouteError(err);
  }
}
