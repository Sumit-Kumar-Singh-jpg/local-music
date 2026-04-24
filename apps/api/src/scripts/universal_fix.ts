import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';
import * as mm from 'music-metadata';

async function universalFix() {
  console.log('=== UNIVERSAL MEDIA FIXER ===');
  
  const musicDir = path.resolve(__dirname, '../../media/music');
  console.log(`Working Dir: ${musicDir}`);

  let fixedCount = 0;

  async function processDir(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
         await processDir(fullPath);
      } else {
         const ext = path.extname(fullPath);
         if (!ext) {
            console.log(`[?] Found extension-less file: ${item}`);
            
            let detectedExt = '.mp3'; // Fallback default
            try {
              const metadata = await mm.parseFile(fullPath);
              const container = metadata.format.container?.toLowerCase() || '';
              if (container.includes('flac')) detectedExt = '.flac';
              else if (container.includes('m4a') || container.includes('mp4')) detectedExt = '.m4a';
            } catch (e) {
              console.warn(`[!] Metadata fail for ${item}, defaulting to .mp3`);
            }

            const newPath = fullPath + detectedExt;
            console.log(`[+] Renaming: ${item} -> ${item}${detectedExt}`);
            fs.renameSync(fullPath, newPath);
            fixedCount++;

            // Update ANY SongStorage records that were pointing to the old path
            // We use 'contains' to handle potential relative/absolute path mismatches or encoding noise
            const storages = await prisma.songStorage.findMany({
                where: { filePath: { contains: item } }
            });

            for (const s of storages) {
                console.log(`    -> Updating DB record for track ${s.trackId}`);
                await prisma.songStorage.update({
                    where: { id: s.id },
                    data: { filePath: newPath }
                });
            }
         }
      }
    }
  }

  await processDir(musicDir);
  console.log(`=== DONE: Fixed ${fixedCount} files ===`);
  process.exit(0);
}

universalFix();
