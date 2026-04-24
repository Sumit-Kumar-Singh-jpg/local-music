import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';

/**
 * Universal Path Healer
 * --------------------
 * High-performance data reconciliation script to fix 404 streaming errors.
 * Probes for missing extensions and validates file integrity on disk.
 */
async function universalHeal() {
  console.log('--- [UNIVERSAL HEAL] Starting Reconciliation ---');
  
  const storages = await prisma.songStorage.findMany();
  console.log(`Found ${storages.length} storage records to audit.`);

  let totalHealed = 0;
  let totalMissing = 0;
  let totalOk = 0;

  const exts = ['.mp3', '.flac', '.m4a', '.wav', '.mp4'];

  for (const storage of storages) {
    const rawPath = storage.filePath;
    
    // 1. Check if path already exists (Ideal case)
    if (fs.existsSync(rawPath)) {
      totalOk++;
      continue;
    }

    // 2. Probe extensions
    let healedPath: string | null = null;
    for (const ext of exts) {
      if (fs.existsSync(rawPath + ext)) {
        healedPath = rawPath + ext;
        break;
      }
      // Also check if path has a partial extension (like .mp instead of .mp3)
      // but usually it's just missing entirely.
    }

    if (healedPath) {
      console.log(`[HEALED] Extension found: ${path.basename(healedPath)}`);
      await prisma.songStorage.update({
        where: { id: storage.id },
        data: { filePath: healedPath }
      });
      totalHealed++;
    } else {
      // 3. Last Resort: Directory fuzzy match
      const dir = path.dirname(rawPath);
      const baseName = path.basename(rawPath).toLowerCase();
      
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const match = files.find(f => f.toLowerCase().includes(baseName));
        if (match) {
          const matchedPath = path.join(dir, match);
          console.log(`[HEALED] Directory match: ${match}`);
          await prisma.songStorage.update({
            where: { id: storage.id },
            data: { filePath: matchedPath }
          });
          totalHealed++;
        } else {
          console.error(`[STILL MISSING] ${path.basename(rawPath)}`);
          totalMissing++;
        }
      } else {
        console.error(`[DIR MISSING] ${dir}`);
        totalMissing++;
      }
    }
  }

  console.log('\n--- [HEAL SUMMARY] ---');
  console.log(`Total OK:     ${totalOk}`);
  console.log(`Total Healed: ${totalHealed}`);
  console.log(`Total Broken: ${totalMissing}`);
  console.log('----------------------');
  
  process.exit(0);
}

universalHeal().catch(err => {
  console.error('[CRITICAL] Healer failed:', err);
  process.exit(1);
});
