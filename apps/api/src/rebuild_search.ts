
import { PrismaClient } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';

const prisma = new PrismaClient();
const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

const INDEX_NAME = 'tracks';

async function rebuildSearch() {
  console.log('--- REBUILDING SEARCH INDEX ---');
  await prisma.$connect();
  
  const tracks = await prisma.track.findMany({ include: { artist: true, album: true } });
  console.log(`Syncing ${tracks.length} tracks to Elasticsearch...`);

  for (const t of tracks) {
    try {
      await esClient.index({
        index: INDEX_NAME,
        id: t.id,
        body: {
          id: t.id,
          title: t.title,
          artistName: t.artist.name,
          albumTitle: t.album?.title || 'Single',
          genre: t.genre || 'Unknown',
          releaseDate: t.releaseDate,
          isExplicit: t.isExplicit
        }
      });
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nFailed to index ${t.title}:`, err);
    }
  }

  console.log('\n--- SEARCH SYNC COMPLETE ---');
  await prisma.$disconnect();
}

rebuildSearch().catch(console.error);
