import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { BoardPackGenerator } from "@/components/financial-reports/board-pack-generator";

export default async function BoardPackPage() {
  const session = await auth();
  const companyId = session?.user?.activeCompanyId;

  const boardPacks = companyId ? await prisma.boardPack.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 10,
  }) : [];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Board Pack Generator" description="Generate comprehensive board-ready financial packages" />
      <div className="grid gap-8 lg:grid-cols-2">
        <BoardPackGenerator onGenerate={async (options) => {
          "use server";
        }} />
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Board Packs</h2>
          {boardPacks.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-8 text-center">
              <p className="text-zinc-400">No board packs generated yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {boardPacks.map((bp: any) => (
                <div key={bp.id} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                  <h3 className="font-medium text-white">{bp.title}</h3>
                  <p className="text-sm text-zinc-400">{bp.period} {bp.fiscalYear}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
