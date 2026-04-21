import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function check() {
  const tasks = await prisma.ingestionTask.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  console.log(JSON.stringify(tasks, null, 2))
}
check().finally(() => prisma.$disconnect())
