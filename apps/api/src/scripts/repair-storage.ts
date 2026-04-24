import { prisma } from '../db/client';
import fs from 'fs';
import path from 'path';

const MUSIC_DIR = path.resolve(process.cwd(), 'media', 'music');

async function repairStorage() {
  console.log('--- Starting Storage Repair ---');
  
  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`Music directory not found at: ${MUSIC_DIR}`);
    return;
  }

  // 1. Get all tracks without storage
  const orphanedTracks = await prisma.track.findMany({
    where: { storage: null },
    include: { artist: true }
  });

  console.log(`Found ${orphanedTracks.length} tracks with NONE storage.`);

  // 2. Scan filesystem for matches
  const walkSync = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walkSync(file));
      } else {
        if (['.mp3', '.flac', '.m4a', '.mp4', '.wav'].some(ext => file.endsWith(ext))) {
          results.push(file);
        }
      }
    });
    return results;
  };

  const allFiles = walkSync(MUSIC_DIR);
  console.log(`Found ${allFiles.length} audio files on disk.`);

  let repairedCount = 0;
  for (const track of orphanedTracks) {
    // Current format: {track_number} - {title} - {artist}
    // We try many strategies to match:
    // 1. Strict match on "Title - Artist"
    // 2. Match on "Title" if unique
    
    const possibleFilenames = [
      `${track.title} - ${track.artist.name}`,
      `${track.title}`,
    ].map(f => f.toLowerCase().replace(/[^\w\s]/g, ''));

    const match = allFiles.find(filePath => {
      const base = path.basename(filePath, path.extname(filePath)).toLowerCase().replace(/[^\w\s]/g, '');
      return possibleFilenames.some(pf => base.includes(pf));
    });

    if (match) {
      console.log(`Matched Track [${track.title}] -> File [${path.basename(match)}]`);
      
      const relativePath = path.relative(process.cwd(), match);
      
      await prisma.songStorage.create({
        data: {
          trackId: track.id,
          filePath: relativePath,
          storageType: 'LOCAL'
        }
      });
      
      // Update audioUrl to the standard stream endpoint
      await prisma.track.update({
        where: { id: track.id },
        data: { 
          audioUrl: `/api/music/${track.id}/stream`,
          coverUrl: `/api/music/${track.id}/cover`
        }
      });
      
      repairedCount++;
    }
  }

  console.log('--- Repair Summary ---');
  console.log(`Repaired ${repairedCount} tracks.`);
}

repairStorage()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal Repair Error:', err);
    process.exit(1);
  });
