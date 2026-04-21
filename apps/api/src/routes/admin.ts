import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { z } from 'zod';

export const adminRoutes = async (app: FastifyInstance) => {
  // Get dashboard stats
  app.get('/stats', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const [userCount, trackCount, artistCount, albumCount] = await Promise.all([
      prisma.user.count({
        where: { NOT: { email: { endsWith: '@sys.loc' } } }
      }),
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
      where: {
        NOT: {
          email: { endsWith: '@sys.loc' }
        }
      },
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
        isApproved: u.isApproved,
        billingTier: u.billingTier,
        createdAt: u.createdAt,
      })),
    };
  });

  // Approve User
  app.post('/users/:id/approve', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    // Role check
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
    });

    return { success: true, user: { id: user.id, isApproved: user.isApproved } };
  });

  // Add Song (Controlled Ingestion)
  app.post('/add-song', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    // Role check
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const ingestionSchema = z.object({
      source: z.enum(['jamendo', 'audius', 'spotify']),
      url: z.string().url(),
      trackMetadata: z.object({
        title: z.string(),
        artistId: z.string(),
        albumId: z.string().optional(),
        duration: z.number(),
      })
    });

    const { source, url, trackMetadata } = ingestionSchema.parse(request.body);

    // 1. Create Track Metadata Entry
    const track = await prisma.track.create({
      data: {
        title: trackMetadata.title,
        duration: trackMetadata.duration,
        artistId: trackMetadata.artistId,
        albumId: trackMetadata.albumId,
        audioUrl: '', // Will be filled after download
        playCount: 0,
      }
    });

    // 2. Trigger Download (Async)
    const { DownloaderService } = await import('../services/downloaderService');
    
    // We don't await here if we want backgrounding, but for admin control we might want feedback
    try {
      if (source === 'spotify') {
        await DownloaderService.downloadSpotify(url, track.id);
      } else {
        await DownloaderService.downloadStream(url, track.id, `${track.id}.mp3`);
      }
      
      // Update track with final URL (or local identifier)
      await prisma.track.update({
        where: { id: track.id },
        data: { audioUrl: `/api/music/${track.id}/stream` }
      });

      return { success: true, trackId: track.id };
    } catch (error: any) {
      return reply.status(500).send({ error: `Download failed: ${error.message}` });
    }
  });

  // Add Playlist (Bulk Ingestion)
  app.post('/add-playlist', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const { url } = z.object({ url: z.string().url() }).parse(request.body);

    const { DownloaderService } = await import('../services/downloaderService');
    
    // Playlists are handled asynchronously to avoid timeout
    DownloaderService.downloadPlaylist(url)
      .then(() => console.log(`Playlist download finished for ${url}`))
      .catch(err => console.error(`Playlist download failed for ${url}:`, err));

    return { 
      success: true, 
      message: 'Playlist download started in background. Tracks will be indexed once processed.' 
    };
  });

  // Remove User
  app.delete('/users/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    
    // Prevent admin from deleting themselves (optional but safe)
    if (id === request.user.userId) {
      return reply.status(400).send({ error: 'Cannot delete your own admin account' });
    }

    await prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted successfully' };
  });

  // Get Ingestion Tasks
  app.get('/tasks', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Admin access required' });
    const tasks = await prisma.ingestionTask.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { tasks };
  });

  // Stop Ingestion Task
  app.post('/tasks/:id/stop', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Admin access required' });
    const { id } = z.object({ id: z.string() }).parse(request.params);
    
    const task = await prisma.ingestionTask.findUnique({ where: { id } });
    if (!task) return reply.status(404).send({ error: 'Task not found' });
    
    if (task.pid && task.status === 'RUNNING') {
      try {
        if (process.platform === 'win32') {
          const { exec } = await import('child_process');
          exec(`taskkill /pid ${task.pid} /f /t`, (err) => {
            if (err) console.error('Taskkill error:', err);
          });
        } else {
          process.kill(task.pid, 'SIGINT'); // Send SIGINT to allow SpotiFLAC cleanup
        }
      } catch (err) {
        console.error('Failed to kill process:', err);
      }
    }

    await prisma.ingestionTask.update({
      where: { id },
      data: { status: 'STOPPED', pid: null }
    });

    return { success: true, message: 'Task stopped' };
  });

  // Get Ingested Content
  app.get('/content', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Admin access required' });
    const tracks = await prisma.track.findMany({
      include: {
        artist: true,
        album: true,
        storage: true
      },
      orderBy: { releaseDate: 'desc' }
    });
    return { tracks };
  });

  // Remove Song (Storage + Metadata)
  app.delete('/songs/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    
    // 1. Find storage info
    const storage = await prisma.songStorage.findUnique({
      where: { trackId: id }
    });

    // 2. Delete local file if it exists
    const { default: fs } = await import('fs');
    if (storage && storage.storageType === 'LOCAL' && fs.existsSync(storage.filePath)) {
      try {
        fs.unlinkSync(storage.filePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    // 3. Delete from DB (Cascade will handle SongStorage if set up, or we do it manually)
    await prisma.track.delete({ where: { id } });

    return { success: true, message: 'Song and file deleted successfully' };
  });

  // Telemetry Ingestion (Public-ish but categorized under admin for reporting)
  app.post('/telemetry', async (request, reply) => {
    const telemetrySchema = z.object({
      trackId: z.string().optional(),
      error: z.string(),
      type: z.string().optional(),
      userAgent: z.string().optional(),
      timestamp: z.string().optional(),
    });

    const data = telemetrySchema.parse(request.body);
    
    // Structured log for ELK/OpenSearch ingestion
    app.log.error({
      msg: 'Playback failure telemetry received',
      ...data,
      remoteIp: request.ip,
      requestId: request.id,
    });

    return { received: true };
  });

  // Maintenance: Reindex Search
  app.post('/maintenance/reindex', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Admin access required' });
    
    const { spawn } = await import('child_process');
    const scriptPath = path.resolve(__dirname, '../scripts/reindex.ts');
    
    const proc = spawn('npx', ['tsx', scriptPath], { detached: true, stdio: 'ignore' });
    proc.unref();

    return { success: true, message: 'Global reindexing started in background.' };
  });

  // Maintenance: Sync Storage
  app.post('/maintenance/sync-storage', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Admin access required' });
    
    const { spawn } = await import('child_process');
    const scriptPath = path.resolve(__dirname, '../scripts/repair-storage.ts');
    
    const proc = spawn('npx', ['tsx', scriptPath], { detached: true, stdio: 'ignore' });
    proc.unref();

    return { success: true, message: 'Storage reconciliation started in background.' };
  });
};
