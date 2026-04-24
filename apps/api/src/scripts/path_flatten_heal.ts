import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';

/**
 * Universal Path Flatten & Heal
 * ----------------------------
 * 1. Scans workspace for audio files.
 * 2. Flattens storage to avoid Windows MAX_PATH issues.
 * 3. Re-links DB records to verified files.
 */
async function healAndFlatten() {
  console.log('--- [PATH FLATTEN & HEAL] Starting ---');
  
  const tracks = await prisma.track.findMany({ include: { storage: true } });
  const mediaRoot = path.resolve(__dirname, '../../media/music');
  
  if (!fs.existsSync(mediaRoot)) fs.mkdirSync(mediaRoot, { recursive: true });

  // 1. Discovery Phase: Find ALL audio files in the project
  const projectRoot = path.resolve(__dirname, '../../../../');
  const foundFiles: string[] = [];

  function scan(dir: string) {
    if (dir.includes('node_modules') || dir.includes('.git')) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          scan(full);
        } else if (['.mp3', '.flac', '.m4a', '.wav'].includes(path.extname(item).toLowerCase())) {
          foundFiles.push(full);
        }
      }
    } catch {}
  }

  console.log('Scanning project for audio files...');
  scan(projectRoot);
  console.log(`Found ${foundFiles.length} audio files on disk.`);

  let healedCount = 0;

  // 2. Reconciliation Phase
  for (const track of tracks) {
    const safeTitle = track.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Find best match among found files
    const match = foundFiles.find(f => {
      const base = path.basename(f).toLowerCase().replace(/[^a-z0-9]/g, '');
      return base.includes(safeTitle) || safeTitle.includes(base);
    });

    if (match) {
      const ext = path.extname(match);
      const newFileName = `${track.title.replace(/[/\\?%*:|"<>]/g, '-')} - ${track.id.slice(0, 8)}${ext}`;
      const newPath = path.join(mediaRoot, newFileName);

      // Move file if not already there
      if (path.resolve(match) !== path.resolve(newPath)) {
        try {
          fs.copyFileSync(match, newPath);
          console.log(`[MOVED] ${track.title} -> ${newFileName}`);
        } catch (err) {
          console.error(`[MOVE FAILED] ${track.title}:`, err);
          continue;
        }
      }

      // Update DB
      await prisma.songStorage.upsert({
        where: { trackId: track.id },
        update: { filePath: newPath },
        create: { trackId: track.id, filePath: newPath, storageType: 'LOCAL' }
      });
      
      healedCount++;
    } else {
      console.warn(`[NOT FOUND] ${track.title}`);
    }
  }

  console.log('\n--- [RECONCILIATION SUMMARY] ---');
  console.log(`Tracks Processed: ${tracks.length}`);
  console.log(`Tracks Healed:    ${healedCount}`);
  console.log('--------------------------------');
  
  process.exit(0);
}

healAndFlatten().catch(err => {
  console.error('[CRITICAL] Healer failed:', err);
  process.exit(1);
});
