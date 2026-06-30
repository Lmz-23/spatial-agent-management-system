import type { FastifyInstance } from 'fastify';
import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { AgentsRepository } from './agents.repository.js';

export interface AgentsModuleOptions {
  prefix?: string;
}

export async function agentsModule(
  fastify: FastifyInstance,
  options: AgentsModuleOptions,
): Promise<void> {
  const repository = new AgentsRepository(fastify.prisma!);
  const service = new AgentsService(repository, fastify.prisma!, fastify.wsService);
  const controller = new AgentsController(service);

  // Routes are mounted at /api/agents (see app.ts)
  fastify.get('/', controller.getAll.bind(controller));
  fastify.get('/:id', controller.getById.bind(controller));
  fastify.get('/workspace/:workspaceId', controller.getByWorkspace.bind(controller));
  fastify.post('/', controller.create.bind(controller));
  fastify.patch('/:id', controller.update.bind(controller));
  fastify.patch('/:id/status', controller.updateStatus.bind(controller));
  fastify.patch('/:id/position', controller.updatePosition.bind(controller));
  fastify.delete('/:id', controller.remove.bind(controller));
}

export default agentsModule;
