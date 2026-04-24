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
  app.get('/trending', async () => {
    const tracks = await MusicService.getTrending();
    return { tracks };
  });

  app.get('/new-releases', async () => {
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
    } catch (_err) { /* metadata not available */ }
    return reply.status(404).send({ error: 'No cover' });
  });

  app.get('/:id/stream', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    
    try {
      const storage = await MusicService.getStorageCached(id);
      if (!storage) {
        request.log.error(`[Stream FAILED] Track ID ${id} not found in SongStorage DB`);
        return reply.status(404).send({ error: 'Track storage not found' });
      }

      let filePath = storage.filePath;
      // Ensure absolute path
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(__dirname, '../../media', filePath);
      }
      
      filePath = path.normalize(filePath);

      if (!fs.existsSync(filePath)) {
        request.log.warn(`[Stream 404] File missing on disk at: ${filePath}`);
        
        // Fallback probe for extensions if path is stale
        const baseWithoutExt = filePath.replace(/\.[^/.]+$/, "");
        const exts = ['.mp3', '.flac', '.m4a', '.mp4'];
        let found = false;
        for (const ext of exts) {
          const probedPath = baseWithoutExt + ext;
          if (fs.existsSync(probedPath)) {
            filePath = probedPath;
            found = true;
            // Update DB for future requests
            await prisma.songStorage.update({ where: { id: storage.id }, data: { filePath: probedPath } });
            
            // Invalidate cache
            const { MusicService: Service } = await import('../services/musicService');
            Service.clearStorageCache(id);
            
            request.log.info(`[Stream HEALED] Found and updated path for: ${path.basename(probedPath)}`);
            break;
          }
        }
        if (!found) {
          request.log.error(`[Stream FAILED] Audio file definitively missing at: ${filePath}`);
          return reply.status(404).send({ error: 'Audio file missing on disk' });
        }
      }

      // Calculate path relative to 'media' directory for fastify-static
      // Root is registered as apps/api/media
      const mediaRoot = path.resolve(__dirname, '../../media');
      const relativePath = path.relative(mediaRoot, filePath);
      
      // Explicit MIME handling for .m4a and better range support
      if (filePath.endsWith('.m4a')) {
        reply.header('Content-Type', 'audio/mp4');
      } else if (filePath.endsWith('.flac')) {
        reply.header('Content-Type', 'audio/flac');
      }

      request.log.info(`[STREAM] Serving relative: ${relativePath}`);
      return reply.header('Accept-Ranges', 'bytes').sendFile(relativePath);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Internal server error during streaming' });
    }
  });

  app.get('/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const track = await MusicService.getTrackById(id);
    return { track };
  });
};
