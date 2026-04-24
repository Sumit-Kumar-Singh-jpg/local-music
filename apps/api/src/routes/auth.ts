import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
});

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', async (request, reply) => {
    const data = registerSchema.parse(request.body);
    
    // Check if user already exists by email or username independently
    const existingEmail = await AuthService.findUserByEmail(data.email);
    if (existingEmail) {
      return reply.status(400).send({ error: 'Email already registered' });
    }
    const existingUsername = await AuthService.findUserByUsername(data.username);
    if (existingUsername) {
      return reply.status(400).send({ error: 'Username already taken' });
    }

    const passwordHash = await AuthService.hashPassword(data.password);
    const user = await AuthService.createUser({
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash,
    });

    const token = AuthService.generateToken(user.id, user.role);
    return { user, token };
  });

  app.post('/login', async (request, reply) => {
    const { identifier, password } = loginSchema.parse(request.body);
    
    const user = await AuthService.validateUser(identifier);
    if (!user || !(await AuthService.comparePassword(password, user.passwordHash))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return reply.status(403).send({ error: 'Account pending approval by admin' });
    }

    const token = AuthService.generateToken(user.id, user.role);
    return { user, token };
  });

  app.post('/forgot-password', async (request) => {
    const { identifier } = z.object({ identifier: z.string() }).parse(request.body);
    
    // Attempt to lookup
    await AuthService.validateUser(identifier);
    // Deliberately return success whether found or not to prevent username enumeration attacks
    return { message: 'If an account exists, a reset link was sent.' };
  });

  app.get('/me', {
    onRequest: [app.authenticate]
  }, async (request) => {
    const user = await AuthService.validateUser(request.user.userId);
    return { user };
  });
};
