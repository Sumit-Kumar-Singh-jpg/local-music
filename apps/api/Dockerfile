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

# Install system dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg
# Install Python dependencies for the downloader
RUN pip3 install --no-cache-dir requests yt-dlp mutagen --break-system-packages

WORKDIR /app

ENV NODE_ENV=production

# Copy built files and package definition
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy generated Prisma client (hoisted path)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy downloader source
COPY --from=builder /app/temp_spotiflac ./temp_spotiflac

EXPOSE 3001

CMD ["node", "dist/server.js"]
