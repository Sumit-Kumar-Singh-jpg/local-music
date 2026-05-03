# 🎵 LocalMusic Platform

## Overview
LocalMusic is a completely free, feature-rich music streaming monorepo built for high performance and community-driven music access. Designed as a sustainable alternative to Spotify Premium, it features no ads, no paywalls, and no compromises on audio quality.

## ✨ Features
- **Cross-Platform**: Seamless experience across Web (React) and Mobile (React Native).
- **Enterprise Data Layer**: Polyglot persistence using Postgres, Cassandra, and Neo4j.
- **Lightning Search**: Elasticsearch integration for instant track and artist discovery.
- **Cloud-Native**: Infrastructure as code using Docker, Kubernetes, and Terraform.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TypeScript, Zustand, React Native (Expo)
- **Backend**: Fastify, Prisma, PostgreSQL, Redis, Elasticsearch, Cassandra, Neo4j
- **Infrastructure**: Docker, Kubernetes, Turborepo

## 🚀 Installation & Usage
1. **Prerequisites**: Node.js v24+, npm 11+, Docker
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Servers**:
   - **Backend API**: `npm run dev --filter @local-music/api`
   - **Web Client**: `npm run dev --filter @local-music/web`

## 🔮 Future Improvements
- AI-driven personalized playlist generation.
- Offline listening mode for the mobile application.
