import { prisma } from '../src/db/client';

async function auditPaths() {
  const storages = await prisma.songStorage.findMany({ take: 20 });
  console.log('Path Audit:');
  storages.forEach(s => {
    console.log(`- ${s.trackId}: ${s.filePath}`);
    const fs = require('fs');
    console.log(`  EXISTS: ${fs.existsSync(s.filePath)}`);
  });
}

auditPaths();
