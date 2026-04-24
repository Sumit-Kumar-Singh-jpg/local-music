import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';
import * as mm from 'music-metadata';
import { SearchService } from '../services/searchService';

/**
 * Robust Metadata Re-indexer & Healer
 */
async function reindex() {
  console.log('--- [SOLARIS METADATA RE-INDEXER] Starting ---');

  // Hardcode mediaRoot to be absolute and safe
  const mediaRoot = "C:\\Nischay\\PROJECTS\\local Music\\apps\\api\\media";
  console.log(`Scanning Media Root: ${mediaRoot}`);

  if (!fs.existsSync(mediaRoot)) {
    console.error(`Media root NOT FOUND: ${mediaRoot}`);
    process.exit(1);
  }

  const tracks = await prisma.track.findMany({ 
    include: { 
      storage: true,
      artist: true,
      album: true
    } 
  });
  console.log(`Database has ${tracks.length} tracks.`);
  
  const diskFiles: string[] = [];
  function scan(dir: string) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        try {
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            scan(full);
          } else {
            const ext = path.extname(item).toLowerCase();
            if (['.mp3', '.flac', '.m4a', '.wav', '.part'].includes(ext)) {
              diskFiles.push(full);
            }
          }
        } catch (e: any) {
          console.warn(`[SKIP] Could not stat ${full}: ${e.message}`);
        }
      }
    } catch (e: any) {
      console.warn(`[SKIP] Could not read dir ${dir}: ${e.message}`);
    }
  }
  
  scan(mediaRoot);
  console.log(`Found ${diskFiles.length} audio files on disk.`);

  let updatedCount = 0;
  let genreCount = 0;

  for (const track of tracks) {
    let filePath = track.storage?.filePath;
    
    // Healer: Find matching file if current one is invalid
    if (!filePath || !fs.existsSync(filePath)) {
      const cleanTitle = track.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const match = diskFiles.find(f => {
        const base = path.basename(f).toLowerCase().replace(/[^a-z0-9]/g, '');
        // Match if disk filename contains track title or vice-versa
        return base.includes(cleanTitle) || cleanTitle.includes(base);
      });
      
      if (match) {
        filePath = match;
        console.log(`[HEALED] ${track.title} -> ${path.basename(match)}`);
      } else {
        continue;
      }
    }

    try {
      const metadata = await mm.parseFile(filePath);
      const genre = metadata.common.genre?.[0] || 'Unknown';

      // 1. Update Database
      await prisma.track.update({
        where: { id: track.id },
        data: { 
          genre,
          storage: {
            upsert: {
              create: { filePath: filePath, storageType: 'LOCAL' },
              update: { filePath: filePath }
            }
          }
        }
      });

      // 2. Update Search Index (Elasticsearch)
      await SearchService.indexTrack({
        id: track.id,
        title: track.title,
        artistName: track.artist?.name || 'Unknown Artist',
        albumTitle: track.album?.title || 'Unknown Album',
        genre: genre,
        coverUrl: track.coverUrl,
        releaseDate: track.releaseDate,
        isExplicit: track.isExplicit
      });

      updatedCount++;
      if (genre && genre !== 'Unknown') {
        genreCount++;
      }
      
      if (updatedCount % 10 === 0) console.log(`Progress: ${updatedCount} tracks processed...`);
      
    } catch (err: any) {
      console.error(`[ERROR] Processing ${track.title}:`, err.message);
    }
  }

  console.log('\n--- [RE-INDEXING COMPLETE] ---');
  console.log(`Tracks Reconciled: ${updatedCount}/${tracks.length}`);
  console.log(`Real Genres Found: ${genreCount}`);
  console.log('------------------------------');
  process.exit(0);
}

reindex().catch(err => {
  console.error('[CRITICAL] Metadata re-indexer failed:', err);
  process.exit(1);
});
