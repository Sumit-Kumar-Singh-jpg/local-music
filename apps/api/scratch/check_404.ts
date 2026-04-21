import { prisma } from '../src/db/client';

async function checkTrack() {
  const id = 'bb93552e-8535-4812-8769-fd38145bd2b3';
  const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
  console.log('STORAGE:', JSON.stringify(storage, null, 2));
  
  if (storage) {
    const fs = await import('fs');
    console.log('FILE EXISTS:', fs.existsSync(storage.filePath));
    console.log('ABSOLUTE PATH:', require('path').resolve(storage.filePath));
  }
}

checkTrack();
