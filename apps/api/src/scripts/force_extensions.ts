import fs from 'fs';
import path from 'path';

function fixAll() {
  const musicDir = path.resolve('media/music');
  console.log('Scanning:', musicDir);
  let totalFiles = 0;

  function walk(dir: string) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else {
            totalFiles++;
            const ext = path.extname(item);
            if (!ext) {
                const newName = full + '.mp3';
                console.log(`[FIX] Renaming: ${item} -> ${item}.mp3`);
                fs.renameSync(full, newName);
            } else {
                console.log(`[SKIP] Already has extension: ${item}`);
            }
        }
    }
  }
  walk(musicDir);
  console.log(`Processed ${totalFiles} files.`);
}

fixAll();
