import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { SearchService } from '../services/searchService';
import { z } from 'zod';

const createArtistSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().url().optional(),
});

export const artistsRoutes = async (app: FastifyInstance) => {
  app.post('/', {
    onRequest: [app.authenticate]
  }, async (request, reply) => {
    // Only ADMIN or potential Artist users can create
    if (request.user.role === 'USER') {
      return reply.status(403).send({ error: 'Permission denied' });
    }

    const data = createArtistSchema.parse(request.body);
    
    const artist = await prisma.artistProfile.create({
      data: {
        name: data.name,
        bio: data.bio,
        image: data.image,
        user: { connect: { id: request.user.userId } },
      }
    });

    await SearchService.indexArtist({
      id: artist.id,
      name: artist.name,
      bio: artist.bio,
      isVerified: artist.isVerified,
    });

    return { artist };
  });

  app.get('/', async () => {
    return prisma.artistProfile.findMany();
  });

  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: { tracks: true, albums: true }
    });
    if (!artist) return reply.status(404).send({ error: 'Artist not found' });
    return { artist };
  });
};
