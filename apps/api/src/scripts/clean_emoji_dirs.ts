import fs from 'fs';
import path from 'path';
import { prisma } from '../db/client';

async function renameEmojiDirs() {
  const musicDir = path.resolve('media/music');
  const items = fs.readdirSync(musicDir);

  for (const item of items) {
    const full = path.join(musicDir, item);
    if (fs.statSync(full).isDirectory()) {
        // If it has emojis or non-ASCII
        if (/[^\x20-\x7E]/.test(item)) {
            const cleanName = item.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '_').trim() || 'cleaned_folder';
            const newPath = path.join(musicDir, cleanName);
            
            console.log(`Renaming folder: ${item} -> ${cleanName}`);
            fs.renameSync(full, newPath);

            // Update all tracks in DB that point to this folder
            const storages = await prisma.songStorage.findMany({
                where: { filePath: { contains: item } }
            });

            for (const s of storages) {
                const updatedPath = s.filePath.replace(item, cleanName);
                console.log(`  Updating DB path for track ${s.trackId}`);
                await prisma.songStorage.update({
                    where: { id: s.id },
                    data: { filePath: updatedPath }
                });
            }
        }
    }
  }
}

renameEmojiDirs().then(() => {
    console.log('Done cleaning emoji directories.');
    process.exit(0);
});
