import { FastifyInstance } from 'fastify';
import { SearchService } from '../services/searchService';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1),
  genre: z.string().optional(),
});

export const searchRoutes = async (app: FastifyInstance) => {
  app.get('/', async (request) => {
    const { q } = searchQuerySchema.parse(request.query);
    const results = await SearchService.searchGlobal(q);
    return { results };
  });

  app.get('/tracks', async (request) => {
    const { q, genre } = searchQuerySchema.parse(request.query);
    const results = await SearchService.searchTracks(q, genre);
    return { results };
  });

  app.get('/suggestions', async (request) => {
    const { q } = searchQuerySchema.parse(request.query);
    const results = await SearchService.getSuggestions(q);
    return { results };
  });
};
