
import { PrismaClient } from '../apps/api/node_modules/@prisma/client';
import fs from 'fs';
import * as mm from 'music-metadata';
import path from 'path';

const prisma = new PrismaClient();

async function purge() {
  console.log('>>> STARTING SOLARIS DEEP INTEGRITY SCAN');
  await prisma.$connect();
  const tracks = await prisma.track.findMany();
  console.log(`>>> AUDITING ${tracks.length} TRACKS`);
  
  let corruptedCount = 0;
  for (const t of tracks) {
    if (!t.filePath) {
      console.log(`[-] NO_PATH: ${t.title}`);
      await prisma.track.delete({ where: { id: t.id } });
      corruptedCount++;
      continue;
    }

    // Correcting path resolution: media folder is inside apps/api
    const fullPath = path.resolve('apps/api/media', t.filePath);
    process.stdout.write(`Checking: ${t.title}... `);

    let isCorrupted = false;
    let reason = '';

    if (!fs.existsSync(fullPath)) {
      isCorrupted = true;
      reason = 'MISSING';
    } else {
      const stats = fs.statSync(fullPath);
      if (stats.size < 100 * 1024) {
        isCorrupted = true;
        reason = 'TOO_SMALL';
      } else {
        try {
          await mm.parseFile(fullPath);
          console.log('OK');
        } catch (e) {
          isCorrupted = true;
          reason = 'CORRUPTED';
        }
      }
    }

    if (isCorrupted) {
      console.log(`FAILED [${reason}]`);
      corruptedCount++;
      try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch(e){}
      await prisma.track.delete({ where: { id: t.id } });
      console.log(`  -> Purged: ${t.title}`);
    }
  }

  console.log(`\n>>> SCAN COMPLETE. PURGED ${corruptedCount} BAD TRACKS.`);
  await prisma.$disconnect();
}

purge().catch(err => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
