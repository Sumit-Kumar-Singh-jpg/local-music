import { FastifyInstance } from 'fastify';
import { MusicService } from '../services/musicService';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const musicRoutes = async (app: FastifyInstance) => {
  app.get('/trending', async (request, reply) => {
    const tracks = await MusicService.getTrending();
    return { tracks };
  });

  app.get('/new-releases', async (request, reply) => {
    const tracks = await MusicService.getNewReleases();
    return { tracks };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const track = await MusicService.getTrackById(id);
    if (!track) return reply.status(404).send({ error: 'Track not found' });
    return { track };
  });

  app.post('/:id/play', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await MusicService.incrementPlayCount(id);
    return { success: true };
  });
};
