-- CreateTable
CREATE TABLE "ApprovalThread" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalComment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalParticipant" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApprovalParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalThread_companyId_idx" ON "ApprovalThread"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalThread_transactionId_key" ON "ApprovalThread"("transactionId");

-- CreateIndex
CREATE INDEX "ApprovalComment_threadId_idx" ON "ApprovalComment"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalParticipant_threadId_userId_key" ON "ApprovalParticipant"("threadId", "userId");

-- AddForeignKey
ALTER TABLE "ApprovalThread" ADD CONSTRAINT "ApprovalThread_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalThread" ADD CONSTRAINT "ApprovalThread_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalComment" ADD CONSTRAINT "ApprovalComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ApprovalThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalComment" ADD CONSTRAINT "ApprovalComment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalComment" ADD CONSTRAINT "ApprovalComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalParticipant" ADD CONSTRAINT "ApprovalParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ApprovalThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalParticipant" ADD CONSTRAINT "ApprovalParticipant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalParticipant" ADD CONSTRAINT "ApprovalParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
