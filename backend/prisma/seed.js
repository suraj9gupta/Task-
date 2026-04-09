import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@indiavillageapi.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const country = await prisma.country.upsert({
    where: { code: 'IND' },
    update: {},
    create: { code: 'IND', name: 'India' },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Platform Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      subscription: { create: { plan: 'PREMIUM', requestsPerDay: 50000 } },
    },
  });

  console.log('Seed complete. Country:', country.name);
}

main().finally(() => prisma.$disconnect());
