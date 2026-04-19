import { FastifyInstance } from 'fastify';
import { MusicService } from '../services/musicService';
import { prisma } from '../db/client';
import { z } from 'zod';

import fs from 'fs';
import path from 'path';

const idParamSchema = z.object({
  id: z.string(),
});

export const musicRoutes = async (app: FastifyInstance) => {
  // Existing routes...
  app.get('/trending', async (request, reply) => {
    const tracks = await MusicService.getTrending();
    return { tracks };
  });

  app.get('/new-releases', async (request, reply) => {
    const tracks = await MusicService.getNewReleases();
    return { tracks };
  });

  // Range-based Streaming
  app.get('/:id/stream', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    
    // 1. Get storage info from PostgreSQL
    const storage = await prisma.songStorage.findUnique({
      where: { trackId: id }
    });

    if (!storage || !fs.existsSync(storage.filePath)) {
      return reply.status(404).send({ error: 'Track file not found' });
    }

    const stat = fs.statSync(storage.filePath);
    const fileSize = stat.size;
    const range = (request.headers as any).range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(storage.filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/flac', // Or detect from extension
      };
      reply.raw.writeHead(206, head);
      file.pipe(reply.raw);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/flac',
      };
      reply.raw.writeHead(200, head);
      fs.createReadStream(storage.filePath).pipe(reply.raw);
    }
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
