import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { createInvite, getInviteByToken, acceptInvite, listInvites } from '../src/modules/invites/invites.service';
import { withTestDb } from './helpers/db';

describe('Invites service', () => {
  it('creates an invite and retrieves it by token', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `inviter-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Invite Co', slug: `invite-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });

      const invite = await createInvite({
        companyId: company.id,
        email: 'newuser@example.com',
        role: 'TREASURER',
        invitedByUserId: user.id,
      });

      expect(invite.email).toBe('newuser@example.com');
      expect(invite.role).toBe('TREASURER');
      expect(invite.token).toBeTruthy();
      expect(invite.status).toBe('PENDING');

      const fetched = await getInviteByToken(invite.token);
      expect(fetched).toBeTruthy();
      expect(fetched!.id).toBe(invite.id);
    });
  });

  it('rejects duplicate pending invite for same email+company', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `dup-inviter-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'Dup Co', slug: `dup-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });

      await createInvite({ companyId: company.id, email: 'dup@example.com', role: 'MEMBER', invitedByUserId: user.id });
      await expect(createInvite({ companyId: company.id, email: 'dup@example.com', role: 'ADMIN', invitedByUserId: user.id }))
        .rejects.toThrow('already been invited');
    });
  });

  it('accepts invite and creates membership with correct role', async () => {
    await withTestDb(async (tx) => {
      const inviter = await tx.user.create({ data: { email: `inviter2-${Date.now()}@example.com`, passwordHash: 'x' } });
      const newUser = await tx.user.create({ data: { email: `accept-user-${Date.now()}@example.com`, passwordHash: 'y' } });
      const company = await tx.company.create({ data: { name: 'Accept Co', slug: `accept-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: inviter.id, companyId: company.id, role: 'OWNER' } });

      const invite = await createInvite({ companyId: company.id, email: newUser.email, role: 'ADMIN', invitedByUserId: inviter.id });
      const companyId = await acceptInvite(invite.token, newUser.id, newUser.email);

      expect(companyId).toBe(company.id);

      const membership = await tx.companyMembership.findFirst({ where: { userId: newUser.id, companyId: company.id } });
      expect(membership).toBeTruthy();
      expect(membership!.role).toBe('ADMIN');

      const accepted = await getInviteByToken(invite.token);
      expect(accepted!.status).toBe('ACCEPTED');
    });
  });

  it('rejects accept with mismatched email', async () => {
    await withTestDb(async (tx) => {
      const inviter = await tx.user.create({ data: { email: `inviter3-${Date.now()}@example.com`, passwordHash: 'x' } });
      const newUser = await tx.user.create({ data: { email: `real-${Date.now()}@example.com`, passwordHash: 'y' } });
      const company = await tx.company.create({ data: { name: 'Email Co', slug: `email-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: inviter.id, companyId: company.id, role: 'OWNER' } });

      // Invite sent to a different email
      const invite = await createInvite({ companyId: company.id, email: 'different@example.com', role: 'MEMBER', invitedByUserId: inviter.id });
      await expect(acceptInvite(invite.token, newUser.id, newUser.email))
        .rejects.toThrow('This invitation was sent to a different email');
    });
  });

  it('lists invites for a company', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `list-inviter-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await tx.company.create({ data: { name: 'List Invites Co', slug: `list-invites-co-${Date.now()}` } });
      await tx.companyMembership.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });

      await createInvite({ companyId: company.id, email: 'a@example.com', role: 'MEMBER', invitedByUserId: user.id });
      await createInvite({ companyId: company.id, email: 'b@example.com', role: 'VIEWER', invitedByUserId: user.id });

      const invites = await listInvites(company.id);
      expect(invites.length).toBe(2);
    });
  });
});
