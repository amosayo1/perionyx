import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { rbacService } from '../src/modules/rbac/rbac.service';
import { WebhookRegistry } from '../src/modules/integrations/webhook-registry.service';

let companyId: string;
let userId: string;

describe('RBAC + Webhook integration', () => {
  beforeAll(async () => {
    const company = await prisma.company.create({ data: { name: 'TestCo', slug: `testco-${Date.now()}` } });
    companyId = company.id;
    const user = await prisma.user.create({ data: { email: `test-${Date.now()}@example.com` } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.webhook.deleteMany({ where: { companyId } });
    await prisma.role.deleteMany({ where: { companyId } });
    await prisma.userRole.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('allows assigning a role and permission to a user', async () => {
    const perm = await rbacService.upsertPermission(`test.perm.${Date.now()}`);
    const role = await rbacService.createRole(companyId, `ROLE-${Date.now()}`);
    await rbacService.addPermissionToRole(role.id, perm.name);
    await rbacService.assignRoleToUser(userId, role.id, companyId);

    const ok = await rbacService.userHasPermission(userId, companyId, perm.name);
    expect(ok).toBe(true);
  });

  it('enqueues webhook deliveries', async () => {
    const hook = await prisma.webhook.create({ data: { companyId, name: 't-hook', url: 'http://localhost/', events: ['transaction.created'], active: true } });
    const count = await WebhookRegistry.enqueueForCompany(companyId, 'transaction.created', { hello: 'world' });
    expect(count).toBeGreaterThan(0);
    // cleanup created deliveries
    await prisma.webhookDelivery.deleteMany({ where: { companyId } });
    await prisma.webhook.delete({ where: { id: hook.id } });
  });
});
