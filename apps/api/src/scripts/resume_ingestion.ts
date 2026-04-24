import { prisma } from '../db/client';
import { DownloaderService } from '../services/downloaderService';

/**
 * RESUME INGESTION SCRIPT
 * -----------------------
 * Found a lot of tracks are 404 because ingestion tasks failed.
 * This script identifies failed tasks and restarts them using the
 * newly hardened downloader (with FFmpeg path).
 */

async function main() {
  console.log('--- [RESUME INGESTION] Starting Recovery ---');

  // 1. Find FAILED or STOPPED tasks
  const tasks = await prisma.ingestionTask.findMany({
    where: {
      status: { in: ['FAILED', 'STOPPED', 'RUNNING'] }
    }
  });

  console.log(`Found ${tasks.length} tasks needing attention.`);

  const uniqueUrls = Array.from(new Set(tasks.map(t => t.url)));
  console.log(`Working with ${uniqueUrls.length} unique playlist URLs.`);

  for (const url of uniqueUrls) {
    try {
      console.log(`Triggering resume for playlist: ${url}`);
      await DownloaderService.downloadPlaylist(url);
      console.log(`[QUEUED] Resume initiated.`);
    } catch (err) {
      console.error(`[CRITICAL] Failed to trigger resume for ${url}: ${err}`);
    }
  }

  console.log('\n--- [RECOVERY COMPLETE] All tasks re-queued ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
