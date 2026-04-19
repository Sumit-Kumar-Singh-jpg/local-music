import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { z } from 'zod';

export const adminRoutes = async (app: FastifyInstance) => {
  // Get dashboard stats
  app.get('/stats', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const [userCount, trackCount, artistCount, albumCount] = await Promise.all([
      prisma.user.count(),
      prisma.track.count(),
      prisma.artistProfile.count(),
      prisma.album.count(),
    ]);

    const totalPlays = await prisma.track.aggregate({
      _sum: { playCount: true },
    });

    return {
      stats: {
        totalUsers: userCount,
        totalTracks: trackCount,
        totalArtists: artistCount,
        totalAlbums: albumCount,
        totalPlays: totalPlays._sum.playCount || 0,
      },
    };
  });

  // Get recent users
  app.get('/users', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { limit } = z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
    }).parse(request.query);

    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    });

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.profile?.displayName || u.username,
        email: u.email,
        username: u.username,
        role: u.role,
        billingTier: u.billingTier,
        createdAt: u.createdAt,
      })),
    };
  });
};
