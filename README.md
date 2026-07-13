<h1 align="center">SAMS</h1>

<p align="center"><strong>Spatial Agent Management System</strong></p>
<p align="center"><em>Real-time 2D office visualization and agent management platform</em></p>

<!-- Badge repository: Lmz-23/spatial-agent-management-system (derived from the configured Git remote). -->
<p align="center">
  <a href="https://github.com/Lmz-23/spatial-agent-management-system/actions/workflows/ci.yml"><img alt="CI status" src="https://github.com/Lmz-23/spatial-agent-management-system/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Node.js 20 or newer" src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white">
  <img alt="TypeScript 5.4" src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white">
  <img alt="pnpm 8.15" src="https://img.shields.io/badge/pnpm-8.15-F69220?logo=pnpm&logoColor=white">
  <a href="https://github.com/Lmz-23/spatial-agent-management-system/pulls"><img alt="Pull requests welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

## Table of Contents

- [About](#about)
- [✨ Features](#-features)
- [🏗️ Architecture](#-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#-environment-variables)
- [📜 Available Scripts](#-available-scripts)
- [🔌 API Reference](#-api-reference)
- [🧪 Development](#-development)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## About

Spatial Agent Management System (SAMS) is a multi-tenant platform for visualizing and managing autonomous or human-operated agents inside a shared 2D virtual office. Each workspace provides an isolated view of its agents, tasks, positions, and activity, while a PixiJS-powered scene makes operational state easy to understand at a glance.

SAMS is designed for the real-time virtual-office use case: multiple clients join the same workspace, observe agents moving between locations, and receive synchronized status and task updates over WebSocket. A Fastify REST API handles persistent resources and authentication, while shared TypeScript contracts keep the browser and server aligned.

<a id="-features"></a>
## ✨ Features

- ✅ **Multi-tenant workspaces** — organize agents and tasks into independent workspace contexts.
- 🚀 **Real-time WebSocket synchronization** — propagate movement, lifecycle, assignment, and status events to connected workspace clients.
- 🎨 **Interactive 2D office scene** — render agents and office activity with PixiJS and `@pixi/react`.
- 🤖 **Agent roles and states** — Client-side agent roles (`ORQUESTADOR`, `CODER`, `REVIEWER`, `TESTER`) for visual differentiation in the 2D scene, combined with `IDLE`, `WALKING`, and `WORKING` states.
- 🔌 **REST API and WebSocket event contract** — combine resource-oriented HTTP operations with low-latency event delivery.
- 🔒 **JWT authentication** — protect resource endpoints and authenticated WebSocket connections.
- 🛡️ **Rate limiting** — apply HTTP request limits and per-client WebSocket message limits.
- 🧩 **Zod validation** — validate route payloads and parameters at runtime.
- ⚡ **Strict TypeScript end to end** — share types and constants through the `@sams/shared` workspace package.
- 🖥️ **Frontend-only launch (no backend):** Open `client/src` standalone — the PixiJS office scene renders with placeholder visuals, but agent data and real-time sync require the server.
- 🌱 **Prisma schema and demo seed** — provision a sample workspace, agents, and tasks for local development.

<a id="-architecture"></a>
## 🏗️ Architecture

SAMS uses a pnpm workspace monorepo. The frontend communicates with Fastify over HTTP for resource operations and over WebSocket for workspace-scoped real-time updates. Prisma provides the persistence boundary between the server and PostgreSQL.

```text
sams/
├── client/                       # React, Vite, PixiJS, and Zustand frontend
│   └── src/                      # UI, office scene, state, and API integration
├── server/                       # Fastify HTTP and WebSocket backend
│   ├── prisma/                   # Prisma schema and development seed
│   └── src/
│       ├── modules/              # Auth, workspaces, agents, tasks, WebSocket
│       ├── plugins/              # CORS, JWT auth, database, rate limit, WS
│       ├── schemas/              # Zod request validation
│       └── services/             # Simulation, movement, auth, pathfinding
├── packages/
│   └── shared/                   # @sams/shared types, constants, and contracts
├── docker/
│   └── docker-compose.yml        # Local PostgreSQL 16 service
├── .github/
│   └── workflows/ci.yml          # Lint, typecheck, test, and build workflow
├── pnpm-workspace.yaml           # Workspace package boundaries
└── package.json                  # Root scripts and package orchestration
```

```text
┌──────────────────────────┐       HTTP /api/*       ┌──────────────────────────┐
│ React + PixiJS client    │ ──────────────────────▶ │ Fastify server           │
│ Vite :5173               │ ◀────────────────────── │ Node.js :3000            │
│                          │       WS /ws/socket      │                          │
└────────────┬─────────────┘                          └────────────┬─────────────┘
             │                                                     │ Prisma
             └────────── @sams/shared contracts ───────────────────┤
                                                                   ▼
                                                      ┌──────────────────────────┐
                                                      │ PostgreSQL 16            │
                                                      │ Docker :5432             │
                                                      └──────────────────────────┘
```

| Package or path | Responsibility |
| --- | --- |
| `client/` | Presents the React application, renders the 2D office scene, maintains client state with Zustand, and consumes HTTP/WebSocket data. |
| `server/` | Exposes Fastify REST endpoints, authenticates requests, validates input, coordinates domain services, persists data through Prisma, and broadcasts workspace events. |
| `packages/shared/` | Publishes `@sams/shared`, the common TypeScript models, enums, constants, and socket event names used across packages. |
| `server/prisma/` | Defines the PostgreSQL data model and seeds representative development data. |
| `docker/` | Runs the local PostgreSQL 16 dependency; application containers are not currently provided. |
| `.github/workflows/` | Runs the CI quality gates for supported branches and pull requests. |

<a id="-tech-stack"></a>
## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| Language | TypeScript | 5.4 | Strictly typed client, server, and shared contracts |
| Runtime | Node.js | 20+ | Server and workspace tooling runtime |
| Runtime | pnpm workspaces | 8.15 | Dependency management and monorepo orchestration |
| Backend | Fastify | 4.28 | HTTP API and plugin-based server architecture |
| Backend | `@fastify/websocket` / `ws` | 10 / 8 | Real-time workspace connections |
| Backend | Zod | 4 | Runtime request and parameter validation |
| Backend | JSON Web Token | 9 | HTTP and WebSocket authentication |
| Backend | Pino | 9 | Structured application logging |
| Frontend | React | 18 | Component-based user interface |
| Frontend | Vite | 5 | Development server and production bundling |
| Frontend | PixiJS / `@pixi/react` | 7 | Hardware-accelerated 2D office rendering |
| Frontend | Zustand | 4 | Lightweight client state management |
| Database | PostgreSQL | 16 | Multi-tenant workspace, agent, and task persistence |
| Database | Prisma | 5.14 | Schema, generated client, and database tooling |
| Tooling | ESLint 8 + Prettier 3 (root); Biome 1.x (`server/`, `packages/shared/`) | Root / 0.3 | Linting and formatting across workspace packages — ESLint + Prettier at the root cover `client/`; Biome handles `server/` and `packages/shared/`. A test runner (Vitest/Jest) is **not** configured yet — see [Roadmap](#-roadmap). |
| CI/CD | GitHub Actions | Hosted | Lint, typecheck, test command, and build jobs |

<a id="-prerequisites"></a>
## 📋 Prerequisites

Install the following before running SAMS locally:

- [Node.js](https://nodejs.org/) **20 or newer**
- [pnpm](https://pnpm.io/) **8 or newer** (`corepack enable` is supported)
- [Docker](https://www.docker.com/) with Docker Compose
- [Git](https://git-scm.com/)

Confirm the main tool versions:

```bash
node --version
pnpm --version
docker compose version
git --version
```

<a id="-quick-start"></a>
## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Lmz-23/spatial-agent-management-system.git
cd spatial-agent-management-system
```

### 2. Install dependencies and create the local environment file

```bash
pnpm install
cp .env.example .env
```

> ⚠️ IMPORTANT: Edit the newly created `.env` file and update `DATABASE_URL` to match the docker-compose credentials:
> `postgresql://sams:sams_dev@localhost:5432/sams?schema=public`

For local development, also set `JWT_SECRET` to a private development value and keep it out of version control.

### 3. Load the environment variables (only if needed)

Prisma and the Fastify server typically load `.env` automatically. If you hit a `DATABASE_URL is not set` error on a later step, load the file manually for the current shell:

```bash
# Linux/macOS (POSIX-compatible shells):
set -a && source .env && set +a

# Windows (PowerShell):
Get-Content .env | ForEach-Object { if($_ -match '^([^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }
```

For cross-platform consistency prefer `node --env-file=.env` (Node 20+) or `dotenv-cli`.

### 4. Start PostgreSQL

```bash
docker compose -f docker/docker-compose.yml up -d
```

Optionally verify that the database container is healthy:

```bash
docker compose -f docker/docker-compose.yml ps
```

### 5. Generate the Prisma client, create the schema, and seed demo data

```bash
pnpm --filter server db:generate
pnpm --filter server db:push
pnpm --filter server db:seed
```

The seed command creates a sample workspace, three agents, and four tasks. It replaces existing data in the development database.

### 6. Start the development services

```bash
pnpm dev
```

The default local URLs are:

- Frontend: [http://localhost:5173](http://localhost:5173)
- REST API: `http://localhost:3000/api`
- Health check: [http://localhost:3000/health](http://localhost:3000/health)
- WebSocket: `ws://localhost:3000/ws/socket`

### Frontend-only launch (no backend)

To explore the 2D scene without starting PostgreSQL or the backend, run only the client package:

```bash
pnpm --filter client dev
```

The PixiJS office scene renders with placeholder visuals in this mode. Agent data and real-time sync are unavailable because the REST API and the JWT-authenticated WebSocket endpoint are not running, so the scene will not load real agents or tasks.

### Demo Login

Development authentication accepts **any valid UUID** as `workspaceId` together with the default password **`sams123`**. For example:

```text
Workspace ID: 00000000-0000-4000-8000-000000000001
Password:     sams123
```

This shared-password flow is for development only. It does not verify that the supplied workspace exists; use the ID printed or returned by the seed/database when you need to access its persisted agents and tasks.

<a id="-environment-variables"></a>
## ⚙️ Environment Variables

The WebSocket endpoint shares the HTTP server port and is mounted below `/ws`; no separate WebSocket port variable is required.

| Variable | Default | Requirement | Description |
| --- | --- | --- | --- |
| `PORT` | `3000` | Optional | Server HTTP port |
| `HOST` | `0.0.0.0` | Optional | Server bind host |
| `NODE_ENV` | `development` | Optional | Runtime environment, such as `development` or `production` |
| `DATABASE_URL` | — | Required for persistence | PostgreSQL connection string used by Prisma |
| `CLIENT_URL` | `http://localhost:5173` | Optional | Frontend origin allowed by CORS |
| `LOG_LEVEL` | `info` | Optional | Pino log level |
| `JWT_SECRET` | — | **Required in production** | Secret used to sign and verify JWTs; never commit a production value |
| `JWT_EXPIRES_IN` | `24h` | Optional | JWT validity period |
| `AUTH_PASSWORD` | `sams123` | **Development only** | Shared password accepted by the current development login flow |

Example development values:

```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="postgresql://sams:sams_dev@localhost:5432/sams?schema=public"
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
JWT_SECRET=replace-with-a-private-local-secret
JWT_EXPIRES_IN=24h
AUTH_PASSWORD=sams123
```

<a id="-available-scripts"></a>
## 📜 Available Scripts

Run commands from the repository root. Root scripts use pnpm recursive execution and only run in packages that define the corresponding script.

### Root scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the client and server development processes in parallel |
| `pnpm build` | Build all workspace packages in dependency order |
| `pnpm lint` | Run configured package linters |
| `pnpm lint:fix` | Apply safe lint fixes in packages that provide the script |
| `pnpm format` | Format packages with their configured formatter |
| `pnpm typecheck` | Run TypeScript checks across the monorepo |
| `pnpm clean` | Remove generated package output and local build metadata |
| `pnpm test` | Run package test scripts recursively; no real test suite is configured yet |

### Package scripts

| Scope | Command | Description |
| --- | --- | --- |
| Client | `pnpm --filter client dev` | Start the Vite development server |
| Client | `pnpm --filter client build` | Type-check and create the production frontend bundle |
| Client | `pnpm --filter client preview` | Preview the built frontend locally |
| Client | `pnpm --filter client typecheck` | Type-check the React application without emitting files |
| Server | `pnpm --filter server dev` | Start Fastify in watch mode with `tsx` |
| Server | `pnpm --filter server build` | Build shared contracts and compile the server |
| Server | `pnpm --filter server start` | Run the compiled server from `dist/` |
| Server | `pnpm --filter server lint` | Check server code with Biome |
| Server | `pnpm --filter server lint:fix` | Apply Biome fixes to server code |
| Server | `pnpm --filter server format` | Format server code with Biome |
| Server | `pnpm --filter server typecheck` | Type-check the server without emitting files |
| Server | `pnpm --filter server clean` | Remove server build output and local generated metadata |
| Server | `pnpm --filter server db:generate` | Generate the Prisma client |
| Server | `pnpm --filter server db:push` | Synchronize the Prisma schema to the configured database |
| Server | `pnpm --filter server db:seed` | Reset and populate development data through the seed script |
| Server | `pnpm --filter server db:studio` | Open Prisma Studio |
| Shared | `pnpm --filter @sams/shared build` | Compile the shared TypeScript package |
| Shared | `pnpm --filter @sams/shared lint` | Check shared code with Biome |
| Shared | `pnpm --filter @sams/shared lint:fix` | Apply Biome fixes to shared code |
| Shared | `pnpm --filter @sams/shared format` | Format shared code with Biome |
| Shared | `pnpm --filter @sams/shared typecheck` | Type-check shared contracts without emitting files |
| Shared | `pnpm --filter @sams/shared clean` | Remove shared build output and local generated metadata |

> **Note:** The `client` workspace does not define its own `lint`, `lint:fix`, or `format` scripts. It relies on the root-level ESLint + Prettier configuration, so format and lint the client from the repo root via `pnpm format` and `pnpm lint`.

<a id="-api-reference"></a>
## 🔌 API Reference

The local server base URL is `http://localhost:3000`. Resource endpoints use the `/api` prefix. Except for the health check and login endpoint, routes require an `Authorization: Bearer <jwt>` header.

### REST Endpoints

#### Health

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Return server availability and the current server timestamp |

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "timestamp": 1783958400000
}
```

The `timestamp` value is generated at request time in Unix milliseconds.

#### Authentication

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Validate `{ workspaceId, password }` and issue a JWT |

```bash
curl --request POST http://localhost:3000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
    "workspaceId": "00000000-0000-4000-8000-000000000001",
    "password": "sams123"
  }'
```

```json
{
  "token": "<jwt>",
  "userId": "user-00000000-0000-4000-8000-000000000001",
  "workspaceId": "00000000-0000-4000-8000-000000000001"
}
```

Use the returned token for protected requests:

```bash
curl http://localhost:3000/api/workspaces/ \
  --header 'Authorization: Bearer <jwt>'
```

#### Workspaces

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/workspaces/` | List workspaces |
| `GET` | `/api/workspaces/:id` | Get a workspace by UUID |
| `POST` | `/api/workspaces/` | Create a workspace from `name` and optional `projectName` |
| `PATCH` | `/api/workspaces/:id` | Update a workspace name |
| `DELETE` | `/api/workspaces/:id` | Delete a workspace |

```bash
curl --request POST http://localhost:3000/api/workspaces/ \
  --header 'Authorization: Bearer <jwt>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Platform Team","projectName":"SAMS"}'
```

#### Agents

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/agents/` | List agents |
| `GET` | `/api/agents/:id` | Get an agent by UUID |
| `GET` | `/api/agents/workspace/:workspaceId` | List agents in a workspace |
| `POST` | `/api/agents/` | Create an agent |
| `PATCH` | `/api/agents/:id` | Update agent details |
| `PATCH` | `/api/agents/:id/status` | Set `IDLE`, `WALKING`, or `WORKING` status |
| `PATCH` | `/api/agents/:id/position` | Update integer `positionX` and `positionY` coordinates |
| `DELETE` | `/api/agents/:id` | Delete an agent |

```bash
curl http://localhost:3000/api/agents/workspace/<workspace-id> \
  --header 'Authorization: Bearer <jwt>'
```

#### Tasks

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/tasks/` | List tasks |
| `GET` | `/api/tasks/:id` | Get a task by UUID |
| `GET` | `/api/tasks/workspace/:workspaceId` | List tasks in a workspace |
| `POST` | `/api/tasks/` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update task details or assignment |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/:id/assign/:agentId` | Assign a task to an agent |

```bash
curl --request POST \
  http://localhost:3000/api/tasks/<task-id>/assign/<agent-id> \
  --header 'Authorization: Bearer <jwt>'
```

### WebSocket Connection

Connect to the authenticated workspace endpoint on the same port as the HTTP server:

```text
ws://localhost:3000/ws/socket?workspaceId=<uuid>&token=<jwt>
```

A browser client can connect as follows:

```ts
const workspaceId = '<uuid>';
const token = '<jwt>';
const socket = new WebSocket(
  `ws://localhost:3000/ws/socket?workspaceId=${encodeURIComponent(workspaceId)}&token=${encodeURIComponent(token)}`,
);

socket.addEventListener('message', (event) => {
  const message: unknown = JSON.parse(event.data as string);
  console.log(message);
});
```

Client messages use a `type` and `payload`, with an optional `requestId`. Server messages also include a Unix-millisecond `timestamp`.

```json
{
  "type": "subscribe",
  "payload": {
    "workspaceId": "00000000-0000-4000-8000-000000000001"
  },
  "requestId": "request-1"
}
```

### WebSocket Events

The shared event names are defined in `packages/shared/src/constants/socket.events.ts`.

#### Agent events

| Event | Purpose |
| --- | --- |
| `agent:position:update` | Publish or receive agent coordinate changes |
| `agent:status:change` | Notify clients of an agent state transition |
| `agent:created` | Announce a new agent |
| `agent:updated` | Announce general agent changes |
| `agent:deleted` | Announce agent removal |
| `agent:assigned` | Announce an agent assignment |

#### Task events

| Event | Purpose |
| --- | --- |
| `task:created` | Announce a new task |
| `task:updated` | Announce task changes |
| `task:completed` | Announce task completion |
| `task:cancelled` | Announce task cancellation |
| `task:assigned` | Announce assignment to an agent |

#### Workspace events

| Event | Purpose |
| --- | --- |
| `workspace:created` | Announce workspace creation |
| `workspace:updated` | Announce workspace changes |
| `workspace:deleted` | Announce workspace removal |

#### Office events

| Event | Purpose |
| --- | --- |
| `office:created` | Announce office creation within a workspace |
| `office:updated` | Announce office changes |
| `office:deleted` | Announce office removal |

#### Desk events

| Event | Purpose |
| --- | --- |
| `desk:created` | Announce desk creation within an office |
| `desk:updated` | Announce desk changes |
| `desk:deleted` | Announce desk removal |
| `desk:occupancy:change` | Notify clients when a desk is claimed or released by an agent |

#### Connection and subscription events

| Event | Purpose |
| --- | --- |
| `connection` | Confirm an established SAMS WebSocket connection |
| `disconnect` | Represent connection termination |
| `error` | Report authentication, validation, rate-limit, or protocol errors |
| `subscribe` | Request subscription to a workspace channel |
| `unsubscribe` | Request removal from a workspace channel |
| `subscribed` | Confirm a workspace subscription |
| `unsubscribed` | Confirm removal of a workspace subscription |

#### Room events

| Event | Purpose |
| --- | --- |
| `room:join:workspace` | Join a workspace room |
| `room:leave:workspace` | Leave a workspace room |
| `room:join:office` | Join an office room |
| `room:leave:office` | Leave an office room |

<a id="-development"></a>
## 🧪 Development

### Commit conventions

The repository history follows [Conventional Commits](https://www.conventionalcommits.org/), including scoped forms such as `feat(client):` and `feat(security):`. Use short, imperative messages with an appropriate type:

```text
feat: add a user-visible capability
fix: correct faulty behavior
chore: maintain tooling or dependencies
refactor: improve structure without changing behavior
docs: update documentation
test: add or revise automated coverage
```

### Local quality checks

Run the current pre-commit quality gates before opening a pull request:

```bash
pnpm lint && pnpm typecheck
```

Repository-level VS Code recommendations and formatter settings are already included in `.vscode/` for a consistent editing experience.

> **Warning:** Test suite is currently not configured — see [Roadmap](#-roadmap).

The `client/test_*.mjs` files are orphaned ad-hoc browser scripts rather than an integrated test suite. They should be audited and removed when formal automated tests are introduced.

<a id="-roadmap"></a>
## 🗺️ Roadmap

- [ ] Add real unit, integration, and end-to-end tests with Vitest or Jest
- [ ] Replace the shared development password with production-ready user authentication and authorization
- [ ] Add application Dockerfiles and a complete containerized runtime
- [ ] Add pre-commit hooks with Husky and lint-staged
- [ ] Maintain a versioned `CHANGELOG.md`
- [ ] Add a complete `CONTRIBUTING.md`
- [ ] Adopt a `CODE_OF_CONDUCT.md`

> **Note:** `AgentRole` is currently a client-side concept. Adding it to the Prisma schema (so the server and database can persist and broadcast role changes) is on the roadmap.

<a id="-contributing"></a>
## 🤝 Contributing

Contributions, bug reports, and focused improvement proposals are welcome. Please create a branch, follow the [Conventional Commits](https://www.conventionalcommits.org/) format, run the local quality checks, and **open a PR** with a clear description of the problem and solution.

Until a dedicated contribution guide is available, keep pull requests small, document behavior changes, and call out any database or WebSocket contract implications in the PR description.

<a id="-license"></a>
## 📄 License

SAMS is available under the [MIT License](./LICENSE). The root `package.json` also declares the project license as MIT.

<a id="-acknowledgments"></a>
## 🙏 Acknowledgments

SAMS is built on the work of the Fastify, Prisma, React, PixiJS, Vite, Zustand, PostgreSQL, and broader TypeScript open-source communities.

---

<p align="center">
  <a href="https://github.com/Lmz-23/spatial-agent-management-system/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Lmz-23/spatial-agent-management-system?style=social"></a>
  <a href="https://github.com/Lmz-23/spatial-agent-management-system/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/Lmz-23/spatial-agent-management-system?style=social"></a>
  <a href="https://github.com/Lmz-23/spatial-agent-management-system/commits"><img alt="Last commit" src="https://img.shields.io/github/last-commit/Lmz-23/spatial-agent-management-system"></a>
</p>
