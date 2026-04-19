# 🎵 Local Music

A full-stack music streaming monorepo built with React (web), Expo (mobile), and Fastify (API).

## Structure

```
local-music/
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

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Web      | React, Vite, TypeScript, Zustand    |
| Mobile   | Expo, React Native, TypeScript      |
| API      | Fastify, Prisma, PostgreSQL, Redis  |
| Search   | Elasticsearch                       |
| Infra    | Docker, Kubernetes, Terraform, AWS  |
| Monorepo | pnpm workspaces, Turborepo          |

## Getting Started

```bash
pnpm install
pnpm dev
```

## License

MIT
