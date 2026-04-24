import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';
import * as mm from 'music-metadata';

async function fixExtensions() {
  console.log('--- Fixing Song Storage Extensions ---');
  
  const storages = await prisma.songStorage.findMany();
  
  for (const storage of storages) {
    const filePath = storage.filePath;
    
    if (!fs.existsSync(filePath)) {
      console.log(`[!] File not found: ${filePath}`);
      continue;
    }

    const currentExt = path.extname(filePath);
    if (currentExt) {
      console.log(`[OK] Already has extension: ${path.basename(filePath)}`);
      continue;
    }

    try {
      const metadata = await mm.parseFile(filePath);
      const format = metadata.format.container?.toLowerCase() || '';
      
      let newExt = '';
      if (format.includes('mpeg') || format === 'mp3') newExt = '.mp3';
      else if (format.includes('flac')) newExt = '.flac';
      else if (format.includes('m4a') || format.includes('mp4') || format === 'aac') newExt = '.m4a';
      else {
          // Fallback check by common signatures if container is vague
          const buffer = Buffer.alloc(4);
          const fd = fs.openSync(filePath, 'r');
          fs.readSync(fd, buffer, 0, 4, 0);
          fs.closeSync(fd);
          
          if (buffer.toString('utf8', 0, 3) === 'ID3' || buffer[0] === 0xFF) newExt = '.mp3';
          else if (buffer.toString('utf8', 0, 4) === 'fLaC') newExt = '.flac';
          else if (buffer.toString('utf8', 4, 8) === 'ftyp') newExt = '.m4a';
      }

      if (newExt) {
        const newPath = filePath + newExt;
        console.log(`[*] Renaming: ${path.basename(filePath)} -> ${path.basename(newPath)}`);
        
        fs.renameSync(filePath, newPath);
        
        await prisma.songStorage.update({
          where: { id: storage.id },
          data: { filePath: newPath }
        });
      } else {
        console.log(`[?] Could not detect format for: ${path.basename(filePath)} (Detected format: ${format})`);
      }
    } catch (err) {
      console.error(`[E] Error processing ${path.basename(filePath)}:`, err);
    }
  }

  process.exit(0);
}

fixExtensions();
