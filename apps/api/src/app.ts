import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import path from 'path';
import { musicRoutes } from './routes/music';
import { authRoutes } from './routes/auth';
import { AuthService } from './services/authService';
import { searchRoutes } from './routes/search';
import { tracksRoutes } from './routes/tracks';
import { artistsRoutes } from './routes/artists';
import { libraryRoutes } from './routes/library';
import { playlistRoutes } from './routes/playlists';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin';
import db from './plugins/db';
import swagger from './plugins/swagger';
import sockets from './plugins/sockets';
import { prisma } from './db/client';

export const buildApp = async () => {
  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
      },
    },
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // 1. Security Baseline
  if (!process.env.JWT_SECRET) {
    app.log.warn('CRITICAL: JWT_SECRET environment variable is missing. Authentication will fail.');
  }

  await app.register(helmet, {
    contentSecurityPolicy: false, // Set to true for strict production CSP
  });

  await app.register(rateLimit, {
    max: 10000,
    timeWindow: '1 minute',
  });

  const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true;
  await app.register(cors, { 
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'x-request-id'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  });
  
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'FALLBACK_ONLY_FOR_DEV_DO_NOT_USE_IN_PROD',
  });

  // 2. Static Assets
  await app.register(staticPlugin, {
    root: path.join(__dirname, '../media'),
    prefix: '/api/media/',
  });

  // 3. Auth Decorator
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      
      const user = await AuthService.validateUser(request.user.userId);
      if (!user) {
        return reply.status(401).send({ error: 'User not found' });
      }
      if (!user.isApproved) {
        return reply.status(403).send({ error: 'Account pending approval by admin' });
      }
    } catch (err) {
      reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });

  // 4. Hooks
  app.addHook('onRequest', async (request) => {
    // correlation-id is handled by fastify automatically via requestIdHeader
    // but we can log it explicitly if needed
  });

  // 5. Database & Documentation
  await app.register(db);
  await app.register(swagger);
  await app.register(sockets);

  // 6. Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(musicRoutes, { prefix: '/api/music' });
  await app.register(searchRoutes, { prefix: '/api/search' });
  await app.register(tracksRoutes, { prefix: '/api/tracks' });
  await app.register(artistsRoutes, { prefix: '/api/artists' });
  await app.register(libraryRoutes, { prefix: '/api/library' });
  await app.register(playlistRoutes, { prefix: '/api/playlists' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // 7. Routes - Root
  app.get('/', async (request, reply) => {
    return { 
      message: 'Solaris Music Platform API', 
      status: 'online', 
      docs: '/api/docs' 
    };
  });

  // 8. Health & Diagnostics
  app.get('/health', async (request, reply) => {
    try {
      const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'UP').catch(() => 'DOWN');
      
      const isHealthy = dbStatus === 'UP';
      const status = isHealthy ? 200 : 503;

      return reply.status(status).send({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: dbStatus,
          api: 'UP',
        }
      });
    } catch (err) {
      return reply.status(503).send({ status: 'unhealthy', error: 'Internal health check failure' });
    }
  });

  return app;
};
