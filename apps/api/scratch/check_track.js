const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany({
    where: { title: { contains: 'Tum Prem' } },
    include: { storage: true }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main().finally(() => prisma.$disconnect());
