
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany({
    include: {
      artist: true,
      storage: true
    }
  });
  console.log(`Total tracks: ${tracks.length}`);
  tracks.forEach(t => {
    console.log(`- ${t.title} by ${t.artist.name} (ID: ${t.id}, Path: ${t.storage?.filePath || 'N/A'})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
