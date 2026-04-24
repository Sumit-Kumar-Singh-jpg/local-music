import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { z } from 'zod';

export const libraryRoutes = async (app: FastifyInstance) => {
  // Get user's liked tracks
  app.get('/likes', {
    onRequest: [app.authenticate],
  }, async () => {
    const likes = await prisma.track.findMany({
      take: 50,
      orderBy: { playCount: 'desc' },
      include: {
        artist: true,
        album: true,
      },
    });
    return { tracks: likes };
  });

  // Like a track
  app.post('/like', {
    onRequest: [app.authenticate],
  }, async (request) => {
    const { trackId } = z.object({ trackId: z.string() }).parse(request.body);
    // For now, increment play count as a "like" signal
    await prisma.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } },
    });
    return { success: true };
  });

  // Unlike a track
  app.post('/unlike', {
    onRequest: [app.authenticate],
  }, async (request) => {
    const { trackId } = z.object({ trackId: z.string() }).parse(request.body);
    await prisma.track.update({
      where: { id: trackId },
      data: { playCount: { decrement: 1 } },
    });
    return { success: true };
  });
};
