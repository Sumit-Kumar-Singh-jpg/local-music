import { prisma } from '../db/client';
import { SearchService } from '../services/searchService';

async function reindexAll() {
  console.log('--- Starting Global Reindex ---');
  
  // 1. Reindex Tracks
  const tracks = await prisma.track.findMany({
    include: {
      artist: true,
      album: true,
    }
  });
  
  console.log(`Found ${tracks.length} tracks to index...`);
  
  let trackSuccess = 0;
  for (const track of tracks) {
    try {
      await SearchService.indexTrack({
        id: track.id,
        title: track.title,
        artistName: track.artist.name,
        albumTitle: track.album?.title || 'Single',
        releaseDate: track.releaseDate,
        isExplicit: track.isExplicit,
        cover: track.coverUrl || track.album?.coverArt,
      });
      trackSuccess++;
    } catch (err) {
      console.error(`Failed to index track ${track.title}:`, err);
    }
  }
  
  // 2. Reindex Artists
  const artists = await prisma.artistProfile.findMany();
  console.log(`Found ${artists.length} artists to index...`);
  
  let artistSuccess = 0;
  for (const artist of artists) {
    try {
      await SearchService.indexArtist({
        id: artist.id,
        name: artist.name,
        bio: artist.bio,
        isVerified: artist.isVerified,
      });
      artistSuccess++;
    } catch (err) {
      console.error(`Failed to index artist ${artist.name}:`, err);
    }
  }

  console.log('--- Reindex Summary ---');
  console.log(`Tracks: ${trackSuccess}/${tracks.length} indexed successfully.`);
  console.log(`Artists: ${artistSuccess}/${artists.length} indexed successfully.`);
}

reindexAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal Reindex Error:', err);
    process.exit(1);
  });
