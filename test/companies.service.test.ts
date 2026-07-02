import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { createCompanyWithOwner, listCompaniesForUser, getCompanyMembershipForUser, updateCompany } from '../src/modules/companies/companies.service';
import { withTestDb, buildTenantContext } from './helpers/db';

describe('Companies service', () => {
  it('creates a company with owner membership', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `owner-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await createCompanyWithOwner({ name: 'Test Co', slug: `test-co-${Date.now()}`, ownerUserId: user.id });

      expect(company.name).toBe('Test Co');
      expect(company.id).toBeTruthy();

      const membership = await tx.companyMembership.findFirst({ where: { userId: user.id, companyId: company.id } });
      expect(membership).toBeTruthy();
      expect(membership!.role).toBe('OWNER');
    });
  });

  it('lists companies for a user', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `listuser-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await createCompanyWithOwner({ name: 'List Co', slug: `list-co-${Date.now()}`, ownerUserId: user.id });

      const companies = await listCompaniesForUser(user.id);
      expect(companies.some((m) => m.company.id === company.id)).toBe(true);
      expect(companies[0].role).toBe('OWNER');
    });
  });

  it('returns null for non-member getCompanyMembershipForUser', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `other-${Date.now()}@example.com`, passwordHash: 'x' } });
      const owner = await tx.user.create({ data: { email: `owner2-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await createCompanyWithOwner({ name: 'Member Co', slug: `member-co-${Date.now()}`, ownerUserId: owner.id });

      const membership = await getCompanyMembershipForUser(company.id, user.id);
      expect(membership).toBeNull();
    });
  });

  it('updates company details', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `updater-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await createCompanyWithOwner({ name: 'Update Co', slug: `update-co-${Date.now()}`, ownerUserId: user.id });

      const updated = await updateCompany(company.id, user.id, { legalName: 'Update Co LLC', ein: '12-3456789' });
      expect(updated!.legalName).toBe('Update Co LLC');
      expect(updated!.ein).toBe('12-3456789');
    });
  });

  it('blocks update from non-member', async () => {
    await withTestDb(async (tx) => {
      const user = await tx.user.create({ data: { email: `nonmember-${Date.now()}@example.com`, passwordHash: 'x' } });
      const owner = await tx.user.create({ data: { email: `owner3-${Date.now()}@example.com`, passwordHash: 'x' } });
      const company = await createCompanyWithOwner({ name: 'Block Co', slug: `block-co-${Date.now()}`, ownerUserId: owner.id });

      const result = await updateCompany(company.id, user.id, { legalName: 'Hacked' });
      expect(result).toBeNull();
    });
  });
});
