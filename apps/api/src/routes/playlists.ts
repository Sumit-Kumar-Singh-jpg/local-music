import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { z } from 'zod';

export const playlistRoutes = async (app: FastifyInstance) => {
  // List user's playlists (for now, return a curated set from tracks)
  app.get('/', {
    onRequest: [app.authenticate],
  }, async () => {
    // Build playlists from existing albums 
    const albums = await prisma.album.findMany({
      include: { artist: true, tracks: true },
      take: 10,
    });
    const playlists = albums.map((a) => ({
      id: a.id,
      name: a.title,
      description: `By ${a.artist.name}`,
      coverArt: a.coverArt,
      trackCount: a.tracks.length,
      createdAt: a.releaseDate,
    }));
    return { playlists };
  });

  // Get a specific playlist (album-based)
  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { include: { artist: true } },
      },
    });
    if (!album) {
      return reply.status(404).send({ error: 'Playlist not found' });
    }
    return {
      playlist: {
        id: album.id,
        name: album.title,
        description: `By ${album.artist.name}`,
        coverArt: album.coverArt,
        trackCount: album.tracks.length,
        tracks: album.tracks,
        artist: album.artist,
        createdAt: album.releaseDate,
      },
    };
  });

  // Create playlist (stub for now)
  app.post('/', {
    onRequest: [app.authenticate],
  }, async (request) => {
    const { name, description } = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }).parse(request.body);
    return {
      playlist: {
        id: `pl-${Date.now()}`,
        name,
        description: description || '',
        coverArt: null,
        trackCount: 0,
        createdAt: new Date().toISOString(),
      },
    };
  });
};
