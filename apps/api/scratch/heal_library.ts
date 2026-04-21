import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

async function heal() {
  console.log('🔍 Starting Library Healing...')
  const storages = await prisma.songStorage.findMany({
    include: { track: true }
  })

  const mediaRoot = path.resolve(process.cwd(), 'media')
  if (!fs.existsSync(mediaRoot)) {
    console.error('Media root not found at:', mediaRoot)
    return
  }

  console.log('📦 Indexing media files...')
  const allFiles = getAllFiles(mediaRoot)
  console.log(`Found ${allFiles.length} files on disk.`)

  for (const store of storages) {
    if (!fs.existsSync(store.filePath)) {
      console.log(`❌ Missing: ${store.track.title}`)
      
      const fileName = path.basename(store.filePath).toLowerCase()
      // Try to find a match
      const match = allFiles.find(f => {
         const diskName = path.basename(f).toLowerCase()
         return diskName.includes(fileName) || fileName.includes(diskName.split('.')[0])
      })
      
      if (match) {
         console.log(`   ✅ Restored to: ${match}`)
         await prisma.songStorage.update({
           where: { id: store.id },
           data: { filePath: match }
         })
      }
    }
  }
  console.log('✨ Healing complete!')
}

heal().catch(console.error).finally(() => prisma.$disconnect())
