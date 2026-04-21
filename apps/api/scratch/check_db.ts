import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const storages = await prisma.songStorage.findMany({
    include: { track: true }
  })
  console.log(JSON.stringify(storages, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
