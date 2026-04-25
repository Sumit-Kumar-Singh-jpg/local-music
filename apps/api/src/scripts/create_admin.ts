import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = 'sumit@localmusic.com';
  const password = 'password123';
  const username = 'sumit_admin';
  const name = 'Sumit Admin';

  console.log(`Creating admin user: ${email}...`);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        isApproved: true,
      },
      create: {
        email,
        username,
        passwordHash,
        role: Role.ADMIN,
        isApproved: true,
        profile: {
          create: {
            handle: username,
            displayName: name,
            settings: {
              theme: 'DARK',
              audioQuality: 'HIGH'
            }
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log('Admin user created/updated successfully:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
