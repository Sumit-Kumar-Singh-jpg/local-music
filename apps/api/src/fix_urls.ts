import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tracks = await prisma.track.findMany({
    where: { audioUrl: { contains: '/api/songs/' } }
  });
  console.log(`Found ${tracks.length} tracks to fix.`);
  for (const track of tracks) {
    const newUrl = track.audioUrl.replace('/api/songs/', '/api/music/');
    await prisma.track.update({
      where: { id: track.id },
      data: { audioUrl: newUrl }
    });
  }
  console.log('Fixed all database URLs.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
