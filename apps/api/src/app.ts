import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import staticPlugin from '@fastify/static';
import path from 'path';
import { musicRoutes } from './routes/music';
import { authRoutes } from './routes/auth';
import { searchRoutes } from './routes/search';
import { tracksRoutes } from './routes/tracks';
import { artistsRoutes } from './routes/artists';
import { libraryRoutes } from './routes/library';
import { playlistRoutes } from './routes/playlists';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin';
import db from './plugins/db';
import swagger from './plugins/swagger';

export const buildApp = async () => {
  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
      },
    },
  });

  // Plugins
  await app.register(cors, { origin: true });
  
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
  });

  await app.register(staticPlugin, {
    root: path.join(__dirname, '../media'),
    prefix: '/api/media/',
  });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  await app.register(db);
  await app.register(swagger);

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(musicRoutes, { prefix: '/api/music' });
  await app.register(searchRoutes, { prefix: '/api/search' });
  await app.register(tracksRoutes, { prefix: '/api/tracks' });
  await app.register(artistsRoutes, { prefix: '/api/artists' });
  await app.register(libraryRoutes, { prefix: '/api/library' });
  await app.register(playlistRoutes, { prefix: '/api/playlists' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
};
