---
name: project-sams-readme-gaps
description: SAMS README accuracy work (2026-09-07) — implementation/documentation gaps found by reading actual code, not just diffs
metadata:
  type: project
---

While auditing `/home/lmz/Proyectos/sams/README.md` against source (2026-09-07), found several places where SAMS's implementation silently diverges from what its own validation schemas / shared contracts promise. These are easy to miss from git history alone — they only show up by tracing DTOs → services → repositories.

Confirmed gaps (fixed in README, still open in code as of that date):
- `PATCH /api/tasks/:id`: Zod schema (`updateTaskSchema`) accepts `priority` and `assignedAgentId`, but `UpdateTaskDto` (`server/src/modules/tasks/dto/update-task.dto.ts`) only has `title/description/status`, and `TasksRepository.update()` only persists those three fields. `priority`/`assignedAgentId` are silently dropped, not rejected.
- `Agent.role` is a required Prisma enum field (16 values, e.g. `BACKEND_CODER`, `REVIEWER`) but `AgentsRepository.create()` hardcodes `role: AgentRole.ORCHESTRATOR`; it's absent from `AgentResponseDto` and from `createAgentSchema`/`updateAgentSchema`. Only `prisma/seed.ts` sets varied roles (direct Prisma writes). This Prisma `AgentRole` is unrelated to the client's own cosmetic `AgentRole` type in `client/src/office/Agent.ts` (4 values: ORQUESTADOR/CODER/REVIEWER/TESTER, used only for PixiJS coloring/sizing) — same name, two disconnected concepts.
- `packages/shared/src/constants/socket.events.ts` (`SOCKET_EVENTS`/`ROOM_EVENTS`) declares many events that are never emitted/handled: all `workspace:*`, `office:*`, `desk:*`, `agent:updated`, `agent:assigned`, `task:updated`, `task:completed`, `task:cancelled`, `task:assigned`, `room:join:office`/`room:leave:office`, `disconnect`. The corresponding factory helpers in `server/src/modules/websocket/websocket.service.ts` (`createAgentHandlers`, `createTaskHandlers`, `createWorkspaceHandlers`) exist but are never called from any module — dead code. There are also no `Office`/`Desk` Prisma models or REST routes at all.
- Actual runtime WS event names used by `tasks.service.ts`/`agents.service.ts` are literal strings that don't match the `SOCKET_EVENTS` constants: `agent:status:update` (constant says `agent:status:change`), `task:status:update`/`task:deleted`/`task:event` (constants only declare `task:updated`/`task:completed`/`task:cancelled`/`task:assigned`, none of which are actually broadcast).

**Why:** Useful next time this repo's README or API docs need auditing — check these same spots first since they're the known-stale areas, and don't trust `SOCKET_EVENTS`/Zod schemas alone as proof that a field/event is actually wired — always trace into the DTO type and the concrete service/repository code that consumes it.

**How to apply:** If revisiting SAMS docs later, re-verify these are still gaps (or confirm they were fixed) before citing this memory as current fact.
