import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';

async function healPaths() {
  console.log('--- STARTING HEAL PATHS ---');
  
  const tracks = await prisma.track.findMany();
  console.log(`Found ${tracks.length} tracks in database.`);

  const musicDir = path.resolve('media/music');
  if (!fs.existsSync(musicDir)) {
      console.error(`Music dir not found at ${musicDir}`);
      // Fallback relative to project root (assuming we run from apps/api)
      // path.resolve('media/music') from apps/api is correct.
  }

  const allFiles: string[] = [];
  function walk(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
       const full = path.join(dir, item);
       if (fs.statSync(full).isDirectory()) {
         walk(full);
       } else {
         allFiles.push(full);
       }
    }
  }

  try {
    walk(musicDir);
  } catch (e) {
    console.error('Walk failed:', e);
  }
  
  console.log(`Scanned ${allFiles.length} files on disk.`);

  for (const track of tracks) {
    // Try to find matching file
    // We match by checking if the file name contains the track title (sanitized)
    const safeTitle = track.title.toLowerCase().replace(/[()]/g, '').slice(0, 15);
    
    const candidates = allFiles.filter(f => {
        const base = path.basename(f).toLowerCase();
        return base.includes(safeTitle);
    });

    if (candidates.length > 0) {
        // Pick the one with an audio extension if multiple exist
        const bestMatch = candidates.find(f => ['.mp3', '.flac', '.m4a', '.wav'].includes(path.extname(f).toLowerCase())) || candidates[0];
        console.log(`[OK] ${track.title} -> ${path.basename(bestMatch)}`);
        
        await prisma.songStorage.upsert({
            where: { trackId: track.id },
            update: { filePath: bestMatch },
            create: { 
                trackId: track.id, 
                filePath: bestMatch,
                storageType: 'LOCAL'
            }
        });
    } else {
        console.log(`[MISSED] ${track.title} (looked for "${safeTitle}")`);
    }
  }

  console.log('--- HEALING COMPLETE ---');
  process.exit(0);
}

healPaths();
