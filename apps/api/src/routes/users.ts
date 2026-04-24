import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { z } from 'zod';

export const userRoutes = async (app: FastifyInstance) => {
  // Get current user profile
  app.get('/me', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: (request as any).user.userId },
      include: { profile: true, artistProfile: true },
    });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return { user };
  });

  // Update current user profile
  app.put('/me', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const updates = z.object({
      displayName: z.string().min(1).optional(),
      avatarUrl: z.string().optional(),
    }).parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: (request as any).user.userId },
      include: { profile: true },
    });
    if (!user || !user.profile) {
      return reply.status(404).send({ error: 'User not found' });
    }

    await prisma.profile.update({
      where: { id: user.profile.id },
      data: updates,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: (request as any).user.userId },
      include: { profile: true, artistProfile: true },
    });

    return { user: updatedUser };
  });
};
