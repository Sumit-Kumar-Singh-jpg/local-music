# Production Dockerfile for LocalMusic API
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building (prisma, tsbuild)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate --schema src/db/prisma/schema.prisma

# Build the API
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files and node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
# We need production node_modules
RUN npm install --omit=dev

# Prisma client is needed in runner
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3001

CMD ["node", "dist/server.js"]
