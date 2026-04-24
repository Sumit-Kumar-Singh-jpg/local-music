
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as mm from 'music-metadata';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

// In apps/api/src, media is at ../media
const MUSIC_DIR = path.resolve(__dirname, '../media/music');

async function restore() {
  console.log('--- STARTING THE GREAT RE-LINKING ---');
  await prisma.$connect();

  // 1. Ensure System User exists
  let systemUser = await prisma.user.findUnique({ where: { email: 'system@solaris.local' } });
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'system@solaris.local',
        username: 'solaris_system',
        passwordHash: 'SYSTEM_PROTECTED',
        role: 'ADMIN',
        isApproved: true,
      }
    });
  }

  // 2. Ensure System Artist profile exists
  let systemArtist = await prisma.artistProfile.findUnique({ where: { userId: systemUser.id } });
  if (!systemArtist) {
    systemArtist = await prisma.artistProfile.create({
      data: {
        id: crypto.randomUUID(),
        userId: systemUser.id,
        name: 'Solaris Library',
        isVerified: true
      }
    });
  }

  const files = fs.readdirSync(MUSIC_DIR).filter(f => 
    f.endsWith('.m4a') || f.endsWith('.mp3') || f.endsWith('.wav')
  );

  console.log(`Found ${files.length} physical tracks to audit.`);

  let restoredCount = 0;
  let failedCount = 0;

  for (const filename of files) {
    const fullPath = path.join(MUSIC_DIR, filename);
    const dbPath = path.join('music', filename);

    process.stdout.write(`Restoring: ${filename}... `);

    try {
      // 3. Deep Integrity Check
      const metadata = await mm.parseFile(fullPath);
      
      const title = metadata.common.title || filename.replace(/\.(m4a|mp3|wav)$/, '');
      const duration = Math.round(metadata.format.duration || 0);
      const trackId = crypto.randomUUID();

      // 4. Create Track and Storage in one transaction
      await prisma.track.create({
        data: {
          id: trackId,
          title,
          duration,
          audioUrl: `/api/music/${trackId}/stream`,
          artistId: systemArtist.id,
          storage: {
            create: {
              filePath: dbPath,
              storageType: 'LOCAL'
            }
          }
        }
      });

      console.log('SUCCESS');
      restoredCount++;
    } catch (err) {
      console.log(`FAILED (${(err as Error).message})`);
      failedCount++;
    }
  }

  console.log(`\n--- RESTORATION COMPLETE ---`);
  console.log(`Restored: ${restoredCount}`);
  console.log(`Failed: ${failedCount}`);
  await prisma.$disconnect();
}

restore().catch(err => {
  console.error('FATAL RESTORATION ERROR:', err);
  process.exit(1);
});
