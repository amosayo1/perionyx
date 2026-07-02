import 'dotenv/config';
import crypto from 'crypto';
import { SecretStoreFactory } from '@/modules/secrets/secret-store';

async function main() {
  const store = SecretStoreFactory();
  const oldSecret = await store.getSecret('webhook.secret');
  console.log('Current webhook.secret:', oldSecret ? '[REDACTED]' : '(none)');
  const newSecret = crypto.randomBytes(32).toString('hex');
  await store.setSecret('webhook.secret', newSecret);
  console.log('Rotated webhook.secret and stored in secret store. New secret is shown once:');
  console.log(newSecret);
  console.log('\nYou should update any external receivers to use the new secret for signature verification.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
