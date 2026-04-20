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
  app.get('/trending', async (request, reply) => {
    const tracks = await MusicService.getTrending();
    return { tracks };
  });

  app.get('/new-releases', async (request, reply) => {
    const tracks = await MusicService.getNewReleases();
    return { tracks };
  });

  app.get('/:id/cover', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
    if (!storage || !fs.existsSync(storage.filePath)) return reply.status(404).send({ error: 'Not found' });
    
    try {
      const { parseFile } = await import('music-metadata');
      const metadata = await parseFile(storage.filePath);
      const picture = metadata.common.picture?.[0];
      if (picture) {
        reply.header('Content-Type', picture.format);
        return reply.send(picture.data);
      }
    } catch {}
    return reply.status(404).send({ error: 'No cover' });
  });

  app.get('/:id/stream', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    
    try {
      const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
      if (!storage) return reply.status(404).send({ error: 'Track storage not found' });

      let filePath = storage.filePath;
      if (!fs.existsSync(filePath)) {
        // Fallback probe for extensions if path is stale
        const exts = ['.mp3', '.flac', '.m4a', '.mp4'];
        let found = false;
        for (const ext of exts) {
          if (fs.existsSync(filePath + ext)) {
            filePath += ext;
            found = true;
            // Update DB for future requests
            await prisma.songStorage.update({ where: { id: storage.id }, data: { filePath } });
            break;
          }
        }
        if (!found) return reply.status(404).send({ error: 'Audio file missing on disk' });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = request.headers.range;

      // Determine MIME type based on extension
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'audio/mpeg';
      if (ext === '.flac') mimeType = 'audio/flac';
      if (ext === '.m4a') mimeType = 'audio/mp4';
      if (ext === '.ogg') mimeType = 'audio/ogg';
      if (ext === '.wav') mimeType = 'audio/wav';

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        
        reply
          .status(206)
          .headers({
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600',
          })
          .send(file);
      } else {
        reply
          .status(200)
          .headers({
            'Content-Length': fileSize,
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
          })
          .send(fs.createReadStream(filePath));
      }
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Internal server error during streaming' });
    }
  });

  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const track = await MusicService.getTrackById(id);
    return { track };
  });
};
