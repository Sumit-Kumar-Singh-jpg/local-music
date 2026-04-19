# 🎵 LOCAL MUSIC

A completely free, feature-rich music streaming monorepo built for high performance and community-driven music access. Designed as a sustainable alternative to Spotify Premium.

---

## 🚀 Vision
Our mission is to make high-quality music streaming accessible to everyone, everywhere, for free. No ads on core features, no paywalls, and no compromises on audio quality.

---

## 🏗️ Project Structure
```
./
├── apps/
│   ├── web/        # React + Vite web player (Frontend)
│   ├── mobile/     # Expo React Native app (Frontend)
│   └── api/        # Fastify REST API (Backend)
├── packages/
│   ├── shared/     # Shared TypeScript types
│   └── ui/         # Design tokens + base components
├── infra/          # Docker, Kubernetes, Terraform
└── .github/        # CI/CD workflows
```

---

## 📡 Default Port Mapping
The following ports are used across the development environment to ensure service isolation:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Backend API** | `3001` | Main Fastify API server |
| **Web Frontend** | `3000` | Vite Web Application |
| **Mobile (Metro)** | `8081` | Expo/React Native bundler |
| **CockroachDB** | `26257` | Primary SQL Database |
| **Keycloak (Auth)**| `8080` | Identity and Access Management |
| **Elasticsearch** | `9200` | Catalogue Search Engine |
| **Cassandra** | `9042` | Listening History & Metrics |
| **Neo4j** | `7474` | Social Graph Database |
| **Redis** | `6379` | Cache & Session Store |

---

## 🛠️ Tech Stack
| Layer    | Technology                          |
|----------|-------------------------------------|
| **Web**  | React, Vite, TypeScript, Zustand    |
| **Mobile**| Expo, React Native, TypeScript      |
| **API**  | Fastify, Prisma, PostgreSQL, Redis  |
| **Search**| Elasticsearch                       |
| **Infra** | Docker, Kubernetes, Terraform, AWS  |
| **Monorepo**| npm workspaces, Turborepo        |

---

## ⚡ Getting Started
1. **Prerequisites**: Node.js v24+, npm 11+
2. **Install Dependencies**: 
   ```bash
   npm install
   ```
3. **Run Development**:
   - **Backend**: `npm run dev --filter @local-music/api`
   - **Web**: `npm run dev --filter @local-music/web`

---

## 📄 License
MIT. Check the [LocalMusic_PRD.md](./LocalMusic_PRD.md) for detailed requirements and specifications.
