import { db } from '../../server/db';
import { users } from '../../shared/schema';
import { hashSync } from 'bcryptjs';

async function seedUsers() {
  const basePassword = 'Test1234!';
  const passwordHash = hashSync(basePassword, 10);

  const roles = ['candidate', 'member', 'supervisor', 'admin'];

  for (const role of roles) {
    await db.insert(users).values({
      username: `test_${role}`,
      email: `test_${role}@example.com`,
      passwordHash,
      role,
      status: 'active',
    });
    console.log(`User with role '${role}' created.`);
  }
  console.log('Seeding complete. Default password for all: ' + basePassword);
}

seedUsers().catch(console.error);
