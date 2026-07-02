import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { ApprovalThreadService } from '../src/modules/approval-thread/approval-thread.service';
import { withTestDb, buildTenantContext } from './helpers/db';

describe('ApprovalThread service', () => {
  it('creates a thread for a transaction via getOrCreate', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `threaduser-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Thread Co', slug: `thread-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });
      const transaction = await tx.transaction.create({
        data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 100, currency: 'USD', idempotencyKey: `thread-tx-${Date.now()}` },
      } as any);
      await tx.idempotencyRecord.create({ data: { transactionId: transaction.id, companyId: company.id, idempotencyKey: `thread-tx-${Date.now()}` } });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const thread = await ApprovalThreadService.getOrCreate(ctx, transaction.id);

      expect(thread).toBeTruthy();
      expect(thread.transactionId).toBe(transaction.id);
    });
  });

  it('adds and retrieves comments on a thread', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `commentuser-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Comment Co', slug: `comment-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'ADMIN' } });
      const transaction = await tx.transaction.create({
        data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 200, currency: 'USD', idempotencyKey: `comment-tx-${Date.now()}` },
      } as any);
      await tx.idempotencyRecord.create({ data: { transactionId: transaction.id, companyId: company.id, idempotencyKey: `comment-tx-${Date.now()}` } });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const comment = await ApprovalThreadService.addComment(ctx, transaction.id, 'Looks good to me');

      expect(comment.body).toBe('Looks good to me');
      expect(comment.authorUserId).toBe(user.id);

      const thread = await ApprovalThreadService.getThread(ctx, transaction.id);
      expect(thread).toBeTruthy();
      expect(thread!.comments.length).toBe(1);
      expect(thread!.comments[0].body).toBe('Looks good to me');
    });
  });

  it('auto-adds commenter as participant', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `participantuser-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Participant Co', slug: `participant-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'ADMIN' } });
      const transaction = await tx.transaction.create({
        data: { companyId: company.id, type: 'INTERNAL_TRANSFER', primaryAmount: 300, currency: 'USD', idempotencyKey: `participant-tx-${Date.now()}` },
      } as any);
      await tx.idempotencyRecord.create({ data: { transactionId: transaction.id, companyId: company.id, idempotencyKey: `participant-tx-${Date.now()}` } });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      await ApprovalThreadService.addComment(ctx, transaction.id, 'Adding myself as participant');

      const thread = await ApprovalThreadService.getThread(ctx, transaction.id);
      expect(thread).toBeTruthy();
      expect(thread!.participants.length).toBe(1);
      expect(thread!.participants[0].userId).toBe(user.id);
    });
  });

  it('returns same thread on second getOrCreate call', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `reuseuser-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Reuse Co', slug: `reuse-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });
      const transaction = await tx.transaction.create({
        data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 400, currency: 'USD', idempotencyKey: `reuse-tx-${Date.now()}` },
      } as any);
      await tx.idempotencyRecord.create({ data: { transactionId: transaction.id, companyId: company.id, idempotencyKey: `reuse-tx-${Date.now()}` } });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const first = await ApprovalThreadService.getOrCreate(ctx, transaction.id);
      const second = await ApprovalThreadService.getOrCreate(ctx, transaction.id);

      expect(first.id).toBe(second.id);
    });
  });
});
