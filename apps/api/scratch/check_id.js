const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.track.findUnique({
    where: { id: '40ca58af-9d65-4b23-8512-63e2039c6ed4' },
    include: { storage: true }
  });
  console.log(JSON.stringify(t, null, 2));
}

main().finally(() => prisma.$disconnect());
