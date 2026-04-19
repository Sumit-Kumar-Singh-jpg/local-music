import { FastifyInstance } from 'fastify';
import { SearchService } from '../services/searchService';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1),
});

export const searchRoutes = async (app: FastifyInstance) => {
  app.get('/', async (request, reply) => {
    const { q } = searchQuerySchema.parse(request.query);
    const results = await SearchService.searchGlobal(q);
    return { results };
  });

  app.get('/tracks', async (request, reply) => {
    const { q } = searchQuerySchema.parse(request.query);
    const results = await SearchService.searchTracks(q);
    return { results };
  });
};
