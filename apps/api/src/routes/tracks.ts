import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { SearchService } from '../services/searchService';
import { z } from 'zod';

const createTrackSchema = z.object({
  title: z.string().min(1),
  duration: z.number().int(),
  artistId: z.string().uuid(),
  albumId: z.string().uuid().optional(),
  audioUrl: z.string().url(),
  genre: z.string().optional(),
  isExplicit: z.boolean().default(false),
});

export const tracksRoutes = async (app: FastifyInstance) => {
  app.post('/', {
    onRequest: [app.authenticate]
  }, async (request, reply) => {
    // Only ARTIST or ADMIN can upload (simple check for now)
    if (request.user.role === 'USER') {
      return reply.status(403).send({ error: 'Permission denied' });
    }

    const data = createTrackSchema.parse(request.body);
    
    const track = await prisma.track.create({
      data: {
        title: data.title,
        duration: data.duration,
        audioUrl: data.audioUrl,
        isExplicit: data.isExplicit,
        artist: { connect: { id: data.artistId } },
        ...(data.albumId && { album: { connect: { id: data.albumId } } }),
      },
      include: {
        artist: true,
      }
    });

    // Index in Elasticsearch for instant search
    await SearchService.indexTrack({
      id: track.id,
      title: track.title,
      artistName: track.artist.name,
      genre: data.genre || 'Unknown',
      isExplicit: track.isExplicit,
    });

    return { track };
  });

  app.get('/', async () => {
    return prisma.track.findMany({
      include: { artist: true, album: true }
    });
  });
};
