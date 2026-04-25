const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCover(id) {
  const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
  if (!storage) {
    console.log('No storage found for ID:', id);
    return;
  }
  console.log('Storage path:', storage.filePath);
  console.log('Exists on disk:', fs.existsSync(storage.filePath));
  
  try {
    const { parseFile } = await import('music-metadata');
    const metadata = await parseFile(storage.filePath);
    const picture = metadata.common.picture?.[0];
    if (picture) {
      console.log('Picture found! Format:', picture.format, 'Size:', picture.data.length);
    } else {
      console.log('No picture in metadata');
    }
  } catch (err) {
    console.log('Metadata error:', err.message);
  }
}

checkCover('659cbfdc-3ad0-4496-b3fc-9cd5b00b4ed7').finally(() => prisma.$disconnect());
