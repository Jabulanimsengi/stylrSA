// Script to mark all existing users as email verified
// Run this to grandfather in users who signed up before email verification was added

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding users with unverified emails...');
  
  const unverifiedUsers = await prisma.user.findMany({
    where: {
      emailVerified: false,
      // Only update users created before email verification was added (today)
      createdAt: {
        lt: new Date('2025-10-20'),
      },
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  console.log(`Found ${unverifiedUsers.length} existing users to verify`);

  if (unverifiedUsers.length === 0) {
    console.log('No users need to be updated.');
    return;
  }

  console.log('Updating users...');
  
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: false,
      createdAt: {
        lt: new Date('2025-10-20'),
      },
    },
    data: {
      emailVerified: true,
    },
  });

  console.log(`✓ Updated ${result.count} users to verified status`);
  console.log('\nUsers updated:');
  unverifiedUsers.forEach(user => {
    console.log(`- ${user.email} (created: ${user.createdAt.toISOString()})`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
